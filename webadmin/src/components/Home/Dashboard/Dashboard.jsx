import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  People,
  ConfirmationNumber,
  Add,
  ImportExport,
  TimelapseOutlined,
  Event,
  Movie,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  getNearestEvent,
  getSoldTicketTrend,
  getUpcomingEvents,
  mostFiveSoldEvent,
} from '../../../utils/event';
import MetricCard from '../../../ui/MetricCard';
import { stringToColor } from '../../../utils/stringToColor';
import ManageDialog from '../../../ui/ManageDialog';
import { Link, useNavigate } from 'react-router-dom';
import VenuePlanBuilder from '../../VenueBuilder/VenueBuilder';
import { getCookie } from '../../../utils/getCookie';

const getDashboardStats = (data = [], allCustomers = []) => ({
  totalEvents: data.length,
  activeCustomers: allCustomers.length,
  ticketsSold: data.reduce((acc, event) => acc + (event.tickets_sold || 0), 0),
  nextEvent: '',
  eventsTrend: 'up',
  customersTrend: 'up',
  salesTrend: 'down',
  revenueTrend: 'none',
});

const Dashboard = ({ data, allCustomers, onCreate, onSaveVenue, movies = [] }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [mostSoldEvent, setMostSoldEvent] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [filterType, setFilterType] = useState('All event');
  const [timeLeft, setTimeLeft] = useState(null);
  const [open, setOpen] = useState(false);
  const [openVenueB, setOpenVenueB] = useState(false);

  const navigateTo = useNavigate();
  const metricData = [
    {
      title: 'Evenements total',
      value: stats.totalEvents,
      icon: <Event />,
      trend: stats.eventsTrend,
    },
    {
      title: 'Total des films',
      value: movies.length,
      icon: <Movie />,
    },
    {
      title: 'total de clients',
      value: stats.activeCustomers,
      icon: <People />,
      trend: stats.customersTrend,
    },
    {
      title: 'ventes de billets',
      value: stats.ticketsSold,
      icon: <ConfirmationNumber />,
      trend: stats.salesTrend,
    },
    {
      title: 'Prochain evenement dans',
      value: stats?.nextEvent,
      icon: <TimelapseOutlined />,
      trend: stats.revenueTrend,
    },
  ];

  const filterEventsByDate = (events, filterType) => {
    const now = new Date();

    switch (filterType) {
      case 'Evenements passés':
        return events.filter((event) => new Date(event.date) < now);
      case 'Evenements à venir':
        return events.filter((event) => new Date(event.date) >= now);
      case 'tous':
      default:
        return events;
    }
  };
  const user_role = getCookie('user_role');
  useEffect(() => {
    const timer = setTimeout(() => {
      const dataFiltered = filterEventsByDate(data, filterType);
      setStats(getDashboardStats(data, allCustomers));
      setMostSoldEvent(mostFiveSoldEvent(data));
      setUpcomingEvents(getUpcomingEvents(data));
      setTrendData(getSoldTicketTrend(dataFiltered));
      setTimeLeft(getNearestEvent(data));
      if (timeLeft) {
        setStats((prevStats) => ({
          ...prevStats,
          nextEvent: timeLeft.timeLeft,
        }));
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, allCustomers, filterType, timeLeft]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 3 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={400} sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 3 }}>
          <Skeleton variant="rounded" height={300} />
          <Skeleton variant="rounded" height={300} />
        </Box>
      </Box>
    );
  }

  const chartData = {
    xAxis: [
      {
        data: trendData.map((item) => item.name),
        scaleType: 'band',
        categoryGapRatio: 0.6,
        barGapRatio: 0.5,
      },
    ],

    series: [
      {
        data: trendData.map((item) => item.count),
        label: 'tickets vendus',
        color: theme.palette.primary.light,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          vue d'ensemble de vos événements et ventes de billets
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        {metricData.map((item, index) => (
          <MetricCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            trend={item.trend}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['tous', 'Evenements à venir', 'Evenements passés'].map((option) => (
            <Chip
              key={option}
              label={option}
              variant={filterType === option ? 'filled' : 'outlined'}
              color={filterType === option ? 'primary' : 'default'}
              onClick={() => setFilterType(option)}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' }, gap: 3 }}>
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="vente de billets" />
            <CardContent sx={{ height: 330 }}>
              <BarChart
                xAxis={chartData.xAxis}
                series={chartData.series}
                margin={{ top: 20, bottom: 30 }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="les evenements les plus vendus"
              action={
                <Button size="small" onClick={() => navigateTo('/event')}>
                  Voir tout
                </Button>
              }
            />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Nom', 'Localisation', 'Date'].map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mostSoldEvent.map((reg) => (
                    <TableRow key={reg.id} hover>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(stringToColor(reg.name), 0.4),
                            color: theme.palette.text.primary,
                          }}
                        >
                          {reg.name.charAt(0)}
                        </Avatar>
                        {reg.name}
                      </TableCell>
                      <TableCell>{reg.venue}</TableCell>
                      <TableCell>{reg.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        <Box>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Evenements avenirs" />
            <List>
              {upcomingEvents.map((event) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: alpha(stringToColor(event.name), 0.1),
                          color: theme.palette.text.primary,
                        }}
                      >
                        {event.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.name}
                      secondary={`${event.date} • ${event.venue}`}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Card>

          <Card>
            <CardHeader title="Actions rapides" />
            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                sx={{ mb: 2 }}
                onClick={() => setOpen(true)}
              >
                Nouveau evenement
              </Button>
              {user_role === 'event_organizer' ||
                (user_role === 'admin' && (
                  <Link to={'/event-layout'}>
                    <Button variant="outlined" fullWidth>
                      Cree un plan de salle
                    </Button>
                  </Link>
                ))}
            </CardContent>
          </Card>
        </Box>
      </Box>
      <VenuePlanBuilder
        open={openVenueB}
        onClose={() => setOpenVenueB(false)}
        onSave={onSaveVenue}
      />
      <ManageDialog open={open} onClose={() => setOpen(false)} type="create" onClick={onCreate} />
    </Box>
  );
};

export default Dashboard;
