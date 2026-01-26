import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Chip,
  IconButton,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  LocationOn,
  Edit,
  Logout,
  Badge,
  Business,
} from '@mui/icons-material';
import api from '../../api/api';
import Signout from '../../ui/Signout';

const UserProfile = ({ open, handleClose, anchorEl }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/accounts/getCurrentUser/', {
        withCredentials: true,
      });

      if (!response.data) {
        console.log("Can't get current user");
        return;
      }

      const data = response.data.data;
      console.log('Current user fetched successfully', data);
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (open && isMounted) {
      fetchCurrentUser();
    }

    return () => {
      isMounted = false;
    };
  }, [open, fetchCurrentUser]);

  const handleLogout = (e) => {
    e?.stopPropagation();
    setOpenLogout(true);
  };
  const handleSignoutClose = () => {
    setOpenLogout(false);
    handleClose();
  };
  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    handleClose();
  };
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Menu
      id="user-profile-menu"
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        mt: '45px',
        '& .MuiPaper-root': {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      }}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: '85vh',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          p: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={60} height={60} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={30} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(user?.full_name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" noWrap>
                  {user?.full_name || 'Anonymous User'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {user?.role || 'User'}
                </Typography>
              </Box>
              <IconButton
                sx={{
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
                onClick={handleEditProfile}
                size="small"
              >
                <Edit />
              </IconButton>
            </Box>
          </>
        )}
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <List sx={{ py: 0 }}>
          <ListItem sx={{ px: 3 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Email color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
              }
              secondary={
                loading ? (
                  <Skeleton variant="text" width="80%" />
                ) : (
                  <Typography variant="body1" noWrap>
                    {user?.email || 'Not provided'}
                  </Typography>
                )
              }
            />
          </ListItem>
          <ListItem sx={{ px: 3 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Phone color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
              }
              secondary={
                loading ? (
                  <Skeleton variant="text" width="60%" />
                ) : (
                  <Typography variant="body1">{user?.phone || 'Not provided'}</Typography>
                )
              }
            />
          </ListItem>

          {/* <ListItem sx={{ px: 3 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Badge color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  User ID
                </Typography>
              }
              secondary={
                loading ? (
                  <Skeleton variant="text" width="70%" />
                ) : (
                  <Typography variant="body1" fontFamily="monospace" fontSize="0.8rem">
                    {user?.id || 'N/A'}
                  </Typography>
                )
              }
            />
          </ListItem> */}
          <ListItem sx={{ px: 3 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CalendarToday color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  Member since
                </Typography>
              }
              secondary={
                loading ? (
                  <Skeleton variant="text" width="50%" />
                ) : (
                  <Typography variant="body1">
                    {formatDate(user?.created_at || user?.date_joined)}
                  </Typography>
                )
              }
            />
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEditProfile}
            sx={{ mb: 1 }}
          >
            Edit Profile
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Se Deconnecter
          </Button>
        </Box>
      </Box>
      <Signout open={openLogout} onClose={handleSignoutClose} />
    </Menu>
  );
};

export default UserProfile;
