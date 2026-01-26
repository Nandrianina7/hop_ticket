import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Person,
  Theaters,
  PriceCheck,
  MeetingRoom,
  Event,
  CheckCircle,
  Cancel,
  Close,
} from '@mui/icons-material';
import { calculateTotalPrice, formatCurrency, getStatusColor } from '../utils/tickets';

const CustoTickets = ({ open, onClose, customer }) => {
  if (!customer) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{
        backdrop: Backdrop,
      }}
      slotProps={{
        backdrop: { timeout: 500 },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            maxWidth: '70%',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            overflow: 'auto',
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Ticket information
            </Typography>
            <IconButton onClick={onClose} size="large">
              <Close />
            </IconButton>
          </Box>

          <Paper
            sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {customer.email}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {customer.tickets.length} tickets •{' '}
                  {formatCurrency(calculateTotalPrice(customer.tickets))} total
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {customer.tickets.map((ticket, index) => (
              <Grid item xs={12} md={6} key={ticket.id || index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderLeft: '4px solid',
                    borderColor: ticket.is_used ? 'success.main' : 'primary.main',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      mb: 2,
                    }}
                  >
                    <Chip
                      icon={ticket.is_used ? <CheckCircle /> : <Cancel />}
                      label={ticket.is_used ? 'Utilisé' : 'Non Utilisé'}
                      color={ticket.is_used ? 'success' : 'default'}
                    />
                    <Chip
                      label={ticket.status == 'purchased' ? 'payé' : 'non payé' || 'Unknown'}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </Box>
                  <List dense>
                    {[
                      {
                        icon: <Theaters color="primary" />,
                        primary: 'Film',
                        second: ticket.movie_title,
                      },
                      {
                        icon: <PriceCheck color="primary" />,
                        primary: 'Prix',
                        second: formatCurrency(ticket.price),
                      },
                      {
                        icon: <MeetingRoom color="primary" />,
                        primary: 'Salle',
                        second: ticket.hall_name,
                      },
                      {
                        icon: <Theaters color="primary" />,
                        primary: 'Cinema',
                        second: ticket.cinema_name,
                      },
                      {
                        icon: <Event color="primary" />,
                        primary: 'date d\'achat ',
                        second: ticket.purchase_date
                          ? new Date(ticket.purchase_date).toLocaleString()
                          : 'Unknown',
                      },
                    ].map((lists, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>{lists.icon}</ListItemIcon>
                        <ListItemText primary={lists.primary} secondary={lists.second} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CustoTickets;
