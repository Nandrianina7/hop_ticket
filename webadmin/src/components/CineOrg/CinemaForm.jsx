import {
  Button,
  Grid,
  TextField,
  Paper,
  Typography,
  Box,
  InputAdornment,
  Divider,
  Alert,
  Fade,
  CircularProgress,
} from '@mui/material';
import { TheaterComedy, LocationOn, Phone, Email, Schedule } from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import dayjs from 'dayjs';
const CinemaForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    opening_hours: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openingTime, setOpeningTime] = useState(dayjs());
  const [closingTime, setClosingTime] = useState(dayjs());

  const handleFormData = (e) => {
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

    if (!formData.name.trim()) newErrors.name = 'Cinema name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.opening_hours.trim()) newErrors.opening_hours = 'Opening hours are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpeningTimeChange = (newValue) => {
    setOpeningTime(newValue);
  };

  const handleClosingTimeChange = (newValue) => {
    setClosingTime(newValue);
  };

  const onCreateCinema = async () => {
    formData.opening_hours = openingTime.format('hh:mm A') + ' - ' + closingTime.format('hh:mm A');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputFields = [
    {
      name: 'name',
      label: 'Nom du cinéma',
      icon: <TheaterComedy />,
      placeholder: 'Entrez le nom de votre cinéma',
    },
    {
      name: 'address',
      label: 'Adresse',
      icon: <LocationOn />,
      placeholder: 'Adresse complète',
    },
    {
      name: 'city',
      label: 'Ville',
      icon: <LocationOn />,
      placeholder: 'Ville où se trouve le cinéma',
    },
    {
      name: 'phone',
      label: 'Numéro de téléphone',
      icon: <Phone />,
      placeholder: '+261 34 56 789 00',
      type: 'tel',
    },
    {
      name: 'email',
      label: 'Adresse e-mail',
      icon: <Email />,
      placeholder: 'contact@cinema.com',
      type: 'email',
    },
    // {
    //   name: 'opening_hours',
    //   label: 'Heures d\'ouverture',
    //   icon: <Schedule />,
    //   placeholder: '9:00 AM',
    // },
    // {
    //   name: 'closing_hours',
    //   label: 'Heures de fermeture',
    //   icon: <Schedule />,
    //   placeholder: '11:00 PM',
    // },
  ];

  return (
    <Fade in timeout={800}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: '600px',
          p: 4,
          borderRadius: 3,
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
        }}
        component="form"
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <TheaterComedy sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Crée votre cinéma
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Remplissez les détails de votre cinéma pour commencer
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {inputFields.map((field) => (
            <Grid key={field.name} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                onChange={handleFormData}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                placeholder={field.placeholder}
                type={field.type || 'text'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{field.icon}</InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          ))}
          <Grid key={'opening_hours'} sx={{ width: '100%' }}>
            <TimePicker
              fullWidth
              label="heures d'ouverture"
              value={openingTime}
              onChange={handleOpeningTimeChange}
              ampm={false}
              slotProps={{
                textField: {
                  size: 'fullWidth',
                  sx: { borderRadius: 2, width: '100%' },
                },
              }}
            />
          </Grid>
          <Grid key={'closing_hours'} sx={{ width: '100%' }}>
            <TimePicker
              fullWidth
              value={closingTime}
              onChange={handleClosingTimeChange}
              label="heures de fermeture"
              ampm={false}
              slotProps={{
                textField: {
                  size: 'fullWidth',
                  sx: { borderRadius: 2, width: '100%' },
                },
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={onCreateCinema}
            disabled={isSubmitting}
            size="large"
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0px 4px 15px rgba(25, 118, 210, 0.4)',
              '&:hover': {
                boxShadow: '0px 6px 20px rgba(25, 118, 210, 0.6)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              minWidth: '180px',
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Crée le Cinema'
            )}
          </Button>
        </Box>

        <Fade in={submitSuccess}>
          <Alert severity="success" sx={{ mt: 3 }}>
            Cinema created successfully!
          </Alert>
        </Fade>
      </Paper>
    </Fade>
  );
};

export default CinemaForm;
