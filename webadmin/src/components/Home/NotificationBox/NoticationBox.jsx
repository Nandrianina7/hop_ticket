import { Box, Menu, MenuItem, Typography } from '@mui/material';

const NotificationBox = ({ open, handleClose, anchorEl }) => {
  return (
    <Box>
      <Menu
        id="notification-menu"
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
        sx={{ mt: '45px' }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 'calc(60vh - 64px)',
            overflowY: 'auto',
          },
        }}
      >
        <MenuItem>Not</MenuItem>
        {Array.from({ length: 20 }, (_, index) => (
          <MenuItem key={index} onClick={handleClose}>
            <Typography variant="body2">Notification {index + 1}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default NotificationBox;
