import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import EventInfo from './EventInfo';
import UserDialog from './UserDialog';

const Commission = ({ tickets = [], getEventInfo, getUserInfo }) => {
  const totalOwner = tickets.reduce((acc, t) => acc + parseFloat(t.owner_earnings), 0);
  const totalOrganizer = tickets.reduce((acc, t) => acc + parseFloat(t.organizer_earnings), 0);
  const [event, setEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [userAnchor, setUserAnchor] = useState(null);
  const openCustoInfo = Boolean(userAnchor);
  const [customer, setCustomer] = useState(null);
  const handleShowEventInfo = async (eventId, e) => {
    setAnchorEl(e.currentTarget);

    try {
      const result = await getEventInfo(eventId);
      const data = result?.data || null;

      setEvent(data);
    } catch (err) {
      console.log(err);
      setEvent(null);
    }
  };

  const handleShowCustomerInfo = async (customer, event) => {
    setUserAnchor(event.currentTarget);

    try {
      const result = await getUserInfo(customer);
      const data = result?.data || null;
      setCustomer(data);
    } catch (error) {
      console.log(error);
      setCustomer(null);
    }
  };
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }} elevation={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Gain de l'application
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="error">
            {totalOwner.toFixed(2)} MGA
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }} elevation={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Gain des organisateurs
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {totalOrganizer.toFixed(2)} MGA
          </Typography>
        </Paper>
      </Stack>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Evenement</TableCell>
              <TableCell>Ticket type</TableCell>
              <TableCell>Prix (MGA)</TableCell>
              <TableCell>Application (MGA)</TableCell>
              <TableCell>Organisateur (MGA)</TableCell>
              <TableCell>Date d'achat</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket, index) => (
              <TableRow key={ticket.id}>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={(e) => handleShowCustomerInfo(ticket.customer_id, e)}
                >
                  {ticket.customer_name}
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={(event) => handleShowEventInfo(ticket.event_id, event)}
                >
                  {ticket.event_name}
                </TableCell>
                <TableCell>{ticket.tier || '-'}</TableCell>
                <TableCell>{parseFloat(ticket.price).toFixed(2)}</TableCell>
                <TableCell>{parseFloat(ticket.owner_earnings).toFixed(2)}</TableCell>
                <TableCell>{parseFloat(ticket.organizer_earnings).toFixed(2)}</TableCell>
                <TableCell>{new Date(ticket.purchase_date).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <EventInfo open={open} onClose={() => setAnchorEl(null)} anchorEl={anchorEl} event={event} />
      <UserDialog
        info={customer}
        open={openCustoInfo}
        onClose={() => setUserAnchor(null)}
        anchorEl={userAnchor}
      />
    </Box>
  );
};

export default Commission;
