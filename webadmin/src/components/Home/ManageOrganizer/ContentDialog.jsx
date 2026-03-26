import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { getRoleColor } from '../../../utils/getRoleColor';
import { CalendarMonth, Event, LocationCity, Movie } from '@mui/icons-material';
import { useState } from 'react';
import { formatDate } from '../../../utils/formatDate';

const ContentDialog = ({ orgData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const roleColor = getRoleColor(orgData?.role);
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: alpha(roleColor.bg, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(roleColor.bg, 0.1)}`,
            }}
          >
            <Typography variant="h4" fontWeight={700} color={roleColor.bg}>
              {orgData?.role === 'event_organizer'
                ? orgData?.event?.length || 0
                : orgData?.total_halls || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {orgData?.role === 'event_organizer' ? 'Événements' : 'Salles'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: alpha(roleColor.bg, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(roleColor.bg, 0.1)}`,
            }}
          >
            <Typography variant="h4" fontWeight={700} color={roleColor.bg}>
              {orgData?.role === 'event_organizer'
                ? orgData?.eventSite?.length || 0
                : orgData?.total_movies_with_sessions || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {orgData?.role === 'event_organizer' ? 'Sites' : 'Films'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      {(orgData?.event?.length > 0 || orgData?.cinemas?.length > 0) && (
        <>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {orgData?.role === 'event_organizer' && orgData?.event?.length > 0 && (
              <Tab
                icon={<Event />}
                iconPosition="start"
                label={`Événements (${orgData.event.length})`}
              />
            )}
            {orgData?.role === 'event_organizer' && orgData?.eventSite?.length > 0 && (
              <Tab
                icon={<LocationCity />}
                iconPosition="start"
                label={`Sites (${orgData.eventSite.length})`}
              />
            )}
            {orgData?.role === 'organizer' && orgData?.cinemas?.length > 0 && (
              <Tab
                icon={<Movie />}
                iconPosition="start"
                label={`Cinémas (${orgData.cinemas.length})`}
              />
            )}
          </Tabs>
          {activeTab === 0 && orgData?.role === 'event_organizer' && orgData?.event?.length > 0 && (
            <Stack spacing={2}>
              {orgData.event.map((event, index) => (
                <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {event.name || 'Événement sans nom'}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {event.description}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {event.date && (
                        <Chip
                          icon={<CalendarMonth />}
                          label={formatDate(event.date)}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {event.location && (
                        <Chip
                          icon={<LocationCity />}
                          label={event.location}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
          {activeTab === (orgData?.event?.length > 0 ? 1 : 0) &&
            orgData?.role === 'event_organizer' &&
            orgData?.eventSite?.length > 0 && (
              <Stack spacing={2}>
                {orgData.eventSite.map((site, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {site.site_name || 'Site sans nom'}
                      </Typography>
                      {site.address && (
                        <Typography variant="body2" color="text.secondary">
                          {site.address}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          {activeTab === 0 && orgData?.role === 'organizer' && orgData?.cinemas?.length > 0 && (
            <Stack spacing={2}>
              {orgData.cinemas.map((cinema, index) => (
                <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {cinema.name || 'Cinéma sans nom'}
                    </Typography>
                    {cinema.address && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {cinema.address}
                      </Typography>
                    )}
                    {cinema.halls && cinema.halls.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Salles: {cinema.halls.length}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </>
      )}
      {!orgData?.event?.length && !orgData?.cinemas?.length && !orgData?.eventSite?.length && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">Aucun événement ou cinéma associé</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContentDialog;
