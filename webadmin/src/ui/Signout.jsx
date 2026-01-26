import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Avatar,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { Logout, Cancel, Warning } from '@mui/icons-material';
import { deleteCookie } from '../utils/cookie';
import { useNavigate } from 'react-router-dom';

const Signout = ({ open, onClose }) => {
  const theme = useTheme();
  const navigateTo = useNavigate();

  const onLogout = (e) => {
    e.preventDefault();
    const refresh_token = document.cookie.includes('refresh_token');
    const access_token = document.cookie.includes('access_token');

    if (!refresh_token) {
      console.log('no refresh token found');
      navigateTo('/');
    } else {
      deleteCookie('refresh_token');
      navigateTo('/');
      onClose();
    }

    if (access_token) {
      deleteCookie('access_token');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="logout-dialog"
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 2,
          backgroundColor: alpha(theme.palette.error.light, 0.1),
          borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.warning.main,
            border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          <Warning sx={{ fontSize: 20 }} color="error" />
        </Avatar>
      </Box>

      <DialogContent sx={{ py: 2, px: 2, textAlign: 'center' }}>
        <DialogTitle
          id="logout-dialog"
          sx={{
            p: 0,
            mb: 2,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: theme.palette.text.primary,
          }}
        >
          Se Deconnecter?
        </DialogTitle>

        <DialogContentText
          sx={{
            fontSize: '0.9rem',
            color: theme.palette.text.secondary,
            lineHeight: 1.6,
            mb: 1,
          }}
        >
          ete vous sur de vouloir vous deconnecter de votre compte ?
        </DialogContentText>

        <DialogContentText
          sx={{
            fontSize: '0.8rem',
            color: theme.palette.text.disabled,
            fontStyle: 'italic',
          }}
        >
          {/* You'll need to sign in again to access your account. */}
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          startIcon={<Cancel />}
          sx={{
            flex: 1,
            py: 1,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          }}
        >
          annuler
        </Button>
        <Button
          onClick={onLogout}
          variant="contained"
          color="error"
          startIcon={<Logout />}
          sx={{
            flex: 1,
            py: 1,
            borderRadius: 2,
            fontWeight: 'bold',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Se Deconnecter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Signout;
