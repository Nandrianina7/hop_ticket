import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import CountLen from './CountLen';
import EventInfo from './EventInfo';
import { Event, ExpandMore, Movie, Settings, Visibility } from '@mui/icons-material';
import { stringToColor } from '../../../utils/stringToColor';
import { Link } from 'react-router-dom';
import CinemaInfo from './CinemaInfo';

const OrganizerCard = ({ org, expandedOrg, handleExpandClick }) => {
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
    <Card
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
              length={org.role === 'event_organizer' ? org.event?.length : org.total_halls || 0}
              title={org.role === 'event_organizer' ? "Total d'évenement" : 'Total de Salle'}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                component={Link}
                to={`/organizer/data?type=${
                  org.role === 'event_organizer' ? 'evenement' : 'cinema'
                }&organizerId=${org.id}&xme=${org.full_name}`}
                variant="outlined"
                size="small"
                startIcon={<Visibility />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Voir détails
              </Button>
              <Tooltip title='Contrôler cet utilisateur'>
                <IconButton size='small'>
                  <Settings fontSize='small'/>
                </IconButton>
              </Tooltip>
            </Box>
            {(org.event?.length > 0 || org.cinemas?.length > 0) && (
              <IconButton
                onClick={() => handleExpandClick(org.id)}
                sx={{
                  transform: expandedOrg === org.id ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              >
                <ExpandMore />
              </IconButton>
            )}
          </Box>
        </Box>
        {org.role === 'event_organizer' && org.event?.length > 0 && (
          <Collapse in={expandedOrg === org.id} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }}>
                <Chip label="Events" size="small" icon={<Event />} variant="outlined" />
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
                  icon={org.role === 'event_organizer' ? <Event /> : <Movie />}
                  variant="outlined"
                />
              </Divider>
              <CinemaInfo org={org} />
            </Box>
          </Collapse>
        )}
      </CardContent>
    </Card>
  );
};

export default OrganizerCard;
