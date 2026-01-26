import {
  Avatar,
  Box,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  Paper,
  Typography,
} from '@mui/material';
import FormButton from '../../ui/FormButton';

const SignupForm = ({ formData, handleInput, handleSubmit }) => {
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
        <Typography variant="h4">Admin signup</Typography>
        <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInput}
            endAdornment={
              <InputAdornment position="end">
                <Avatar />
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInput}
          />
        </FormControl>
        <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
          <InputLabel htmlFor="username">User name</InputLabel>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.fullname}
            onChange={handleInput}
          />
        </FormControl>
        <FormControl variant="outlined" fullWidth sx={{ mb: 1 }}>
          <InputLabel htmlFor="phone">Phone</InputLabel>
          <Input
            type="number"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInput}
          />
        </FormControl>
        <FormButton text="Sign up" onClick={handleSubmit} />
      </Box>
    </Paper>
  );
};

export default SignupForm;
