import { useEffect, useState } from 'react';
import { Box, Menu, MenuItem, Typography, Avatar, Divider, Stack, Tabs, Tab } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import ManageOrganizer from '../ManageOrganizer/ManageOrganizer';
import api from '../../../api/api';

const NotificationBox = ({ open, handleClose, anchorEl, data = [], fetchNotif }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [openOrgInfo, setopenOrgInfo] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const grouped = data.reduce((acc, notif) => {
    if (!acc[notif.target_content]) acc[notif.target_content] = [];
    acc[notif.target_content].push(notif);
    return acc;
  }, {});

  const tabKeys = Object.keys(grouped);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/accounts/notif_mark_read/${id}/`, {}, { withCredentials: true });

      if (!res.data) {
        console.log('failed to marking as read');
        return;
      }

      console.log('Successfully read');
    } catch (error) {
      console.log('error', error);
    }
  };
  const handleNotificationClick = (notif) => {
    switch (notif.target_content) {
      case 'signup_approvation':
        setopenOrgInfo(true);
        setSelectedId(notif.organizer_id);
        markAsRead(notif.id);
        console.log('Go to organizer:', notif.organizer_id);
        break;

      case 'cinema_approvation':
        console.log('Go to cinema:', notif.target_id);
        break;

      case 'event_approvation':
        console.log('Go to event:', notif.target_id);
        break;

      default:
        console.log('Unknown notification type');
    }
    fetchNotif();
    handleClose();
  };

  return (
    <Box>
      <Menu
        id="notification-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: '45px' }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 'calc(60vh - 64px)',
            overflowY: 'auto',
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 1, pb: 0 }}>
          <Typography variant="h6" fontWeight="600" fontSize={16}>
            Notifications
          </Typography>
        </Box>

        {tabKeys.length > 1 && (
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabKeys.map((key, index) => (
              <Tab key={index} label={key.replace('_', ' ').toUpperCase()} />
            ))}
          </Tabs>
        )}

        {tabKeys.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}

        {tabKeys.length > 0 &&
          grouped[tabKeys[tabIndex]].map((notif, index) => (
            <Box key={index}>
              <MenuItem
                onClick={() => handleNotificationClick(notif)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                  py: 1,
                  px: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: 'primary.main',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {notif.organizer_email?.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="baseline"
                      spacing={1}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="600"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {notif.organizer_email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    pl: '52px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,
                  }}
                >
                  {notif.content}
                </Typography>
              </MenuItem>
              {index < grouped[tabKeys[tabIndex]].length - 1 && <Divider sx={{ my: 0 }} />}
            </Box>
          ))}
      </Menu>
      <ManageOrganizer
        open={openOrgInfo}
        onClose={() => setopenOrgInfo(false)}
        org_id={selectedId && selectedId}
      />
    </Box>
  );
};

export default NotificationBox;
