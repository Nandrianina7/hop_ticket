import { Alert, Box, Container, Snackbar } from '@mui/material';
import SignupForm from '../../components/SignupForm';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
const SignupPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
  });
  const [snackBar, setSnackBar] = useState({
    open: false,
    severity: '',
    message: '',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackBar({ open: true, severity, message });
  };
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const handleInput = (e) => {
    e.preventDefault();
    const { value, name } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('clicked');
    if (
      formData.email.trim() === '' &&
      formData.password.trim() === '' &&
      formData.username.trim() === '' &&
      formData.phone.trim() === ''
    ) {
      showSnackbar('Please fill all the fieled', 'warning');
      console.log('All field is required');
      return;
    }
    console.log(formData);

    try {
      const response = await axios.post(
        `${apiUrl}/accounts/register/`,
        {
          email: formData.email,
          full_name: formData.username,
          password: formData.password,
          phone: formData.phone,
        },
        {
          headers: {
            // 'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      if (!response.data) {
        console.log('not work');
        showSnackbar('Server not responding', 'error');
      } else {
        navigate('/');
        console.log('Admin registered');
        showSnackbar(response.data.message, 'success');
      }
    } catch (error) {
      const errorMess = error.response?.data?.detail || error.message || 'Unknown error occurred';
      console.log(`Error -> ${errorMess}`, error.response?.data);
      showSnackbar(errorMess, 'error');
    }
  };
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        minHeight: '90vh',
      }}
    >
      <SignupForm formData={formData} handleInput={handleInput} handleSubmit={handleSubmit} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          pl: 7,
        }}
      >
        <p>
          Already have an account? Log in
          <Link to="/"> here</Link>
        </p>
      </Box>
      <Snackbar
        open={snackBar.open}
        onClose={() => setSnackBar({ ...snackBar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={4000}
      >
        <Alert
          onClose={() => setSnackBar({ ...snackBar, open: false })}
          severity={snackBar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackBar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignupPage;
