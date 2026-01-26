import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Chip,
  Avatar,
  Stack,
  Card,
  CardHeader,
  CardContent,
  alpha,
  TablePagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useState } from 'react';
import CostumerInfo from '../../../ui/CostumerInfo';
import SearchIcon from '@mui/icons-material/Search';
import { stringToColor } from '../../../utils/stringToColor';
import dayjs from 'dayjs';

const Constumer = ({ data, isLoading }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('tous');
  const [paginationStates, setPaginationStates] = useState({});

  const onOpenInfo = (item) => {
    setItem(item);
    setOpen(true);
  };

  const onCloseInfo = () => {
    setOpen(false);
    setItem(null);
  };

  const handleChangePage = (eventId, newPage) => {
    setPaginationStates((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        page: newPage,
      },
    }));
  };

  const handleChangeRowsPerPage = (eventId, event) => {
    setPaginationStates((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        page: 0,
        rowsPerPage: parseInt(event.target.value, 10),
      },
    }));
  };

  const dataGroupedByEvent = data.reduce((acc, item) => {
    const eventId = item.event.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        eventName: item.event.name,
        eventDate: item.event.date,
        customers: [],
      };

      if (!paginationStates[eventId]) {
        setPaginationStates((prev) => ({
          ...prev,
          [eventId]: {
            page: 0,
            rowsPerPage: 5,
          },
        }));
      }
    }
    acc[eventId].customers.push(item);
    return acc;
  }, {});

  const filteredEvents = Object.entries(dataGroupedByEvent).filter(([_, group]) => {
    const matchfilter = group.eventName.toLowerCase().includes(searchTerm.toLowerCase());

    if (searchType === 'tous') return matchfilter;
    if (searchType === 'a venir') {
      return matchfilter && new Date(group.eventDate) >= new Date();
    } else if (searchType === 'passés') {
      return matchfilter && new Date(group.eventDate) < new Date();
    }
  });

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          background: theme.palette.background.default,
        }}
      >
        <CircularProgress color="primary" size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: theme.palette.background.default }}>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          {['tous', 'a venir', 'passés'].map((option) => (
            <Chip
              key={option}
              label={option}
              variant={searchType === option ? 'filled' : 'outlined'}
              color={searchType === option ? 'primary' : 'default'}
              size="small"
              sx={{ ml: 1, cursor: 'pointer' }}
              onClick={() => {
                setSearchType(option);
                setSearchTerm('');
              }}
            />
          ))}
        </Box>
        <TextField
          variant="outlined"
          placeholder="rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 1,
              backgroundColor: theme.palette.background.paper,
              '& fieldset': {
                borderColor: alpha(theme.palette.divider, 0.2),
              },
            },
          }}
          sx={{ width: '300px' }}
          size="small"
        />
      </Box>

      {filteredEvents.length > 0 ? (
        <Stack spacing={4}>
          {filteredEvents.map(([eventId, group]) => {
            const paginationState = paginationStates[eventId] || { page: 0, rowsPerPage: 5 };
            const { page, rowsPerPage } = paginationState;
            const startIdx = page * rowsPerPage;
            const endIdx = startIdx + rowsPerPage;
            const paginatedCustomers = group.customers.slice(startIdx, endIdx);

            return (
              <Card
                key={eventId}
                elevation={0}
                sx={{
                  borderRadius: 4,
                  background: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" fontWeight="600">
                      {group.eventName}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(group.eventDate).format('MMM D, YYYY')}
                    </Typography>
                  }
                  sx={{
                    background: alpha(stringToColor(group.eventName), 0.1),
                    borderBottom: `1px solid ${alpha(stringToColor(group.eventName), 0.1)}`,
                  }}
                />
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow
                          sx={{
                            background: alpha(theme.palette.primary.main, 0.02),
                            '& th': {
                              fontWeight: 600,
                              color: theme.palette.text.secondary,
                              fontSize: '0.875rem',
                              py: 2,
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            },
                          }}
                        >
                          <TableCell>Client</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Ticket</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedCustomers.map((customer, index) => (
                          <TableRow
                            key={index}
                            hover
                            onClick={() => onOpenInfo(customer)}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:last-child td': { border: 0 },
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.03),
                              },
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: stringToColor(customer.customer?.last_name),
                                    color: theme.palette.primary.contrastText,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {getInitials(customer.customer?.last_name)}
                                </Avatar>
                                <Typography fontWeight="500">
                                  {customer.customer?.last_name}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {customer.customer?.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={customer.ticket_code}
                                size="small"
                                sx={{
                                  background: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={customer.is_used ? 'Used' : 'Active'}
                                size="small"
                                sx={{
                                  background: customer.is_used
                                    ? alpha(theme.palette.error.main, 0.1)
                                    : alpha(theme.palette.success.main, 0.1),
                                  color: customer.is_used
                                    ? theme.palette.error.main
                                    : theme.palette.success.main,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={group.customers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => handleChangePage(eventId, newPage)}
                    onRowsPerPageChange={(e) => handleChangeRowsPerPage(eventId, e)}
                    sx={{
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '& .MuiTablePagination-toolbar': {
                        paddingLeft: 2,
                        paddingRight: 2,
                      },
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Card
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            background: theme.palette.background.paper,
            borderRadius: 4,
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm ? 'pas de client trouvé' : 'pas de clients trouvés'}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {searchTerm
              ? 'pas de client trouvé.'
              : 'Il n\'y a pas de clients enregistrés pour le moment.'}
          </Typography>
        </Card>
      )}

      <CostumerInfo open={open} onClose={onCloseInfo} data={item || {}} />
    </Box>
  );
};

export default Constumer;
