import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  alpha,
  IconButton,
  Collapse,
  Divider,
  Avatar,
  Grid,
  Button,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  Event as EventIcon, 
  Movie,
  Visibility as ViewIcon 
} from '@mui/icons-material';
import { useState } from 'react';
import { stringToColor } from '../../../utils/stringToColor';
import CountLen from './CountLen';
import EventInfo from './EventInfo';
import CinemaInfo from './CinemaInfo';
import { Link } from 'react-router-dom';

const History = ({ organizators = [] }) => {
  const [expandedOrg, setExpandedOrg] = useState(null);

  const handleExpandClick = (orgId) => {
    setExpandedOrg(expandedOrg === orgId ? null : orgId);
  };

  // Helper function to get role display name
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
  
  const roleCounts = organizators.reduce((acc, org) => {
    acc[org.role] = (acc[org.role] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        fontWeight={600}
        mb={3}
        sx={{
          mb: 3,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Organizers Team
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(roleCounts).map(([role, count]) => {
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

      {organizators.length === 0 ? (
        <Typography color="text.secondary">No organizers found.</Typography>
      ) : (
        <Stack spacing={2}>
          {organizators.map((org) => (
            <Card
              key={org.id}
              elevation={2}
              sx={{
                borderRadius: 3,
                transition: '0.2s',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 200 }}>
                    <Avatar
                      sx={{
                        bgcolor: stringToColor(org.full_name),
                        width: 48,
                        height: 48,
                      }}
                    >
                      {org.full_name?.charAt(0).toUpperCase() || '?'}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {org.full_name || 'No Name'}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {org.email}
                      </Typography>

                      <Box mt={0.5}>
                        <Chip
                          label={getRoleDisplay(org.role)}
                          size="small"
                          sx={{
                            bgcolor: alpha(stringToColor(org.full_name), 0.9),
                            color: '#fff',
                            fontWeight: 500,
                          }}
                        />
                      </Box>

                      <Typography variant="caption" display="block" mt={0.5} color="text.secondary">
                        Membre depuis: {new Date(org.created_at).toDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <CountLen
                      length={
                        org.role === 'event_organizer' ? org.event?.length : org.total_halls || 0
                      }
                      title={
                        org.role === 'event_organizer' ? "Total d'évenement" : 'Total de Salle'
                      }
                      label={org.role === 'event_organizer' ? 'Evenement' : 'Salle'}
                    />
                    <CountLen
                      length={
                        org.role === 'event_organizer'
                          ? org.eventSite.length
                          : org.total_movies_with_sessions || 0
                      }
                      title={org.role === 'event_organizer' ? 'Total site' : 'Total de films'}
                      label={org.role === 'event_organizer' ? 'Site' : 'Films'}
                    />
                    <Button
                      component={Link}
                      to={`/organizer/data?type=${
                        org.role === 'event_organizer' ? 'evenement' : 'cinema'
                      }&organizerId=${org.id}&xme=${org.full_name}`}
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Voir détails
                    </Button>
                    {(org.event?.length > 0 || org.cinemas?.length > 0) && (
                      <IconButton
                        onClick={() => handleExpandClick(org.id)}
                        sx={{
                          transform: expandedOrg === org.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                {org.role === 'event_organizer' && org.event?.length > 0 && (
                  <Collapse in={expandedOrg === org.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }}>
                        <Chip label="Events" size="small" icon={<EventIcon />} variant="outlined" />
                      </Divider>
                      <EventInfo org={org} />
                    </Box>
                  </Collapse>
                )}
                {org.role === 'organizer' && org.cinemas.length > 0 && (
                  <Collapse in={expandedOrg === org.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }}>
                        <Chip
                          label={org.role === 'event_organizer' ? 'Events' : 'Cinema'}
                          size="small"
                          icon={org.role === 'event_organizer' ? <EventIcon /> : <Movie />}
                          variant="outlined"
                        />
                      </Divider>
                      <CinemaInfo org={org} />
                    </Box>
                  </Collapse>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default History;