import { alpha, Box, Paper, Stack, Tooltip, Typography, Chip } from '@mui/material';
import {
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Movie as MovieIcon,
  MeetingRoom as HallIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';

const CinemaInfo = ({ org }) => {
  return (
    <Stack spacing={1.5}>
      {org.cinemas?.map((cinema) => (
        <Paper
          key={cinema.id}
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha('#000', 0.02),
            transition: '0.2s',
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
                {cinema.name}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" mt={0.5} flexWrap="wrap">
                {[
                  {
                    icon: <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />,
                    text: cinema.city,
                  },
                  {
                    icon: <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />,
                    text: cinema.email,
                  },
                  {
                    icon: <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />,
                    text: cinema.phone,
                  },
                ].map(
                  (item, index) =>
                    item.text && (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {item.icon}
                        <Typography variant="caption" color="text.secondary">
                          {item.text}
                        </Typography>
                      </Box>
                    )
                )}
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Tooltip title="Total halls">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HallIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption" fontWeight={500}>
                    {org.total_halls}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Movies with sessions">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MovieIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                  <Typography variant="caption" fontWeight={500}>
                    {org.total_movies_with_sessions}
                  </Typography>
                </Box>
              </Tooltip>

              <Chip
                size="small"
                icon={cinema.is_active ? <ActiveIcon /> : <InactiveIcon />}
                label={cinema.is_active ? 'Active' : 'Inactive'}
                color={cinema.is_active ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
};

export default CinemaInfo;
