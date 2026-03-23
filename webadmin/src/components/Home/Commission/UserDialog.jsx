import { Menu, Box, Typography, Avatar, Stack, Divider, Chip } from '@mui/material';

const UserDialog = ({ info, anchorEl, open, onClose }) => {
  if (!info) return null;

  const initials = `${info.first_name?.[0] || ''}${info.last_name?.[0] || ''}`;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          p: 2,
          width: 300,
          borderRadius: 3,
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 50, height: 50 }}>{initials.toUpperCase()}</Avatar>

        <Box>
          <Typography fontWeight="bold">
            {info.first_name} {info.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {info.email}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Info Section */}
      <Stack spacing={1}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Téléphone
          </Typography>
          <Typography>{info.phone}</Typography>
        </Box>

        {info.birth_date && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Date de naissance
            </Typography>
            <Typography>{new Date(info.birth_date).toLocaleDateString()}</Typography>
          </Box>
        )}
      </Stack>
    </Menu>
  );
};

export default UserDialog;
