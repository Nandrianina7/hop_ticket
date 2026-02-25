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
import {
  ExpandMore as ExpandMoreIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { stringToColor } from '../../../utils/stringToColor';
import CountLen from './CountLen';
import EventInfo from './EventInfo';

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
                    <CountLen
                      length={org.event?.length || 0}
                      title={'Total event'}
                      label={'Events'}
                    />

                    {org.event?.length > 0 && (
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
                    length={org.eventSite.length || 0}
                    title={'Total site'}
                    label={'Site'}
                  />
                </Box>

                {/* Events section - collapsible */}
                {org.event?.length > 0 && (
                  <Collapse in={expandedOrg === org.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }}>
                        <Chip label="Events" size="small" icon={<EventIcon />} variant="outlined" />
                      </Divider>
                      <EventInfo org={org} />
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
