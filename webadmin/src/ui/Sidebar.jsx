import React, { useEffect, useState } from 'react';
import {
  Dashboard,
  Event,
  Logout,
  People,
  Settings,
  TvOutlined,
  Movie,
  House,
  Shop,
  Map,
  Menu as MenuIcon,
  ChevronLeft,
  LivingOutlined,
  History,
} from '@mui/icons-material';
import { Avatar, Box, Divider, IconButton, Typography, useTheme } from '@mui/material';
import { useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import Signout from './Signout';
// import { useLocation, NavLink as RouterNavLink } from 'react-router-dom';

const Sidebar = ({ role = '', collapsed, setCollapsed }) => {
  const theme = useTheme();
  const location = useLocation(); // <— track current route
  const currentPath = location.pathname;
  const [navigation, setNavigation] = useState([]);
  const [openLogout, setOpenLogout] = useState(false);
  const [cinemaMenuOpen, setCinemaMenuOpen] = useState(false);

  const itemsForAdmin = [
    { icon: <Dashboard />, text: 'Dashboard', path: '/home' },
    { icon: <Event />, text: 'Evenement', path: '/event' },
    { icon: <People />, text: 'Clients', path: '/constumers' },
    {
      icon: <TvOutlined />,
      text: 'Cinema',
      path: '/cinema',
      children: [
        { text: 'Films', path: '/cinema/movies', icon: <Movie /> },
        { text: 'Halls', path: '/cinema/halls', icon: <House /> },
      ],
    },
    { icon: <History />, path: '/history', text: 'Organisateur' },
  ];

  const itemsForOrganizer = [
    { icon: <Dashboard />, path: '/home', text: 'Dashboard' },
    { icon: <Movie />, path: '/organizer/movie', text: 'films' },
    { icon: <House />, path: '/organizer/hall', text: 'salles' },
    { icon: <Shop />, path: '/organizer/snack', text: 'Concession' },
    { icon: <People />, text: 'Clients', path: '/organizer/customers' },
  ];

  const itemsForEventOrganizer = [
    { icon: <Dashboard />, path: '/home', text: 'Dashboard' },
    { icon: <Event />, path: '/event', text: 'Evenements' },
    { icon: <People />, path: '/constumers', text: 'Clients' },
    { icon: <LivingOutlined />, path: '/plan', text: 'plan de salle' },
  ];

  useEffect(() => {
    if (role === 'admin') setNavigation(itemsForAdmin);
    else if (role === 'event_organizer') setNavigation(itemsForEventOrganizer);
    else setNavigation(itemsForOrganizer);
  }, [role]);

  const isActive = (path) => currentPath === path;
  const hasActiveChild = (item) => item.children?.some((c) => currentPath.startsWith(c.path));

  const sidebarWidth = 240;

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: collapsed ? 80 : sidebarWidth,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
        zIndex: 1200,
        transition: 'width 0.3s ease',
      }}
    >
      <ProSidebar
        collapsed={collapsed}
        rootStyles={{
          height: '100%',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        {/* --- Header --- */}
        <Box
          sx={{
            px: 2,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          {/* <Box display="flex" alignItems="center" gap={1.5}> </Box> */}

          {!collapsed && (
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'text.primary' }}>HT</Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                HOP ! ticket
              </Typography>
            </Box>
          )}
          <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
            {collapsed ? <MenuIcon /> : <ChevronLeft />}
          </IconButton>
        </Box>

        <Divider />

        {/* --- Menu --- */}
        <Menu
          rootStyles={{
            ['& .ps-menu-button']: {
              borderRadius: 8,
              margin: '4px 8px',
              color: theme.palette.text.primary,
              transition: 'all 0.2s ease',
            },
            ['& .ps-menu-button:hover']: {
              backgroundColor: theme.palette.action.hover,
            },
            ['& .active-link']: {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 1500,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            },

            ['& .active-link .ps-menu-icon']: {
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          {navigation.map((item, index) =>
            item.children ? (
              <SubMenu
                key={index}
                icon={item.icon}
                label={item.text}
                // defaultOpen={cinemaMenuOpen}
                defaultOpen={hasActiveChild(item)}
                onOpenChange={setCinemaMenuOpen}
              >
                {item.children.map((child, childIndex) => (
                  <MenuItem
                    key={childIndex}
                    icon={child.icon}
                    component={
                      <RouterNavLink
                        to={child.path}
                        end
                        className={({ isActive: navActive }) => (navActive ? 'active-link' : '')}
                      />
                    }
                    active={window.location.pathname === child.path}
                  >
                    <Typography
                      component="span"
                      sx={{
                        color:
                          location.pathname === item.path ? '#fff' : theme.palette.text.primary,
                      }}
                    >
                      {item.text}
                    </Typography>
                  </MenuItem>
                ))}
              </SubMenu>
            ) : (
              <MenuItem
                key={index}
                icon={item.icon}
                className={isActive(item.path) ? 'active-link' : ''}
                component={
                  <RouterNavLink
                    to={item.path}
                    end
                    className={({ isActive: navActive }) => (navActive ? 'active-link' : '')}
                  />
                }
                active={window.location.pathname === item.path}
              >
                <Typography
                  component="span"
                  sx={{
                    color: location.pathname === item.path ? '#fff' : theme.palette.text.primary,
                  }}
                >
                  {item.text}
                </Typography>
              </MenuItem>
            )
          )}
        </Menu>

        <Divider sx={{ mt: 2 }} />

        {/* --- Footer --- */}
        <Menu>
          {/* <MenuItem icon={<Settings />}>Settings</MenuItem> */}
          <MenuItem icon={<Logout />} onClick={() => setOpenLogout(true)}>
            Se déconnecter
          </MenuItem>
        </Menu>

        <Signout open={openLogout} onClose={() => setOpenLogout(false)} />
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
