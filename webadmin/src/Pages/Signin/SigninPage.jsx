import { Alert, Box, Button, Container, Snackbar } from '@mui/material';
import SigninForm from '../../components/SigninForm';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SigninPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [message, setMessage] = useState('');
  const [typeMess, setTypeMess] = useState('error');
  const [openAlert, setOpenAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });

  const navigateTo = useNavigate();
  axios.defaults.withCredentials = true;

  const postData = (data) => {
    const backendUrl = `${apiUrl}/accounts`;
    console.log('received data', data);
    return axios.post(
      `${backendUrl}/login/`,
      { ...data },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
  };

  const handleInput = (e) => {
    const { value, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => {
    setFormData((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('clicked');
    console.log({ ...formData });

    setLoading(true);
    setOpenAlert(false);

    try {
      const response = await postData({ ...formData });

      if (!response.data) {
        console.log('error to log in');
        setOpenAlert(true);
        setMessage('Failed to log in, Please try again');
        setTypeMess('error');
        setLoading(false);
        return;
      }

      if (!response.data.success) {
        const mess = response.data.message;
        console.log(mess);
        setOpenAlert(true);
        setMessage(mess);
        setTypeMess('error');
        setLoading(false);
        return;
      }

      console.log('log successfully');
      console.log(response.data);
      setOpenAlert(true);
      setMessage('Login successful! Redirecting...');
      setTypeMess('success');

      setTimeout(() => {
        navigateTo('/home');
      }, 1500);
    } catch (error) {
      console.log('Server error:', error);

      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';

      setOpenAlert(true);
      setMessage(errorMessage);
      setTypeMess('error');
      setLoading(false);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenAlert(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        minHeight: '90vh',
        py: 4,
        gap: 6,
      }}
    >
      <Snackbar
        open={openAlert}
        onClose={handleClose}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={typeMess}
          variant="filled"
          sx={{ width: '100%', minWidth: '300px' }}
        >
          {message}
        </Alert>
      </Snackbar>
      <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 3 }}>
        <Link to="/organizer/signup">
          <Button variant="contained" fullWidth>
            S'inscrire en tant que cinema
          </Button>
        </Link>
        <Link to="/event_organizer/signup">
          <Button variant="outlined" fullWidth>
            s'inscrire en tant qu'organisateurs d'evenement
          </Button>
        </Link>
      </Box>

      <SigninForm
        handleInput={handleInput}
        formData={formData}
        showPassword={handleClickShowPassword}
        handleSubmit={handleSubmit}
        user_type="admin"
        loading={loading}
      />
    </Container>
  );
};

export default SigninPage;
