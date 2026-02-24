import React, { useRef } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert, // add Alert
} from '@mui/material';
import api from '../../api/api';
import LocationInput from '../VenueBuilder/LocationInput.jsx';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import SeatingEditor from '../SeatingEditor.jsx';
//  import { SeatingEditor } from "seatmap-creator";
const EventLayoutComponent = () => {
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [eventSite, setEventSite] = React.useState([]);
  const [selectedSite, setSelectedSite] = React.useState(null);
  const [eventPlan, setEventPlan] = React.useState(null);
  const [eventLoc, setEventLocation] = React.useState(null);
  const [Layout, setLayout] = React.useState(null);
  const [siteName, setSiteName] = React.useState('');

  // Feedback state
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' });

  async function getEventSite(params) {
    try {
      const response = await api.get(`/api/event_site/`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.log('Error fetching event site:', error);
      return null;
    }
  }
  async function saveEventLocation(data) {
    try {
      const response = await api.post('/api/event_site_locations/', data, {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('No response founded');
        return;
      }
    } catch (error) {
      console.log('Error saving event location:', error);
    }
  }
  async function getEventPlan(site_name) {
    try {
      const response = await api.get(`/api/event_plan/${site_name}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.log('Error fetching event plan:', error);
      return null;
    }
  }
  async function saveEvent(data) {
    try {
      const response = await api.post('/api/event_plan/', data, { withCredentials: true });

      if (!response.data) {
        console.log('No response founded');
        return;
      }

      console.log('Successfully saved venue');
      return response.data;
    } catch (error) {
      console.log('Error', Error(error).message);
    }
  }
  const handleLayoutChange = (layout) => {
    console.log('Layout changed:', layout);
    setLayout(layout);
  };
  const onSaveLayout = async () => {
    const layoutData = { name: siteName, metaData: Layout };
    try {
      const savedLayout = await saveEvent(layoutData);
      if (savedLayout) {
        setSnack({
          open: true,
          message: 'Le plan de salle a été enregistré avec succès!',
          severity: 'success',
        });
        // navigate after showing feedback
        setTimeout(() => navigate('/event-listing'), 800);
      } else {
        setSnack({ open: true, message: 'Échec: de l’enregistrement.', severity: 'error' });
      }
    } catch (err) {
      setSnack({
        open: true,
        message: 'Échec de l’enregistrement. Veuillez réessayer.',
        severity: 'error',
      });
    }
  };

  const getSiteName = (site_name) => {
    console.log('Searching for site name:', site_name);
    setSiteName(site_name);
  };

  return (
    <>
      <SeatingEditor
        backgroundColor="#f5f5f5"
        onLayoutChange={handleLayoutChange}
        onSave={onSaveLayout}
        getSiteName={getSiteName}
      />

      {/* Save feedback */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EventLayoutComponent;
