import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import { blue, green, orange, red, teal } from '@mui/material/colors';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { router } from './router';
import { ThemeProviderCustom, useThemeContext } from './ThemeContext';
function AppContent() {
  const { darkMode } = useThemeContext();
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#AB0F0F',
        light: '#E35151',
        dark: '#770A0A',
        contrastText: '#FFFFFF',
      },
      secondary: teal,
      success: green,
      warning: orange,
      error: red,
      info: blue,
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1E1E1E' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      h5: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RouterProvider router={router} />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
function App() {
  return (
    <ThemeProviderCustom>
      <AppContent />
    </ThemeProviderCustom>
  );
}
export default App;
