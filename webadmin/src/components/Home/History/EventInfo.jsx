import { alpha, Box, Paper, Stack, Tooltip, Typography } from "@mui/material";
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Assessment as TicketIcon,
} from '@mui/icons-material';

const EventInfo = ({org}) => {
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  return (
    <Stack spacing={1.5}>
      {org.event.map((event) => (
        <Paper
          key={event.id}
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha('#000', 0.02),
            '&:hover': {
              bgcolor: alpha('#1976d2', 0.05),
              borderColor: 'primary.main',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {event.name}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                {[
                  {
                    icon: <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />,
                    text: formatEventDate(event.date)
                  },
                  {
                    icon: <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />,
                    text: event.venue
                  }
                ].map((item, index) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} key={index}>
                    {item.icon}
                    <Typography variant="caption" color="text.secondary">
                    {item.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Tooltip title={`${event.tickets_sold} tickets sold`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TicketIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" fontWeight={500}>
                    {event.tickets_sold}
                  </Typography>
                </Box>
              </Tooltip>

              {event.average_rating > 0 && (
                <Tooltip title={`${event.average_rating.toFixed(1)} average rating`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="caption" fontWeight={500}>
                      {event.average_rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Box>

          {event.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 1,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.description}
            </Typography>
          )}
        </Paper>
      ))}
    </Stack>
  );
};

export default EventInfo;
