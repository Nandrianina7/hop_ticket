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
import { useState } from 'react';
import hoplogo from '../assets/hoplogo.jpeg';
import { useThemeContext } from '../ThemeContext';
import UserProfile from '../Pages/UserProfile';

const Appbar = ({ cinema = { name: '' }, user = { role: '', name: '' } }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { darkMode, toggleDarkMode } = useThemeContext();
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const capitalizeFirstLetter = (str = '') =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <AppBar
      // position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: (theme) => theme.palette.background.paper,
        color: (theme) => theme.palette.text.primary,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        borderBottom: (theme) =>
          `1px solid ${theme.palette.divider}`,
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
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
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
              {darkMode ? <DarkMode /> : <WbSunny />}
            </IconButton>
          </Tooltip>

          {/* NOTIFICATIONS */}
          {/* <Tooltip title="Notifications">
            <IconButton size="large">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip> */}

          {/* USER MENU */}
          <Tooltip title="Compte utilisateur">
            <IconButton size="small" onClick={handleMenu}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
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
      <UserProfile
        open={open}
        handleClose={handleClose}
        anchorEl={anchorEl}
        user={user}
      />
    </AppBar>
  );
};

export default Appbar;
