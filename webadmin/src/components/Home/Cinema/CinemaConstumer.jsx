import { useState } from 'react';
import { Box, Typography, Paper, Avatar, Chip, Divider } from '@mui/material';
import { LocalMovies, Person, ConfirmationNumber, PriceCheck } from '@mui/icons-material';
import { calculateTotalPrice, formatCurrency, getUniqueHallsCinemas } from '../../../utils/tickets';
import CustoTickets from '../../../ui/CustoTickets';

const CinemaConsumer = ({ tickets = [] }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const groupedByMovie = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.movie_title]) {
      acc[ticket.movie_title] = [];
    }
    acc[ticket.movie_title].push(ticket);
    return acc;
  }, {});

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCustomer(null);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        🎟️ tickets des clients ({tickets.length} total)
      </Typography>

      {Object.entries(groupedByMovie).map(([movieTitle, movieTickets]) => {
        const groupedByCustomer = movieTickets.reduce((acc, ticket) => {
          if (!acc[ticket.customer_email]) {
            acc[ticket.customer_email] = {
              email: ticket.customer_email,
              tickets: [],
            };
          }
          acc[ticket.customer_email].tickets.push(ticket);
          return acc;
        }, {});

        return (
          <Paper
            key={movieTitle}
            elevation={2}
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <LocalMovies />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {movieTitle}
                </Typography>
                {/* <Typography variant="body2" color="text.secondary">
                  {movieTickets.length} Tickets {movieTickets.length > 1 ? '' : ''} de {' '}
                  {Object.keys(groupedByCustomer).length} clients
                  {Object.keys(groupedByCustomer).length > 1 ? '' : ''}
                </Typography> */}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {Object.values(groupedByCustomer).map((customer) => {
              const totalPrice = calculateTotalPrice(customer.tickets);

              return (
                <Paper
                  key={customer.email}
                  elevation={1}
                  onClick={() => handleCustomerClick(customer)}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 40, height: 40 }}>
                        <Person />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                          {customer.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getUniqueHallsCinemas(customer.tickets)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        icon={<PriceCheck />}
                        label={formatCurrency(totalPrice)}
                        color="primary"
                        variant="filled"
                        sx={{ fontWeight: 'bold', minWidth: 100 }}
                      />
                      <Chip
                        icon={<ConfirmationNumber />}
                        label={`${customer.tickets.length} tickets ${customer.tickets.length > 1 ? '' : ''}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Paper>
        );
      })}

      <CustoTickets open={openModal} onClose={handleCloseModal} customer={selectedCustomer} />

      {tickets.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No ticket found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Buyed ticket will appear here
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CinemaConsumer;
