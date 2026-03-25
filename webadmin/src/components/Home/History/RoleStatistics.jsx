import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

const RoleStatistics = ({ roleCounts }) => {
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'organizer':
        return 'Diffuseur de cinema';
      case 'event_organizer':
        return "Organisateur d'évenement";
      default:
        return role;
    }
  };

  const colors = {
    admin: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '👑' },
    event_organizer: {
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: '👥',
    },
    organizer: {
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: '🤝',
    },
    default: { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: '👥' },
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Object.entries(roleCounts).map(([role, count]) => {
        const style = colors[role] || colors.default;

        return (
          <Grid item xs={12} sm={6} md={3} key={role}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 80,
                  height: 80,
                  background: style.gradient,
                  opacity: 0.1,
                  borderRadius: '0 0 0 100%',
                }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    mb: 1,
                    background: style.gradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {count}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
                    {style.icon}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    {getRoleDisplay(role)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default RoleStatistics;
