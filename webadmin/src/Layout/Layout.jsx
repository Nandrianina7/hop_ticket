import { Box, CssBaseline, Toolbar, useTheme } from '@mui/material';
import Appbar from '../ui/Appbar';
import Sidebar from '../ui/Sidebar';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/api';

const drawerWidth = 240; // Largeur quand ouvert
const collapsedWidth = 80; // Largeur quand fermé
const appbarHeight = 70;

const Layout = () => {
  const [user, setUser] = useState(null);
  // const [cinema, setCinema] = useState(null);
  const [cinema, setCinema] = useState();
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();

  // --- API Calls ---
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/accounts/getCurrentUser/', { withCredentials: true });
      if (response?.data?.data) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.log('Failed to fetch current user', error);
    }
  };

  const fetchCinema = async () => {
    try {
      const response = await api.get('/cinema/organizer/cinema/', { withCredentials: true });
      const resultat = response?.data?.data;
      if (Array.isArray(resultat) && resultat.length > 0) {
        setCinema(resultat[0]);
      }
    } catch (error) {
      console.log('Failed to fetch cinema', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchCinema();
  }, []);

  return (
    <Box sx={{ display: 'flex', backgroundColor: theme.palette.background.default }}>
      <CssBaseline />

      {/* --- Appbar --- */}
      <Appbar cinema={cinema} user={user} />

      {/* --- Sidebar --- */}
      <Sidebar role={user?.role} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* --- Main Content --- */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // mt: `${appbarHeight}px`,
          ml: collapsed ? `${collapsedWidth}px` : `${drawerWidth}px`,
          transition: 'margin-left 0.3s ease',
          backgroundColor: theme.palette.background.default,
          minHeight: `calc(100vh - ${appbarHeight}px)`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
