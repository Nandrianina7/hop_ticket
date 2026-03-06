import { alpha, Paper, Tooltip, Typography } from '@mui/material';

const CountLen = ({ length, title, label }) => {
  return (
    <Tooltip title={title}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: alpha('#1976d2', 0.1),
          px: 2,
          py: 1,
          borderRadius: 2,
          mb: 1,
          cursor: 'pointer',
        }}
      >
        <Typography variant="h6" fontWeight={600} color="primary">
          {length}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Paper>
    </Tooltip>
  );
};

export default CountLen;
