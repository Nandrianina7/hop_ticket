import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

const MovieSessionDialog = ({ open, onClose, movies }) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return (
    <Dialog open={open !== null} onClose={onClose} fullWidth maxWidth="sm">
      {open !== null && movies[open] && (
        <>
          <DialogTitle>
            <Typography variant="h6" component="div">
              {movies[open].title}
              <Typography variant="subtitle2" color="text.secondary">
                Available Sessions
              </Typography>
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1.5}>
              {movies[open].sessions.map((session, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Chip
                      label={`Hall ${session.hall}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {formatDate(session.start_time)}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Base Price
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        MGA{parseFloat(session.base_price).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        VIP Price
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: 'secondary.main' }}
                      >
                        MGA{parseFloat(session.vip_price).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default MovieSessionDialog;
