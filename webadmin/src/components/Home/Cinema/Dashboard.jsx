import {
  Book,
  BookOutlined,
  HomeMaxOutlined,
  Movie,
  MovieFilter,
  TrendingUp,
} from '@mui/icons-material';
import { Box, Typography, Paper, useTheme, Card } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import MetricCard from '../../../ui/MetricCard';
import { useMemo } from 'react';

const DashboardCinema = ({
  movies = [],
  tickets = [],
  upcomingMovie = [],
  halls = [],
  soldTicUpc = [],
}) => {
  const theme = useTheme();
  const ticketStats = useMemo(() => {
    console.log(upcomingMovie);
    if (!tickets.length) {
      return [
        { date: 'Mon', tickets: 0 },
        { date: 'Tue', tickets: 0 },
        { date: 'Wed', tickets: 0 },
        { date: 'Thu', tickets: 0 },
        { date: 'Fri', tickets: 0 },
        { date: 'Sat', tickets: 0 },
        { date: 'Sun', tickets: 0 },
      ];
    }

    const ticketsByDate = tickets.reduce((acc, ticket) => {
      const purchaseDate = new Date(ticket.purchase_date);
      const dateKey = purchaseDate.toISOString().split('T')[0];

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          tickets: 0,
          revenue: 0,
          formattedDate: purchaseDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        };
      }

      acc[dateKey].tickets += 1;
      acc[dateKey].revenue += parseFloat(ticket.price) || 0;

      return acc;
    }, {});

    const sortedTickets = Object.values(ticketsByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);

    return sortedTickets;
  }, [tickets]);

  const buildMetrics = () => [
    {
      title: 'Total films',
      value: movies.length,
      icon: <Movie sx={{ color: theme.palette.primary.main }} />,
      trend: 'up',
      color: theme.palette.primary.main,
    },
    {
      title: 'Films à venir',
      value: upcomingMovie.length,
      icon: <MovieFilter sx={{ color: theme.palette.info.main }} />,
      trend: upcomingMovie.length > 0 ? 'up' : 'down',
      color: theme.palette.info.main,
    },
    {
      title: 'Total Tickets vendus',
      value: tickets.length,
      icon: <Book sx={{ color: theme.palette.success.main }} />,
      trend: tickets.length > 0 ? 'up' : 'down',
      color: theme.palette.success.main,
    },
    {
      title: 'Tickets à venir',
      value: soldTicUpc.length,
      icon: <BookOutlined sx={{ color: theme.palette.warning.main }} />,
      trend: soldTicUpc.length > 0 ? 'up' : 'down',
      color: theme.palette.warning.main,
    },
    {
      title: 'Total salles',
      value: halls.length,
      icon: <HomeMaxOutlined sx={{ color: theme.palette.secondary.main }} />,
      trend: 'up',
      color: theme.palette.secondary.main,
    },
  ];

  const revenueStats = useMemo(() => {
    const totalRevenue = ticketStats.reduce((sum, day) => sum + day.revenue, 0);
    const averageDailyRevenue = ticketStats.length > 0 ? totalRevenue / ticketStats.length : 0;
    const peakDay =
      ticketStats.length > 0
        ? ticketStats.reduce((max, day) => (day.tickets > max.tickets ? day : max), ticketStats[0])
        : null;

    return { totalRevenue, averageDailyRevenue, peakDay };
  }, [ticketStats]);

  const items = buildMetrics();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Cinema Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          vue d'ensemble des activites de votre cinema
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {items.map((item, index) => (
          <MetricCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            trend={item.trend}
            color={item.color}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        <Paper
          elevation={0}
          sx={{
            flex: { lg: 2 },
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h6" fontWeight="600">
              Vue d'ensemble des ventes de billets (7 derniers jours)
            </Typography>
            <Typography
              variant="body2"
              color="success.main"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
              Total: {tickets.length} tickets
            </Typography>
          </Box>

          {ticketStats.length > 0 && ticketStats.some((day) => day.tickets > 0) ? (
            <BarChart
              xAxis={[
                {
                  scaleType: 'band',
                  data: ticketStats.map((s) => s.formattedDate),
                  label: 'Date',
                },
              ]}
              series={[
                {
                  data: ticketStats.map((s) => s.tickets),
                  label: 'Tickets vendus',
                  color: theme.palette.primary.main,
                },
                {
                  data: ticketStats.map((s) => s.revenue),
                  label: 'Revenue',
                  color: theme.palette.info.dark,
                  yAxisKey: 'revenueAxis',
                },
              ]}
              yAxis={[
                { id: 'ticketsAxis', label: 'Ticket vendus' },
                { id: 'revenueAxis', label: 'Revenue ($)' },
              ]}
              height={300}
              margin={{ left: 70, right: 30, top: 30, bottom: 70 }}
            />
          ) : (
            <Box
              sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Typography variant="body1" color="text.secondary">
                Pas de donnees de vente de billet disponible pour les 7 derniers jours
              </Typography>
            </Box>
          )}
        </Paper>
        <Paper
          elevation={0}
          sx={{
            flex: { lg: 1 },
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
          }}
        >
          <Typography variant="h6" fontWeight="600" gutterBottom>
            prochaines scéance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            les 5 prochaines scéance
          </Typography>

          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {upcomingMovie.length > 0 ? (
              upcomingMovie.slice(0, 5).map((movie, idx) => (
                // console.log(movies);
                <Card
                  key={idx}
                  elevation={0}
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        background: `linear-gradient(45deg,
                          ${theme.palette.primary.main}, ${theme.palette.secondary.main})
                          `,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <Movie sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="500">
                        {movie.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        par {movie.director} • {movie.genre}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  color: theme.palette.text.secondary,
                }}
              >
                <MovieFilter sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2">Pas de séances à venir</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <TrendingUp sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
          Total revenue: 
          {revenueStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} MGA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          •
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ventes de tickets en moyenne:{' '}
          {Math.round(
            ticketStats.reduce((sum, day) => sum + day.tickets, 0) / (ticketStats.length || 1)
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          •
        </Typography>
        <Typography variant="body2" color="text.secondary">
          jour de pique: {revenueStats.peakDay ? revenueStats.peakDay.formattedDate : 'No data'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          •
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cinema: {tickets.length > 0 ? tickets[0].cinema_name : 'No data'}
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardCinema;
