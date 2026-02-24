import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
  DialogActions,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for selectable
// import moment from "moment";
import MovieSessionSeat from './MovieSessionSeat';

const localizer = momentLocalizer(moment);

// Composant ErrorBoundary pour gérer les erreurs
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <h3>Something went wrong with the calendar</h3>
          <p>Please try refreshing the page or contact support.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '8px 16px', marginTop: '10px' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fonction utilitaire pour obtenir une plage horaire valide
const getValidTimeRange = (openingHours) => {
  try {
    const [openHour, closeHour] = openingHours.split('-').map((t) => t.trim());

    if (!openHour || !closeHour) {
      throw new Error('Invalid opening hours format');
    }

    const minTime = new Date();
    minTime.setHours(parseInt(openHour.split(':')[0]), parseInt(openHour.split(':')[1]), 0, 0);

    const maxTime = new Date();
    maxTime.setHours(parseInt(closeHour.split(':')[0]), parseInt(closeHour.split(':')[1]), 0, 0);

    // Valider que les heures sont des objets Date valides
    if (isNaN(minTime.getTime()) || isNaN(maxTime.getTime())) {
      throw new Error('Invalid time values');
    }

    return { minTime, maxTime };
  } catch (error) {
    console.warn('Invalid opening hours format, using defaults', error);
    // Retourner des valeurs par défaut sûres
    const minTime = new Date();
    minTime.setHours(8, 0, 0, 0);
    const maxTime = new Date();
    maxTime.setHours(23, 0, 0, 0);
    return { minTime, maxTime };
  }
};

