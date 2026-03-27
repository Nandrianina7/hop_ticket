import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { DarkMode, Notifications, WbSunny } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import hoplogo from '../assets/hoplogo.jpeg';
import { useThemeContext } from '../ThemeContext';
import UserProfile from '../Pages/UserProfile';
import api from '../api/api';
import NotificationBox from '../components/Home/NotificationBox/NoticationBox';

const Appbar = ({ cinema = { name: '' }, user = { role: '', name: '' } }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { darkMode, toggleDarkMode } = useThemeContext();
  const open = Boolean(anchorEl);
  const [anchorNot, setAnchorNot] = useState(null);
  const openNot = Boolean(anchorNot);
  const [notification, setNotification] = useState([]);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleNotif = (event) => setAnchorNot(event.currentTarget);
  const capitalizeFirstLetter = (str = '') =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  const fetchNotification = async () => {
    try {
      const res = await api.get('/accounts/notifications/', { withCredentials: true });

      if (!res.data) {
        console.log('failed to fetch notification');
        return;
      }
      console.log('Notification successfully loaded');
      const data = res.data.data;
      setNotification(data);
      console.log('data', data);
    } catch (error) {
      console.log(error.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, []);

  return (
    <AppBar
      // position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: (theme) => theme.palette.background.paper,
        color: (theme) => theme.palette.text.primary,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        height: '70px',
        justifyContent: 'center',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
        }}
      >
        {/* ---- LOGO ---- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src={hoplogo}
            alt="hop logo"
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Hop ! Ticket
          </Typography>
        </Box>

        {/* ---- CINEMA NAME (CENTER) ---- */}
        {user?.role === 'organizer' && (
          <Typography
            variant="h5"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              fontWeight: 600,
              color: 'primary.main',
              display: { xs: 'none', md: 'block' },
            }}
          >
            {capitalizeFirstLetter(cinema.name)}
          </Typography>
        )}

        {/* ---- ACTIONS (RIGHT SIDE) ---- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* DARK MODE TOGGLE */}
          <Tooltip title="Changer le mode">
            <IconButton onClick={toggleDarkMode} size="large">
              {darkMode ? <DarkMode fontSize="small" /> : <WbSunny fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* NOTIFICATIONS */}
          <Tooltip title="Notifications">
            <IconButton size="small" onClick={handleNotif}>
              <Badge badgeContent={notification.length} color="error">
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* USER MENU */}
          <Tooltip title="Compte utilisateur">
            <IconButton size="small" onClick={handleMenu}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: 'primary.main',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* ---- USER MENU MODAL ---- */}
      <UserProfile open={open} handleClose={handleClose} anchorEl={anchorEl} user={user} />
      <NotificationBox
        open={openNot}
        anchorEl={anchorNot}
        handleClose={() => setAnchorNot(null)}
        data={notification}
        fetchNotif={fetchNotification}
      />
    </AppBar>
  );
};

export default Appbar;
