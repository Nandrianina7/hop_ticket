import { alpha, Avatar, Box, Card, Typography, useTheme } from '@mui/material';
import { stringToColor } from '../utils/stringToColor';

const MetricCard = ({ title, value, icon, trend }) => {
  const theme = useTheme();
  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: alpha(stringToColor(title), 0.2),
            color: trend === 'up' ? theme.palette.success.dark : theme.palette.info.dark,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </Card>
  );
};

export default MetricCard;
