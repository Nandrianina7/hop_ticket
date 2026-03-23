import {
  Box,
  Menu,
  Typography,
  Divider,
  Chip,
  Grid,
  Avatar,
  Stack,
  Paper,
  Button,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  AttachMoney,
  TrendingUp,
  Description,
  Close,
} from '@mui/icons-material';
import { getImagePath } from '../../../utils/getImagePath';

const EventInfo = ({ open, onClose, anchorEl, event }) => {
  if (!event) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'info';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxWidth: '90vw',
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      {event.image_url ? (
        <Box sx={{ position: 'relative', height: 200 }}>
          <img
            src={getImagePath(event.image_url)}
            alt={event.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              minWidth: 'auto',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <Close fontSize="small" />
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            height: 120,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white' }}>
            {event.name?.charAt(0)}
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              minWidth: 'auto',
              color: 'white',
            }}
          >
            <Close fontSize="small" />
          </Button>
        </Box>
      )}
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {event.name}
          </Typography>
          {event.status && (
            <Chip
              label={event.status}
              color={getStatusColor(event.status)}
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
          )}
        </Box>
        <Stack spacing={2}>
          {event.date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body2">{formatDate(event.date)}</Typography>
              </Box>
            </Box>
          )}
          {(event.location_name || event.venue) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body2">
                  {event.location_name}
                  {event.venue && event.location_name && ' • '}
                  {event.venue}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Tickets Sold */}
          {event.tickets_sold !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tickets Sold
                </Typography>
                <Typography variant="body2">
                  {event.tickets_sold.toLocaleString()} tickets
                </Typography>
              </Box>
            </Box>
          )}

          {event.owner_percentage !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Commission
                </Typography>
                <Typography variant="body2">{event.owner_percentage}%</Typography>
              </Box>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />
        {event.description && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Description fontSize="small" />
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {event.description}
            </Typography>
          </Box>
        )}
        {event.price_tiers && event.price_tiers.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Price Tiers
              </Typography>
              <Grid container spacing={1}>
                {event.price_tiers.map((tier, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {tier.tier_type || `Tier ${index + 1}`}:
                      </Typography>
                      <Typography variant="body2" color="primary.main" fontWeight="bold">
                        MGA{tier.price?.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Menu>
  );
};

export default EventInfo;
