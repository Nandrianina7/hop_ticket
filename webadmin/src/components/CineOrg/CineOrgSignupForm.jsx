import { Box, Paper, Typography, TextField, InputAdornment, Divider } from '@mui/material';
import { useState } from 'react';
import { Person, Email, Phone, Lock } from '@mui/icons-material';
import FormButton from '../../ui/FormButton';

const CineOrgSignupForm = ({ onSave, name }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onChangeInput = (e) => {
    const { value, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Organization name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    {
      name: 'full_name',
      value: formData.full_name,
      label: 'Nom d\'utilisateur',
      type: 'text',
      icon: <Person />,
      placeholder: 'Nom D\'utilisateur',
    },
    {
      name: 'email',
      value: formData.email,
      label: 'Email',
      type: 'email',
      icon: <Email />,
      placeholder: 'ton@email.com',
    },
    {
      name: 'phone',
      value: formData.phone,
      label: 'Numero de téléphone',
      type: 'tel',
      icon: <Phone />,
      placeholder: '+261 34 345 23 233',
    },
    {
      name: 'password',
      value: formData.password,
      label: 'mot de passe',
      type: 'password',
      icon: <Lock />,
      placeholder: 'Password',
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: '480px',
        p: { xs: 3, sm: 5 },
        borderRadius: 4,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(10px)',
      }}
      component="form"
      onSubmit={onRegister}
    >
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Creation de compte
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
          {name === 'event'
            ? 'Pour Organisateur'
            : 'Pour les Cinema'}
        </Typography>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {formFields.map((field, index) => (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            value={field.value}
            onChange={onChangeInput}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
            placeholder={field.placeholder}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      color: errors[field.name] ? 'error.main' : 'primary.main',
                      opacity: 0.7,
                    }}
                  >
                    {field.icon}
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'grey.50',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
              },
            }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 5 }}>
        <FormButton
          text={isLoading ? 'Création de compte...' : 'Créer un compte'}
          onClick={onRegister}
          disabled={isLoading}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        />
      </Box>

      {/* Footer Text */}
      {/* enable this code if needed */}
      {/* <Typography 
        variant="body2" 
        color="text.secondary" 
        textAlign="center" 
        sx={{ mt: 3, opacity: 0.7 }}
      >
        By creating an account, you agree to our{' '}
        <Typography 
          component="span" 
          variant="body2" 
          sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Terms of Service
        </Typography>{' '}
        and{' '}
        <Typography 
          component="span" 
          variant="body2" 
          sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Privacy Policy
        </Typography>
      </Typography> */}
    </Paper>
  );
};

export default CineOrgSignupForm;
