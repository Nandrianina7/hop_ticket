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
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Event as EventIcon, Movie } from '@mui/icons-material';
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Organizers
      </Typography>

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
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    {/* Avatar with first letter */}
                    <Avatar
                      sx={{
                        bgcolor: stringToColor(org.full_name),
                        width: 48,
                        height: 48,
                      }}
                    >
                      {org.full_name?.charAt(0).toUpperCase() || '?'}
                    </Avatar>

                    {/* Organizer details */}
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

                  {/* Events count and expand button */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 100,
                    }}
                  >
                    <Link 
                      to={`/organizer/data?type=${
                        org.role === 'event_organizer' ? 'event': 'cinema'
                      }&organizerId=${org.id}`} 
                      style={{ textDecoration: 'none'}}
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
                    </Link>

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
                  <CountLen
                    length={
                      org.role === 'event_organizer'
                        ? org.eventSite.length
                        : org.total_movies_with_sessions || 0
                    }
                    title={org.role === 'event_organizer' ? 'Total site' : 'Total de films'}
                    label={org.role === 'event_organizer' ? 'Site' : 'Films'}
                  />
                </Box>
                
                {/* Events section - collapsible */}
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
