import { Container, Box, Collapse, Fade, Zoom, Snackbar, Alert } from '@mui/material';
import CineOrgSignupForm from '../../components/CineOrg/CineOrgSignupForm';
import axios from 'axios';
import CinemaForm from '../../components/CineOrg/CinemaForm';
import api from '../../api/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const CinemaSignup = () => {
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showCinemaForm, setShowCinemaForm] = useState(false);
  const [snackBar, setSnackBar] = useState({
    open: false,
    severity: '',
    message: '',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackBar({ open: true, severity, message });
  };
  const navigate = useNavigate();
  const onRegister = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/accounts/organizer/register/`, formData, {
        withCredentials: true,
      });

      if (response.status !== 200 && response.status !== 201) {
        console.log('Failed to register organizer account');
        showSnackbar("Échec de l'inscription du compte organisateur", 'error');
        return;
      }
      if (response.status === 400) {
        showSnackbar('Champs requis manquants ou mauvaise requête', 'warning');
        return;
      }
      showSnackbar('Compte organisateur enregistré avec succès', 'success');
      console.log('Compte organisateur enregistré avec succès');
      setSignupSuccess(true);
      setTimeout(() => {
        setShowCinemaForm(true);
      }, 500);
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(`error mess: ${errorMess}, detail -> ${error}`);
      showSnackbar(errorMess, 'error');
    }
  };

  const onCreateCinema = async (data) => {
    try {
      const response = await api.post('/cinema/add_halls/', data, { withCredentials: true });
      if (!response.data) {
        console.log('failed to save your cinema');
        showSnackbar("Échec de l'enregistrement de votre cinéma", 'error');
        return;
      }
      if (response.status === 400) {
        showSnackbar('Mauvaise requête', 'warning');
        return;
      }
      showSnackbar('Salle de cinéma ajoutée avec succès');
      console.log('Salle de cinéma ajoutée avec succès');
      navigate('/home');
    } catch (error) {
      const errMess = error instanceof Error ? error.message : 'Unknown error occured';
      console.log(`Error -> ${error}`);
      showSnackbar(errMess, 'error');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '90vh',
        py: 4,
        gap: 6,
        position: 'relative',
      }}
    >
      <Collapse in={!signupSuccess} timeout={800} unmountOnExit>
        <Box sx={{ width: '100%', mt: 20 }}>
          <CineOrgSignupForm onSave={onRegister} />
        </Box>
      </Collapse>
      <Fade in={signupSuccess && !showCinemaForm} timeout={1000}>
        <Box
          sx={{
            textAlign: 'center',
            color: 'success.main',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          Inscription réussie ! Veuillez ajouter les détails de votre cinéma.
        </Box>
      </Fade>

      <Zoom in={showCinemaForm} timeout={1000}>
        <Box sx={{ width: '100%' }}>
          <CinemaForm onSave={onCreateCinema} />
        </Box>
      </Zoom>
      <Snackbar
        open={snackBar.open}
        onClose={() => setSnackBar({ ...snackBar, open: false })}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackBar({ ...snackBar, open: false })}
          severity={snackBar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackBar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CinemaSignup;
