import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Mail, Visibility, VisibilityOff } from '@mui/icons-material';
import FormButton from '../../ui/FormButton';

const SigninForm = ({ formData, showPassword, handleInput, handleSubmit, user_type, loading }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: '450px',
        p: 4,
        borderRadius: 2,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          {user_type === 'organizer' ? 'Organizer Login' : 'Connexion Admin'}
        </Typography>

        <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input
            type="email"
            placeholder="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInput}
            required
            endAdornment={
              <InputAdornment position="start">
                <Mail color="action" />
              </InputAdornment>
            }
            sx={{ pl: 1 }}
          />
        </FormControl>

        <FormControl variant="outlined" fullWidth sx={{ mb: 1 }}>
          <InputLabel htmlFor="password">mot de passe</InputLabel>
          <Input
            id="password"
            name="password"
            type={formData.showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInput}
            required
            placeholder="mot de passe"
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={showPassword}>
                  {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            sx={{ pl: 1 }}
          />
        </FormControl>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 2,
          }}
        >
          {/* <a href="">Forgot password?</a> */}
        </Box>
        <FormButton text={loading ? <CircularProgress size={24} />: "Se connecter"} onClick={handleSubmit} />
      </Box>
    </Paper>
  );
};

export default SigninForm;
