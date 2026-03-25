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
  TablePagination,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import EventInfo from './EventInfo';
import UserDialog from './UserDialog';

const Commission = ({
  tickets = [],
  getEventInfo,
  getUserInfo,
  fetchTickets,
  totalCount = 0,
  loading = false,
  organizerEarn = 0,
  ownerEarn = 0,
}) => {
  const totalOwner = tickets.reduce((acc, t) => acc + parseFloat(t.owner_earnings), 0);
  const totalOrganizer = tickets.reduce((acc, t) => acc + parseFloat(t.organizer_earnings), 0);
  const [event, setEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [userAnchor, setUserAnchor] = useState(null);
  const openCustoInfo = Boolean(userAnchor);
  const [customer, setCustomer] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (fetchTickets) {
      fetchTickets(page, rowsPerPage);
    }
  }, [page, rowsPerPage]);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }} elevation={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Gain de l'application
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="error">
            {ownerEarn.toFixed(2)} MGA
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }} elevation={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Gain des organisateurs
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {organizerEarn.toFixed(2)} MGA
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Aucun ticket trouvé</Typography>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
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
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          disabled={loading}
        />
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
