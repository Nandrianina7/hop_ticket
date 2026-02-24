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
  Tooltip,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Assessment as TicketIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { stringToColor } from '../../../utils/stringToColor';

const History = ({ organizators = [] }) => {
  const [expandedOrg, setExpandedOrg] = useState(null);

  const handleExpandClick = (orgId) => {
    setExpandedOrg(expandedOrg === orgId ? null : orgId);
  };

  // Helper function to format date
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get role display name
  const getRoleDisplay = (role) => {
    switch(role) {
      case 'organizer':
        return 'Cinema Distributor';
      case 'Event_organizer':
        return 'Event Organizer';
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
        <Typography color="text.secondary">
          No organizers found.
        </Typography>
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
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                {/* Main organizer info -始终保持可见 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    {/* Avatar with first letter */}
                    <Avatar
                      sx={{
                        bgcolor: stringToColor(org.full_name),
                        width: 48,
                        height: 48
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
                            fontWeight: 500
                          }}
                        />
                      </Box>

                      <Typography
                        variant="caption"
                        display="block"
                        mt={0.5}
                        color="text.secondary"
                      >
                        Member since: {new Date(org.created_at).toDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Events count and expand button */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    minWidth: 100
                  }}>
                    <Tooltip title="Total events">
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
                          mb: 1
                        }}
                      >
                        <Typography variant="h6" fontWeight={600} color="primary">
                          {org.event?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Events
                        </Typography>
                      </Paper>
                    </Tooltip>
                    
                    {org.event?.length > 0 && (
                      <IconButton
                        onClick={() => handleExpandClick(org.id)}
                        sx={{
                          transform: expandedOrg === org.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s'
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Events section - collapsible */}
                {org.event?.length > 0 && (
                  <Collapse in={expandedOrg === org.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }}>
                        <Chip 
                          label="Events" 
                          size="small" 
                          icon={<EventIcon />}
                          variant="outlined"
                        />
                      </Divider>
                      
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
                                borderColor: 'primary.main'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {event.name}
                                </Typography>
                                
                                <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {formatEventDate(event.date)}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {event.venue}
                                    </Typography>
                                  </Box>
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
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {event.description}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Stack>
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