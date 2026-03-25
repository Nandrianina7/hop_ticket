import React from 'react';
import {
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api.js';
import SeatingEditor from '../../SeatingEditor.jsx';

const DEFAULT_LAYOUT = {
  sections: [
    {
      id: 'section-1',
      name: 'Section A',
      color: '#ff6b6b',
      x: 50,
      y: 200,
      width: 150,
      height: 120,
      rotation: 0,
      seats: [],
      type: 'section',
    },
    {
      id: 'section-2',
      name: 'Section B',
      color: '#4ecdc4',
      x: 250,
      y: 200,
      width: 150,
      height: 120,
      rotation: 0,
      seats: [],
      type: 'section',
    },
    {
      id: 'section-3',
      name: 'Section C',
      color: '#4ecdc4',
      x: 450,
      y: 200,
      width: 200,
      height: 120,
      rotation: 0,
      seats: [],
      type: 'section',
    },
  ],
  scale: 1,
};

const PlanView = ({ org_id }) => {
  const navigate = useNavigate();
  const [eventSite, setEventSite] = React.useState([]);
  const [selectedSite, setSelectedSite] = React.useState(null);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [eventPlan, setEventPlan] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingPlan, setLoadingPlan] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  const [layout, setLayout] = React.useState(DEFAULT_LAYOUT);
  const [siteName, setSiteName] = React.useState(null);
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);
  const [editorKey, setEditorKey] = React.useState(Date.now());

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  async function fetchEventSites() {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching event sites for org_id:', org_id);
      const response = await api.get(`/api/organizer/plan/${org_id}/`, {
        withCredentials: true,
      });

      console.log('Event sites response:', response);

      let sites = [];
      if (response.data?.data) {
        sites = response.data.data;
      } else if (response.data?.results) {
        sites = response.data.results;
      } else if (Array.isArray(response.data)) {
        sites = response.data;
      }

      console.log('Setting event sites:', sites);
      setEventSite(sites);

      if (sites.length > 0) {
        showSnackbar('Sites loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error fetching event sites:', error);
      setError(`Failed to load sites: ${error.message}`);
      showSnackbar('Failed to load event sites', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function saveEvent(data) {
    try {
      console.log('Saving event with data:', data);

      const payload = {
        name: data.name,
        metadata: data.metaData,
      };

      const response = await api.post('/api/new/event_plan/', payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data) {
        console.log('No response found');
        showSnackbar('No response from server', 'error');
        return null;
      }

      console.log('Saved layout successfully:', response.data);
      showSnackbar('Layout saved successfully', 'success');
      return response.data;
    } catch (error) {
      console.error('Error saving event:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
      return null;
    }
  }

  async function getEventPlan(site_name) {
    try {
      console.log('Fetching event plan for site:', site_name);

      const response = await api.get(`/api/event_plan/${site_name}/`, {
        withCredentials: true,
      });

      console.log('Event plan response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching event plan:', error);
      return null;
    }
  }

  const handleTabChange = async (event, newIndex) => {
    if (newIndex === selectedTab && selectedSite === eventSite[newIndex]) {
      console.log('Already on this tab, skipping update');
      return;
    }

    console.log('Tab changing to index:', newIndex);
    setSelectedTab(newIndex);
    const newSite = eventSite[newIndex];
    console.log('New selected site:', newSite);
    setSelectedSite(newSite);
    setError(null);

    if (newSite?.site_name) {
      setLoadingPlan(true);
      try {
        const planData = await getEventPlan(newSite.site_name);
        console.log('Plan data received for', newSite.site_name, ':', planData);

        if (planData?.data && Array.isArray(planData.data) && planData.data.length > 0) {
          console.log('Setting event plan with', planData.data.length, 'items');
          setEventPlan(planData.data);

          const latestPlan = planData.data[planData.data.length - 1];
          console.log('Latest plan:', latestPlan);
          console.log('Latest plan metadata:', latestPlan.metadata);

          const newLayout = latestPlan.metadata;
          console.log('Setting new layout:', newLayout);
          setLayout(newLayout);

          setEditorKey(Date.now());
        } else {
          console.log('No plan data found for', newSite.site_name);
          setEventPlan([]);
          setLayout(DEFAULT_LAYOUT);
          setEditorKey(Date.now());
        }
      } catch (error) {
        console.log('Error loading event plan:', error);
        setEventPlan([]);
        setError('Failed to load event plan');
      } finally {
        setLoadingPlan(false);
      }
    } else {
      console.log('No site name provided');
      setEventPlan([]);
    }
  };
  const sections = layout?.sections || [];
  const legendItems = React.useMemo(() => {
    if (!layout?.sections) return [];

    const unique = {};

    sections.forEach((section) => {
      if (!unique[section.type]) {
        unique[section.name] = {
          name: section.name,
          color: section.color,
        };
      }
    });

    return Object.values(unique);
  }, [layout]);
  React.useEffect(() => {
    if (org_id) {
      fetchEventSites();
    } else {
      setError('No organizer ID provided');
    }
  }, [org_id]);

  React.useEffect(() => {
    console.log(
      'Auto-select effect - eventSite:',
      eventSite.length,
      'selectedSite:',
      selectedSite,
      'loading:',
      loading,
      'isFirstLoad:',
      isFirstLoad
    );

    if (eventSite.length > 0 && selectedSite === null && !loading && isFirstLoad) {
      console.log('Auto-selecting first site on initial load');
      setIsFirstLoad(false);

      setTimeout(() => {
        handleTabChange(null, 0);
      }, 100);
    }
  }, [eventSite, loading, selectedSite, isFirstLoad]);
  React.useEffect(() => {
    if (selectedSite && eventSite.length > 0) {
      const savedIndex = eventSite.findIndex((site) => site.id === selectedSite.id);

      if (savedIndex !== -1 && savedIndex !== selectedTab) {
        console.log('Updating tab to match selected site:', savedIndex);
        setSelectedTab(savedIndex);
      }
    }
  }, [eventSite]);

  React.useEffect(() => {
    console.log('Layout state updated:', layout);
  }, [layout]);

  const handleLayoutChange = (newLayout) => {
    console.log('Layout changed in editor:', newLayout);
    setLayout(newLayout);
  };

  const onSaveLayout = async () => {
    if (!selectedSite) {
      showSnackbar('No site selected', 'warning');
      return;
    }

    const layoutData = {
      name: selectedSite.site_name,
      metaData: layout,
    };

    const savedLayout = await saveEvent(layoutData);
    if (savedLayout) {
      console.log('Layout saved successfully:', savedLayout);
      if (selectedSite?.site_name) {
        const planData = await getEventPlan(selectedSite.site_name);
        if (planData?.data) {
          setEventPlan(planData.data);
        }
      }
    }
  };

  const getSiteName = (site_name) => {
    console.log('Searching for site name:', site_name);
    setSiteName(site_name);
  };

  const onDeleteVenuePlan = async () => {
    if (!selectedSite?.id) {
      showSnackbar('No site selected', 'warning');
      return;
    }

    try {
      const res = await api.delete(`/api/delete_venue/${selectedSite.id}/`, {
        withCredentials: true,
      });

      if (res.status === 200 || res.status === 204) {
        console.log('Venue deleted successfully');
        showSnackbar('Venue deleted successfully', 'success');

        await fetchEventSites();

        setSelectedSite(null);
        setEventPlan([]);
        setLayout(DEFAULT_LAYOUT);
        setIsFirstLoad(true);
        setEditorKey(Date.now());
      } else {
        showSnackbar('Failed to delete venue', 'error');
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchEventSites()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please check your API configuration and try again.
        </Typography>
      </Box>
    );
  }

  if (!loading && eventSite.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
          Création de plan de salle
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Vous n'avez pas encore créé de plan de salle. Commencez par créer votre premier plan de
          salle.
        </Typography>

        <Button variant="contained" color="primary" onClick={() => navigate('/event-layout')}>
          Créez votre premier plan de salle
        </Button>
      </Box>
    );
  }

  console.log('Rendering with layout:', layout);
  console.log('Editor key:', editorKey);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1, sm: 2 },
        bgcolor: 'background.default',
        borderRadius: 2,
      }}
    >
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gestion des plans de salle
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/event-layout')}
            sx={{ minWidth: '200px' }}
          >
            Crée nouveau plan de salle
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={!eventPlan || eventPlan.length === 0}
            onClick={onDeleteVenuePlan}
            sx={{ minWidth: '200px' }}
          >
            Supprimer le plan de salle
          </Button>
        </Box>
      </Box>
      <Paper sx={{ mb: 2, width: '100%' }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
        >
          {eventSite.map((site, index) => (
            <Tab key={site.id || index} label={site.site_name} disabled={loading || loadingPlan} />
          ))}
        </Tabs>
      </Paper>
      {selectedSite && (
        <Paper sx={{ mb: 2, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" color="text.secondary">
            Plan de salle pour: <strong>{selectedSite.site_name}</strong>
            {eventPlan?.length > 0 && <span> — {eventPlan.length} plan(s) trouvé(e)</span>}
            {loadingPlan && <CircularProgress size={16} sx={{ ml: 2 }} />}
          </Typography>
        </Paper>
      )}
      <Box
        sx={{
          width: '100%',
          height: 'calc(100vh - 300px)',
          minHeight: 500,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          position: 'relative',
        }}
      >
        {loadingPlan ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography>Chargement du plan...</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                minWidth: '1500px',
                minHeight: '1200px',
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <SeatingEditor
                key={`editor-${selectedSite?.id || 'default'}-${editorKey}`}
                height="100%"
                width="100%"
                position="relative"
                initialLayout={layout}
                backgroundColor="#f5f5f5"
                onLayoutChange={handleLayoutChange}
                onSave={onSaveLayout}
                getSiteName={getSiteName}
                hideToolbar={true}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PlanView;
