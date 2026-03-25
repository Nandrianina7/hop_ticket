import { Box, Card, CardContent, Typography, Stack, Grid, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import OrganizerCard from './OrganizerCard';
import RoleStatistics from './RoleStatistics';
import OrganizerList from './OrganizerList';

const History = ({ organizators = [] }) => {
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleExpandClick = (orgId) => {
    setExpandedOrg(expandedOrg === orgId ? null : orgId);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const eventOrganizers = organizators.filter((org) => org.role === 'event_organizer');
  const cinemaOrganizers = organizators.filter((org) => org.role === 'organizer');

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

      <RoleStatistics roleCounts={roleCounts} />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`Tous (${organizators.length})`} />
        <Tab label={`Organisateurs d'événements (${eventOrganizers.length})`} />
        <Tab label={`Diffuseurs de cinéma (${cinemaOrganizers.length})`} />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <OrganizerList
            organizators={organizators}
            expandedOrg={expandedOrg}
            handleExpandClick={handleExpandClick}
          />
        )}
        {activeTab === 1 && (
          <OrganizerList
            organizators={eventOrganizers}
            expandedOrg={expandedOrg}
            handleExpandClick={handleExpandClick}
          />
        )}
        {activeTab === 2 && (
          <OrganizerList
            organizators={cinemaOrganizers}
            expandedOrg={expandedOrg}
            handleExpandClick={handleExpandClick}
          />
        )}
      </Box>
    </Box>
  );
};

export default History;
