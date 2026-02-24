import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Drawer,
  Typography,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Avatar,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  Chair as ChairIcon,
  Close as CloseIcon,
  EventSeat,
  Star,
  Lock,
  Block,
  CheckCircle,
  Analytics,
  Living,
} from '@mui/icons-material';
import PromocodeForm from '../Promocode/PromocodeForm';

const MovieSessionSeat = ({ fetchSeats, session, open, onClose, onSavePCode }) => {
  const theme = useTheme();
  const [seats, setSeats] = useState([]);
  const [maxRow, setMaxRow] = useState(0);
  const [maxCol, setMaxCol] = useState(0);
  const [fullData, setFullData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const now = new Date();

  const getTwoDayB = (sessionStart) => {
    const _2_days_b = new Date(new Date(sessionStart).getTime() - 2 * 24 * 60 * 1000);

    return _2_days_b;
  };
  // Seat statistics
  const seatStats = {
    total: seats.length,
    available: seats.filter((seat) => seat.is_available && !seat.is_disabled).length,
    occupied: seats.filter((seat) => !seat.is_available && !seat.is_disabled).length,
    reserved: seats.filter((seat) => seat.is_reserved).length,
    disabled: seats.filter((seat) => seat.is_disabled).length,
    vip: seats.filter((seat) => seat.is_vip).length,
  };

  // Modern colors for admin
  const getSeatColor = (seat) => {
    if (seat.is_disabled) return theme.palette.grey[400];
    if (seat.is_reserved) return theme.palette.warning.main;
    if (!seat.is_available) return theme.palette.error.main;
    if (seat.is_vip) return theme.palette.secondary.main;
    return theme.palette.success.main;
  };

  // Seat style for admin display
  const getSeatStyle = (seat) => {
    const baseColor = getSeatColor(seat);

    return {
      color: baseColor,
      backgroundColor: alpha(baseColor, 0.1),
      border: `2px solid ${baseColor}`,
      borderRadius: 2,
      width: 44,
      height: 44,
      cursor: 'default',
      '&:hover': {
        backgroundColor: alpha(baseColor, 0.2),
        transform: 'scale(1.05)',
      },
    };
  };

  useEffect(() => {
    if (session && open) {
      setIsLoading(true);
      fetchSeats(session)
        .then((data) => {
          setSeats(data.seats || []);
          setFullData(data);
          console.log(data);

          let maxRowNum = 0;
          let maxColNum = 0;

          data.seats?.forEach((seat) => {
            const rowNum = parseInt(seat.rows, 10);
            const colNum = parseInt(seat.cols, 10);
            if (rowNum > maxRowNum) maxRowNum = rowNum;
            if (colNum > maxColNum) maxColNum = colNum;
          });

          setMaxRow(maxRowNum);
          setMaxCol(maxColNum);
        })
        .catch((err) => {
          console.error('Error fetching seats:', err);
          setSeats([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [session, open, fetchSeats]);

  const seatsByRow = {};
  seats.forEach((seat) => {
    const rowNum = parseInt(seat.rows, 10);
    if (!seatsByRow[rowNum]) {
      seatsByRow[rowNum] = [];
    }
    seatsByRow[rowNum].push(seat);
  });

  const sortedRows = Object.keys(seatsByRow).sort((a, b) => a - b);
  sortedRows.forEach((row) => {
    seatsByRow[row].sort((a, b) => a.cols - b.cols);
  });

  const getSafeColor = (colorName) => {
    const safeColors = {
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      error: theme.palette.error.main,
      warning: theme.palette.warning.main,
      secondary: theme.palette.secondary.main,
      default: theme.palette.grey[500],
    };
    return safeColors[colorName] || theme.palette.primary.main;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '100vw',
          [theme.breakpoints.up('md')]: {
            width: '95%',
            maxWidth: 1400,
          },
        },
      }}
    >
      <AppBar
        position="sticky"
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          mt: 7,
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Places disponibles pour la séance
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {fullData?.session?.hall?.name || 'Hall'}
            </Typography>
          </Box>

          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
          background: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            sx={{
              textAlign: 'center',
              p: 2,
              mb: 2,
              background: `linear-gradient(180deg, ${theme.palette.grey[300]} 0%, ${theme.palette.grey[200]} 100%)`,
              borderRadius: 4,
              border: `4px solid ${theme.palette.grey[400]}`,
              width: '80%',
              maxWidth: 600,
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -15,
                left: '10%',
                right: '10%',
                height: 20,
                background: `linear-gradient(180deg, ${alpha(theme.palette.grey[400], 0.4)} 0%, transparent 100%)`,
                borderRadius: '50%',
                filter: 'blur(8px)',
              },
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="text.secondary">
              MAIN SCREEN
            </Typography>
          </Paper>
          {isLoading ? (
            <Box sx={{ width: '100%', maxWidth: 800 }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body1" textAlign="center" color="text.secondary">
                Loading seat configuration...
              </Typography>
            </Box>
          ) : sortedRows.length > 0 ? (
            <Box sx={{ width: '100%', maxWidth: 800 }}>
              {sortedRows.map((rowNum) => (
                <Box
                  key={rowNum}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {/* Row Number */}
                  <Box
                    sx={{
                      width: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 2,
                      py: 1,
                      fontSize: '0.875rem',
                    }}
                  >
                    R {rowNum}
                  </Box>

                  {/* Row Seats */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {seatsByRow[rowNum].map((seat) => (
                      <Tooltip
                        key={seat.id}
                        title={
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Row {seat.rows}, Seat {seat.cols}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Price: {seat.calculated_price || 0}MGA
                            </Typography>
                            <Chip
                              label={
                                seat.is_disabled
                                  ? 'Disabled'
                                  : seat.is_reserved
                                    ? 'Reserved'
                                    : !seat.is_available
                                      ? 'Occupied'
                                      : seat.is_vip
                                        ? 'VIP'
                                        : 'Available'
                              }
                              size="small"
                              color={
                                seat.is_disabled
                                  ? 'default'
                                  : seat.is_reserved
                                    ? 'warning'
                                    : !seat.is_available
                                      ? 'error'
                                      : seat.is_vip
                                        ? 'secondary'
                                        : 'success'
                              }
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <IconButton sx={getSeatStyle(seat)}>
                          <ChairIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Card sx={{ textAlign: 'center', py: 8, width: '100%', maxWidth: 800 }}>
              <CardContent>
                <EventSeat sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No seats configured
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No seat data available for this session
                </Typography>
              </CardContent>
            </Card>
          )}

          <Paper sx={{ p: 4, mt: 6, width: '100%', maxWidth: 800, borderRadius: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
            >
              Légende
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  color: 'success',
                  label: 'disponible',
                  icon: <Living />,
                  desc: 'Siège libre et utilisable',
                  value: seatStats.available,
                },
                {
                  color: 'secondary',
                  label: 'VIP',
                  icon: <Living />,
                  desc: 'Place VIP',
                  value: seatStats.vip,
                },
                // {
                //   color: 'warning',
                //   label: 'Reserved',
                //   icon: <EventSeat />,
                //   desc: 'Reservation pending payment',
                //   value: seatStats.reserved,
                // },
                {
                  color: 'red',
                  label: 'Occupée',
                  icon: <Living />,
                  desc: 'place déjà prise',
                  value: seatStats.occupied,
                },
                // {
                //   color: 'default',
                //   label: 'Disabled',
                //   icon: <Lock />,
                //   desc: 'Temporarily unavailable seat',
                //   value: seatStats.disabled,
                // },
              ].map((item, index) => {
                const safeColor = getSafeColor(item.color);
                return (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(safeColor, 0.1),
                          color: safeColor,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {item.label} {`(${item.value})`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Box>
        <Box
          sx={{
            width: 400,
            borderLeft: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2, flex: 1 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
            >
              <Analytics />
              Information de la séance
            </Typography>

            {fullData?.session && (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Détails de la séance
                  </Typography>
                  {[
                    {
                      label: 'Film',
                      value: fullData.session.movie_title || 'Non spécifié',
                    },
                    {
                      label: 'salle',
                      value: fullData.session.hall?.name || 'Non spécifié',
                    },
                    {
                      label: 'Horaires',
                      value: (
                        <>
                          <Typography variant="body1">
                            {fullData.session.start_time
                              ? new Date(fullData.session.start_time).toLocaleString()
                              : 'Not set'}
                          </Typography>
                          <Typography variant="body1">
                            {fullData.session.end_time
                              ? new Date(fullData.session.end_time).toLocaleString()
                              : 'Not set'}
                          </Typography>
                        </>
                      ),
                    },
                  ].map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Capacité de la salle
                  </Typography>

                  {[
                    {
                      label: 'place totale:',
                      value: seatStats.total,
                    },
                    {
                      label: "Taux d'occupation:",
                      value:
                        seatStats.total > 0
                          ? `${((seatStats.occupied / seatStats.total) * 100).toFixed(1)}%`
                          : '0%',
                    },
                    {
                      label: 'place vip:',
                      value: seatStats.vip,
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2">{item.label}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Box>
          {/* {
            now < getTwoDayB(fullData?.session.start_time) && (
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PromocodeForm type={'craete'} btnText={'Create promo code for this session'} onSave={onSavePCode}/>
              </Box>
            )
          } */}
          {/* Statistics Summary */}
          <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" gutterBottom>
              Résumé des places
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                {
                  label: 'Disponible:',
                  value: seatStats.available,
                  color: 'success',
                },
                {
                  label: 'Occupé:',
                  value: seatStats.occupied,
                  color: 'error',
                },
                // {
                //   label: 'Réservé:',
                //   value: seatStats.reserved,
                //   color: 'warning',
                // },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2">{item.label}</Typography>
                  <Chip label={item.value} size="small" color={item.color} variant="outlined" />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MovieSessionSeat;
