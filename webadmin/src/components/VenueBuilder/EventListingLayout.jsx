import React from "react";
import { 
  Tabs, 
  Tab, 
  Box, 
  Paper,
  Typography,
  Button
} from "@mui/material";
import SeatToolkit from "@mezh-hq/react-seat-toolkit";
import "@mezh-hq/react-seat-toolkit/styles";
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import SeatingEditor from "../SeatingEditor.jsx";

const EventLayoutListingComponent = () => {
  const navigate = useNavigate();
  const [eventSite, setEventSite] = React.useState([]);
  const [selectedSite, setSelectedSite] = React.useState(null);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [eventPlan, setEventPlan] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  // Missing state for layout and siteName, added here to make other functions work
  const [layout, setLayout] = React.useState({
    sections: [
      { id: 'section-1', name: 'Section A', color: '#ff6b6b', x: 50, y: 200, width: 150, height: 120, rotation: 0, seats: [], type: 'section' },
      { id: 'section-2', name: 'Section B', color: '#4ecdc4', x: 250, y: 200, width: 150, height: 120, rotation: 0, seats: [], type: 'section' },
      { id: 'section-3', name: 'Section C', color: '#4ecdc4', x: 450, y: 200, width: 200, height: 120, rotation: 0, seats: [], type: 'section' },

    ],
    scale: 1
  }); 
  const [siteName, setSiteName] = React.useState(null); 

  async function fetchEventSites() {
    setLoading(true);
    try {
      const response = await api.get(`/api/event_site/`, { withCredentials: true });
      if (response.data?.data) {
        setEventSite(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching event sites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveEvent(data) {
    try {
      const response = await api.post('/api/new/event_plan/', data, { withCredentials: true });
      if (!response.data) return console.log('No response found');
      console.log('Saved layout');
      return response.data;
    } catch (error) {
      console.log('Error', Error(error).message);
    }
  };

  async function getEventPlan(site_name) {
    try {
      const response = await api.get(`/api/event_plan/${site_name}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.log('Error fetching event plan:', error);
      return null;
    }
  }

  const handleTabChange = async (_, newIndex) => {
    setSelectedTab(newIndex);
    const newSite = eventSite[newIndex];
    setSelectedSite(newSite);
    const jsontab=[{
    sections: [
      { id: 'section-1', name: 'Section A', color: '#ff6b6b', x: 50, y: 200, width: 150, height: 120, rotation: 0, seats: [], type: 'section' },
      // { id: 'section-2', name: 'Section B', color: '#4ecdc4', x: 250, y: 200, width: 150, height: 120, rotation: 0, seats: [], type: 'section' }
    ],
    scale: 1
  },{
    sections: [
      { id: 'section-1', name: 'Section A', color: '#ff6b6b', x: 50, y: 200, width: 150, height: 120, rotation: 0, seats: [], type: 'section' },
      { id: 'section-2', name: 'Section B', color: '#4ecdc4', x: 250, y: 200, width: 150, height: 120, rotation: 0, seats: [], type: 'section' }
    ],
    scale: 1
  }]

    if (newSite?.site_name) {
      setLoading(true);
      try {
        const planData = await getEventPlan(newSite.site_name);
        if (planData?.data) {
          setEventPlan(planData.data);
          // ⚠️ FIX: Update layout state with the initial plan metadata
          if (planData.data.length > 0) {
              const initialMetadata = planData.data[planData.data.length - 1].metadata;
              // Ensure metadata is parsed if it's stored as a JSON string
              setLayout(typeof initialMetadata === 'string' ? JSON.parse(initialMetadata) : initialMetadata);
              // setLayout(jsontab[newIndex]);
          } else {
              setLayout(null);
          }
        }
      } catch (error) {
        console.log('Error loading event plan:', error);
        setLayout(null);
      } finally {
        setLoading(false);
      }
    } else {
      setEventPlan(null);
      setLayout(null);
    }
    console.log('Selected site:', newSite);
    console.log('Event plan for site:', layout);
  };

  // ✅ FIX 1: Initial fetch on mount
  React.useEffect(() => {
    fetchEventSites();
  }, []);

  // ✅ FIX 2: Watch eventSite and select the first site after data loads
  React.useEffect(() => {
    if (eventSite.length > 0 && selectedSite === null) {
      // Trigger the tab change handler to set selectedSite and fetch eventPlan
      handleTabChange(null, 0); 
    }
  }, [eventSite]); // Dependency on eventSite

  const handleLayoutChange = (newLayout) => {
    console.log('Layout changed:', newLayout);
    setLayout(newLayout);
  };

  const onSaveLayout = async () => {
    const layoutData = {
      name: selectedSite.site_name, // Use selectedSite name
      metaData: layout,
    };
    const savedLayout = await saveEvent(layoutData);
    if (savedLayout) {
      console.log('Layout saved successfully:', savedLayout);
    }
    console.log('Layout to be saved:', layout);
    console.log('For site:', selectedSite.site_name);
  };

  const getSiteName = (site_name) => {
    console.log('Searching for site name:', site_name);
    setSiteName(site_name);
  };
  
  // ... (rest of the component JSX, which is correct)
  if (!loading && eventSite.length === 0) {
  return (
    
    <Box sx={{ width: '80%', height: '80vh', display: 'flex', flexDirection: 'column', ml: 5, mt: 5, position: "fixed", justifyContent: "center", alignItems: "center"}}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Creation de plan de salle
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        vous n'avez pas encore créé de plan de salle. Commencez par créer votre premier plan de salle.
      </Typography>

      <Button 
        variant="contained" 
        color="primary"
        onClick={() => navigate('/event-layout')}
      >
        Crée votre premier plan de salle
      </Button>
    </Box>
  );
}

 return (
  <Box 
    sx={{ 
      height: "100vh",
      display: "flex",
      width: "80%",

      flexDirection: "column",
      p: 2,
      // ✅ 1. PREVENT PAGE OVERFLOW
      // This ensures the main page never scrolls, only the inner components do.
      overflow: "hidden", 
      // position: "fixed",
    }}
  >

    {/* <Typography variant="h5" sx={{ mb: 2 }}>
      liste de plan de salle
    </Typography> */}

    <Box 
      sx={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        gap: 2, 
        mb: 2 
      }}
    >
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => navigate('/event-layout')}
      >
        Crée nouveau plan de salle
      </Button>

      <Button 
        variant="outlined" 
        color="error"
        disabled={!eventPlan || eventPlan.length === 0}
        onClick={() => console.log('Delete layout functionality not implemented')}
      >
        supprimer le plan de salle
      </Button>
    </Box>     

    <Paper sx={{ mb: 2 }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
      >
        {eventSite.map((site, index) => (
          <Tab 
            key={site.id || index} 
            label={site.site_name}
            disabled={loading}
          />
        ))}
      </Tabs>
    </Paper>

    {selectedSite && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        plan de salle pour: <strong>{selectedSite.site_name}</strong>
        {eventPlan?.length > 0 && (
          <span> — {eventPlan.length} plan(s) trouvé(e)</span>
        )}
      </Typography>
    )}

    {/* ✅ 2. VIEWPORT CONTAINER */}
    <Box 
      sx={{ 
        flex: 1,            // Fill remaining vertical space
        minHeight: 0,       // Crucial for nested scrolling in Flexbox
        overflow: "auto",   // Enables Scrollbars (Left/Right/Top/Bottom)
        border: "1px solid #ddd", // Optional: to see the boundary
        position: "relative"
      }}
    >
        {/* ✅ 3. CANVAS WRAPPER */}
        {/* We create a 'large' div here to force scrolling. 
            If SeatingEditor has internal width/height, apply it there instead. */}
        <Box 
            sx={{ 
                minWidth: "1500px",  // Must be wider than screen to scroll X
                minHeight: "1200px", // Must be taller than container to scroll Y
                display: "inline-block" // Keeps it tight to content
            }}
        >
            <SeatingEditor
              // Remove "100vh" here, or set it to "100%" of the parent "1200px" box
              height="100%" 
              width="75%"
              position="relative"
              initialLayout={layout}
              backgroundColor="#f5f5f5"
              onLayoutChange={handleLayoutChange}
              onSave={onSaveLayout} 
              getSiteName={getSiteName}
            />
        </Box>
    </Box>
  </Box>
);

};

export default EventLayoutListingComponent;