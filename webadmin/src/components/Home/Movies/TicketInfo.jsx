import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Chip,
  Paper,
  Grid,
  Stack,
} from '@mui/material';
import {
  LocalMovies,
  Theaters,
  ConfirmationNumber,
  AccessTime,
  CalendarToday,
  Chair,
  Fastfood,
  AttachMoney,
} from '@mui/icons-material';

const TicketInfo = ({ open, onClick, ticket }) => {
  if (!ticket) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente':
        return 'warning';
      case 'Confirmé':
        return 'success';
      case 'Annulé':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClick}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          background: 'linear-gradient(135deg, #ea6671 0%, #a24b6c 100%)',
          color: 'white',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ConfirmationNumber />
          <Typography variant="h6">
            Informations du ticket -{' '}
            {ticket.customer_name + ' ' + ticket.customer_last_name || 'Client'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, mt: 2 }}>
        <Box sx={{ p: 3 }}>
          {/* Ticket Header */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {ticket.movie_title}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Chip
                    icon={<LocalMovies />}
                    label={ticket.cinema_name}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<Theaters />}
                    label={ticket.hall_name}
                    size="small"
                    variant="outlined"
                  />
                  <Chip label={ticket.status} color={getStatusColor(ticket.status)} size="small" />
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Show Details */}
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Détails de la séance
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>Date:</strong> {formatDate(ticket.show_date)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTime color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>Heure:</strong> {ticket.show_time_only}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTime color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>Durée:</strong> {ticket.movie_duration} minutes
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chair color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>Siège:</strong> {ticket.seat}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Commands Section */}
          {ticket.commands && ticket.commands.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Commandes
              </Typography>
              {ticket.commands.map((command, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                    Commande #{command.order_id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Créée le: {command.created_at}
                  </Typography>

                  {command.items && command.items.length > 0 && (
                    <>
                      <Typography variant="body2" fontWeight="bold" mt={1}>
                        Articles:
                      </Typography>
                      {command.items.map((item, itemIndex) => (
                        <Box key={itemIndex} sx={{ ml: 2, mt: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Fastfood fontSize="small" color="action" />
                              <Typography variant="body2">
                                {item.name} x {item.quantity}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="bold">
                              {parseInt(item.unit_price) * item.quantity} Ar
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                      <Divider sx={{ my: 1 }} />
                      {[
                        { label: 'Total commande:', value: `${command.total} Ar` },
                        { label: 'Prix de ticket:', value: `${ticket.price} Ar` },
                        {
                          label: 'Total:',
                          value: `${Number(ticket.price) + Number(command.total)} Ar`,
                        },
                      ].map((item, index) => (
                        <Stack key={index} direction="row" justifyContent="space-between" mt={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {item.label}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {item.value}
                          </Typography>
                        </Stack>
                      ))}
                    </>
                  )}
                  {command.special_instructions && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      <strong>Instructions spéciales:</strong> {command.special_instructions}
                    </Typography>
                  )}
                </Paper>
              ))}
            </>
          )}

          {/* Ticket Code */}
          <Divider sx={{ my: 2 }} />
          <Box
            sx={{
              bgcolor: '#f0f0f0',
              p: 2,
              borderRadius: 2,
              textAlign: 'center',
              fontFamily: 'monospace',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Code du ticket
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-all' }}>
              {ticket.ticket_code}
            </Typography>
          </Box>

          {/* Pickup Time if available */}
          {ticket.pickup_time && (
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                Heure de retrait:
              </Typography>
              <Typography variant="body2">{ticket.pickup_time}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TicketInfo;
