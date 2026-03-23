import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputLabel,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Seat from '../Seat/Seat';
import { Add, Close, DeleteOutline } from '@mui/icons-material';
import DeleteDialog from '../../../ui/DeleteDialog';
import { getCookie } from '../../../utils/getCookie';

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>{value === index && <Box sx={{ p: 2 }}>{children}</Box>}</div>
  );
};

const Halls = ({
  onAddCinema,
  cinemaList,
  onCreateHallSeats,
  onGetCinemaHalls,
  onDeleteCinema,
  onUpdateCinemaHall,
  allowedAction = true,
}) => {
  const [open, setOpen] = React.useState(false);
  const [cinemaIndex, setCinemaIndex] = React.useState(0);
  const [selectedCinema, setSelectedCinema] = React.useState(null);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [cinemaHalls, setCinemaHalls] = React.useState([]);
  const [hallIndex, setHallIndex] = React.useState(0);
  const [openDelete, setOpenDelete] = React.useState(false);
  const theme = useTheme();
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    opening_hours: '',
  });
  const onClose = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      opening_hours: '',
    });
    setOpen(false);
  };

  const handleFormData = (e) => {
    const { value, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCinemaChange = (event, newIndex) => {
    setCinemaIndex(newIndex);
    setSelectedCinema(cinemaList[newIndex]);
    setHallIndex(0);
  };

  const handleHallChange = (event, newIndex) => {
    setHallIndex(newIndex);
  };
  const toggleOpen = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };

  const deleteCinema = async () => {
    await onDeleteCinema(selectedCinema?.id);
    setOpenDelete(false);
  };

  const handleUpdate = async (id, layout) => {
    await onUpdateCinemaHall(id, layout);
    await onGetCinemaHalls(selectedCinema?.id);
  };
  const handleSaveHallSeats = (formdata) => {
    console.log('This the form', formdata);

    onCreateHallSeats(formdata);
    setOpenDrawer(false);
  };

  const role = getCookie('user_role');
  React.useEffect(() => {
    const showCinemaHalls = async () => {
      if (selectedCinema) {
        const res = await onGetCinemaHalls(selectedCinema.id);
        setCinemaHalls(res.data.halls || []);
        console.log('halls', res.data.halls);
      }
    };
    showCinemaHalls();
  }, [selectedCinema]);

  React.useEffect(() => {
    if (cinemaList && cinemaList.length > 0) {
      setSelectedCinema(cinemaList[0]);
    }
  }, [cinemaList]);
  const CreateCinemaForm = (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle id="Create halls">{'Create a new cinema'}</DialogTitle>
      <DialogContent id="Create halls" sx={{ display: 'flex' }}>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[
            { name: 'name', label: 'name', value: formData.name, type: 'text' },
            { name: 'address', label: 'address', value: formData.address, type: 'text' },
            { name: 'city', label: 'city emplacement', value: formData.city, type: 'text' },
            {
              name: 'phone',
              label: 'property phone number',
              value: formData.phone,
              type: 'number',
            },
            { name: 'email', label: 'property email', value: formData.email, type: 'text' },
            {
              name: 'opening_hours',
              label: 'opening hours',
              value: formData.opening_hours,
              type: 'text',
            },
          ].map((item, index) => (
            <Grid key={index}>
              <FormControl>
                <InputLabel htmlFor={item.name}>Cinema {item.label}</InputLabel>
                <Input
                  type={item.type}
                  id={item.name}
                  name={item.name}
                  value={item.value}
                  onChange={handleFormData}
                  size="small"
                  autoComplete="fill"
                  sx={{ width: 250 }}
                />
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onAddCinema(formData);
            onClose();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
  const CreateHallDrawer = (
    <Drawer
      anchor="right"
      open={openDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: '80%',
          marginTop: '60px',
        },
      }}
      onClose={toggleOpen(false)}
    >
      <Seat
        id={selectedCinema?.id}
        onSaveHall={handleSaveHallSeats}
        type="create"
        allowedAction={true}
      />
      <Box sx={{ display: 'flex', position: 'absolute', top: 2, right: 2 }}>
        <IconButton onClick={toggleOpen(false)}>
          <Close />
        </IconButton>
      </Box>
    </Drawer>
  );
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '5px',
        mt: 1,
        pb: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Tabs
          value={cinemaIndex}
          onChange={handleCinemaChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="cinema tabs"
        >
          {cinemaList.map((item) => (
            <Tab key={item.id} label={item.name} />
          ))}
        </Tabs>

        {allowedAction && (
          <Box sx={{ display: 'flex', gap: 2, p: 1 }}>
            {role !== 'organizer' && (
              <Button onClick={() => setOpen(true)} variant="outlined">
                Add a new cinema
              </Button>
            )}
            {selectedCinema?.name && (
              <React.Fragment>
                <Tooltip title={`Crée une nouvelle salle pour ${selectedCinema.name}`}>
                  <IconButton onClick={toggleOpen(true)} sx={{ bgcolor: 'rgba(171, 15, 15, 0.2)' }}>
                    <Add color="primary" />
                  </IconButton>
                </Tooltip>
                {/* <Tooltip title={`Delete ${selectedCinema.name}`}>
                <IconButton onClick={() => setOpenDelete(true)}>
                  <DeleteOutline color="primary" />
                </IconButton>
              </Tooltip> */}
              </React.Fragment>
            )}
          </Box>
        )}
      </Paper>

      {cinemaHalls.length > 0 ? (
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={hallIndex}
            onChange={handleHallChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="hall tabs"
          >
            {cinemaHalls.map((hall) => (
              <Tab key={hall.id} label={hall.name} />
            ))}
          </Tabs>

          {cinemaHalls.map((hall, index) => (
            <TabPanel key={hall.id} value={hallIndex} index={index}>
              {hall.seats.map((seat, index) => (
                <Seat
                  id={selectedCinema?.id}
                  initialLayout={{
                    rows: Number(seat.rows),
                    cols: Number(seat.cols),
                    disabledSeats: seat.disabledSeats,
                    VIPSeats: seat.VIPSeats,
                    name: hall.name,
                    screen_type: hall.screen_type,
                  }}
                  onUpdateHall={handleUpdate}
                  hall_id={hall.id}
                  type="display"
                  allowedAction={allowedAction}
                />
              ))}
            </TabPanel>
          ))}
        </Box>
      ) : (
        <Paper
          sx={{
            width: '90%',
            mt: 3,
            background: theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 9,
          }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight="bold">
            Aucune salle n'a encore été créée pour ce cinéma.
          </Typography>
          {selectedCinema?.name && (
            <Button variant="contained" onClick={toggleOpen(true)}>
              Crée une nouvelle salle pour {selectedCinema.name || '...'}
            </Button>
          )}
        </Paper>
      )}
      <DeleteDialog
        open={openDelete}
        handleClose={() => setOpenDelete(false)}
        onClick={deleteCinema}
      />
      {CreateHallDrawer}
      {CreateCinemaForm}
    </Box>
  );
};

export default Halls;