const MovieSession = ({
  open,
  onClose,
  handleSave,
  movie,
  cinema = [],
  existingSessions = [],
  type,
  fetchSessionSeat,
  onSavePCode,
}) => {
  const [sessions, setSessions] = React.useState([]);

  // État pour le formulaire
  const [currentSession, setCurrentSession] = React.useState({
    hall: '',
    start_time: '',
    end_time: '',
    base_price: '',
    vip_price: '',
  });

  const [selectedEvent, setSelectedEvent] = useState();
  const [openSessionSeat, setOpenSessionSeat] = useState(false);
  const theme = useTheme();

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setCurrentSession((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSession = () => {
    if (!currentSession.hall || !currentSession.start_time || !currentSession.end_time) {
      alert('Please fill all fields');
      return;
    }

    const newSession = {
      id: Date.now(),
      hall: currentSession.hall,
      start_time: currentSession.start_time,
      end_time: currentSession.end_time,
      movie: movie?.id,
      title: movie?.title || 'Movie Session',
      base_price: currentSession.base_price,
      vip_price: currentSession.vip_price,
    };

    setSessions((prev) => [...prev, newSession]);
    setCurrentSession({ hall: '', start_time: '', end_time: '', base_price: '', vip_price: '' });
  };

  const removeSession = (sessionId) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
  };

  const handleSubmit = () => {
    if (sessions.length === 0) {
      alert('Please add at least one session');
      return;
    }
    handleSave(sessions);
    setSessions([]);
    onClose();
  };

  const handleClose = () => {
    setSessions([]);

    setCurrentSession({ hall: '', start_time: '', end_time: '', base_price: '', vip_price: '' });
    onClose();
  };

  const onOpenSessionSeat = (event, e) => {
    e?.stopPropagation();
    setOpenSessionSeat(true);
    setSelectedEvent(event);
    onClose();
  };

  const onCreatePCode = (formData) => {
    onSavePCode(formData, selectedEvent?.id);
  };

  let initialDate;

  if (type === 'create') {
    initialDate = moment().add(1, 'week').toDate();
  } else {
    if (existingSessions.length > 0) {
      initialDate = moment(existingSessions[0].start_time).toDate();
    } else {
      initialDate = new Date();
    }
  }

  const [currentDate, setCurrentDate] = useState(initialDate);
  const openingHours = cinema[0]?.opening_hours || '08:00-23:00';

  // Utiliser la fonction corrigée pour obtenir minTime et maxTime
  const { minTime, maxTime } = getValidTimeRange(openingHours);

  // Calcul automatique des événements.
  // Ne se recalcule que si existingSessions, sessions, movie ou cinema changent.
  const calendarEvents = useMemo(() => {
    // Fonction helper pour forcer la date en local (tel qu'écrit dans le formulaire)
    const toLocalDate = (dateString) => {
      if (!dateString) return new Date();
      // On enlève le 'Z' final s'il existe pour empêcher l'interprétation UTC
      // On s'assure ainsi que "10:00" reste "10:00" quel que soit le fuseau horaire
      const cleanDate = dateString.replace('Z', '');
      return new Date(cleanDate);
    };

    const mappedExisting = existingSessions.map((session) => {
      const hall = cinema.flatMap((c) => c.halls).find((h) => h.id === session.hall);
      console.log('mapping existing session', session);
      return {
        id: session.id || `existing-${session.start_time}`,
        title: `${hall?.name || session.hall} - ${session.movie?.title || 'Movie'}`,
        // UTILISEZ LA FONCTION ICI
        start: toLocalDate(session.start_time),
        end: toLocalDate(session.end_time),
        resource: session,
        backgroundColor: '#3788d8',
      };
    });

    const mappedNew = sessions.map((session) => {
      const hall = cinema.flatMap((c) => c.halls).find((h) => h.id === session.hall);
      return {
        id: session.id,
        title: `NEW: ${hall?.name || 'Hall'}`,
        // ET ICI
        start: toLocalDate(session.start_time),
        end: toLocalDate(session.end_time),
        resource: session,
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
      };
    });

    // ... logic for currentPending ...
    const currentPending =
      currentSession.start_time && currentSession.end_time
        ? [
            {
              id: 'temp-preview',
              title: 'Selected',
              start: toLocalDate(currentSession.start_time),
              end: toLocalDate(currentSession.end_time),
              backgroundColor: '#ff9800',
              display: 'block',
            },
          ]
        : [];

    return [...mappedExisting, ...mappedNew, ...currentPending];
  }, [
    existingSessions,
    sessions,
    cinema,
    movie,
    currentSession.start_time,
    currentSession.end_time,
  ]);

  // --- CORRECTION DU HANDLE SELECT ---
  const handleSelect = (selectInfo) => {
    const start = moment(selectInfo.start);
    const end = movie?.duration
      ? start.clone().add(movie.duration, 'minutes')
      : moment(selectInfo.end);

    // Mettre à jour uniquement le formulaire.
    // Le useMemo détectera le changement et mettra à jour le calendrier automatiquement.
    setCurrentSession((prev) => ({
      ...prev,
      start_time: start.format('YYYY-MM-DDTHH:mm'),
      end_time: end.format('YYYY-MM-DDTHH:mm'),
    }));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '80vh' } }}
      >
        <DialogTitle>
          Calendrier des sceance - {movie?.title} {`(${movie?.duration} min)`}
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', gap: 2, height: '100%' }}>
          <Box sx={{ flex: 2 }}>
            <ErrorBoundary>
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridWeek,timeGridDay',
                }}
                timeZone="local"
                allDaySlot={false} // hide all-day row
                slotMinTime="09:00:00"
                slotMaxTime="23:00:00"
                slotDuration="00:30:00"
                selectable={true}
                selectMirror={true}
                select={handleSelect}
                events={calendarEvents}
                eventClick={(info) => {
                  console.log('here is the event', info.event.extendedProps.resource);
                  onOpenSessionSeat(info.event.extendedProps.resource);
                }}
                eventColor={theme.palette.info.dark} // same color as your MUI theme
                height="100%"
                event
                // validRange={{
                //   start: moment(currentDate).startOf("day").toISOString(),
                // }}
                datesSet={(info) => {
                  const newDate = moment(info.start).toDate();
                  if (currentDate.getTime() !== newDate.getTime()) {
                    setCurrentDate(newDate);
                  }
                }}
                // update currentDate when navigating
              />
            </ErrorBoundary>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ajouter nouvelle page
              </Typography>

              <Select
                value={currentSession.hall}
                onChange={handleInputChange}
                name="hall"
                fullWidth
                displayEmpty
                sx={{ mb: 2 }}
              >
                <MenuItem value="">Selection de salle</MenuItem>
                {cinema.map((cinemaItem) =>
                  cinemaItem.halls.map((hall) => (
                    <MenuItem key={hall.id} value={hall.id}>
                      {hall.name} - {cinemaItem.name}
                    </MenuItem>
                  ))
                )}
              </Select>

              <TextField
                label="debut"
                type="datetime-local"
                name="start_time"
                value={currentSession.start_time}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />

              <TextField
                label="fin"
                type="datetime-local"
                name="end_time"
                value={currentSession.end_time}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />
              <TextField
                type="number"
                label="prix de base"
                name="base_price"
                value={currentSession.base_price}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                type="number"
                label="prix vip"
                name="vip_price"
                value={currentSession.vip_price}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                onClick={addSession}
                variant="contained"
                fullWidth
                startIcon={<Add />}
                sx={{ mb: 1 }}
                color="info"
              >
                Ajouter la séance
              </Button>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Scéance programmés ({sessions.length})
              </Typography>

              {sessions.length === 0 ? (
                <Typography color="textSecondary">No sessions added yet</Typography>
              ) : (
                <List>
                  {sessions.map((session, index) => {
                    const hall = cinema.flatMap((c) => c.halls).find((h) => h.id === session.hall);
                    return (
                      <ListItem key={session.id} divider>
                        <ListItemText
                          primary={`Session ${index + 1}`}
                          slotProps={{ secondary: { component: 'div' } }}
                          secondary={
                            <>
                              <div>Hall: {hall?.name}</div>
                              <div>prix de Base: {session.base_price}</div>
                              <div>prix VIP: {session.vip_price}</div>
                              <div>
                                Debut: {moment(session.start_time).format('MMM D, YYYY HH:mm')}
                              </div>
                              <div>Fin: {moment(session.end_time).format('MMM D, YYYY HH:mm')}</div>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => removeSession(session.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={sessions.length === 0}>
            enregister tout le sceance ({sessions.length})
          </Button>
        </DialogActions>
      </Dialog>
      <MovieSessionSeat
        session={selectedEvent?.id}
        open={openSessionSeat}
        onClose={() => setOpenSessionSeat(false)}
        fetchSeats={fetchSessionSeat}
        onSavePCode={onCreatePCode}
      />
    </>
  );
};

export default MovieSession;
