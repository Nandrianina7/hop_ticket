import { Container, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import CineOrgSignupForm from '../../components/CineOrg/CineOrgSignupForm';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const EventOrgSignup = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();
  const onSaveOrg = async (formData) => {
    try {
      const response = await api.post(`${API_URL}/accounts/event_organizer/signup/`, formData, {
        withCredentials: true,
      });

      if (!response.data) {
        setSnackbar({
          open: true,
          message: 'Failed to register user',
          severity: 'error',
        });
        return;
      }

      setSnackbar({
        open: true,
        message: 'User registered successfully!',
        severity: 'success',
      });
      navigate('/');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to register, server error',
        severity: 'error',
      });
      console.log('Server error', Error(error).message);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 3,
        gap: 6,
        height: '90vh',
      }}
    >
      <CineOrgSignupForm onSave={onSaveOrg} name="event" />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventOrgSignup;
