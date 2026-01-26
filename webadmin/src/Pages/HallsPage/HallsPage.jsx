import { Box, useTheme, Snackbar, Alert } from '@mui/material';
import { Halls } from '../../components/Home/Halls';
import api from '../../api/api';
import React from 'react';

const HallsPage = () => {
  const theme = useTheme();
  const [cinemaList, setCinemaList] = React.useState([]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCinema = async () => {
    try {
      const response = await api.get('/cinema/all_cinema/', { withCredentials: true });
      if (!response.data) {
        showSnackbar('Failed to fetch cinemas', 'error');
        return;
      }
      const receivedData = response.data.data ?? response.data;

      if (receivedData && Array.isArray(receivedData)) {
        setCinemaList(receivedData);
        showSnackbar('Cinemas loaded successfully', 'success');
      } else {
        showSnackbar('Received data is not an array', 'warning');
      }
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error';
      showSnackbar(`Error loading cinemas: ${errorMess}`, 'error');
    }
  };

  const addCinema = async (formData) => {
    try {
      const response = await api.post('/cinema/add_halls/', formData, { withCredentials: true });
      if (!response.data) {
        showSnackbar('Échec de la création de la salle', 'error');
        return;
      }
      showSnackbar('Salle de cinéma ajoutée avec succès', 'success');
      fetchCinema();
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error occurred';
      showSnackbar(`Error adding cinema: ${errorMess}`, 'error');
    }
  };

  const fetchCinemaHalls = async (id) => {
    try {
      const response = await api.get(`/cinema/cinema_halls/${id}/`, { withCredentials: true });
      if (!response.data) {
        showSnackbar('No data found for cinema halls', 'info');
        return;
      }
      showSnackbar('Cinema halls fetched successfully', 'success');
      return response.data;
    } catch (error) {
      showSnackbar('Failed to fetch cinema halls', 'error');
      return {};
    }
  };

  const addHallSeats = async (data) => {
    try {
      const res = await api.post('/cinema/add_halls_seats/', data, { withCredentials: true });
      if (!res.data) {
        showSnackbar('Failed to create hall seats', 'error');
        return;
      }
      showSnackbar('Hall seats added successfully', 'success');
    } catch (error) {
      showSnackbar(`Error adding hall seats: ${error.message}`, 'error');
    }
  };

  const onDeleteCinema = async (id) => {
    if (!id) {
      showSnackbar('No cinema selected for deletion', 'warning');
      return;
    }
    try {
      const resp = await api.delete(`/cinema/delete_cinema/${id}/`, { withCredentials: true });
      if (!resp.data) {
        showSnackbar('Failed to delete cinema', 'error');
        return;
      }
      showSnackbar('Cinema deleted successfully', 'success');
      fetchCinema();
    } catch (error) {
      showSnackbar('Failed to send delete request', 'error');
    }
  };

  const onUpdateCinemaHalls = async (id, data) => {
    if (!id) {
      showSnackbar('No cinema selected for update', 'warning');
      return;
    }
    try {
      const response = await api.put(`/cinema/update_cinema_halls/${id}/`, data, {
        withCredentials: true,
      });

      if (!response.data) {
        showSnackbar('Failed to update cinema', 'error');
        return;
      }
      showSnackbar('Cinema updated successfully', 'success');
      fetchCinema();
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error';
      showSnackbar(`Error updating cinema: ${errorMess}`, 'error');
    }
  };

  React.useEffect(() => {
    fetchCinema();
  }, []);

  return (
    <Box
      sx={{
        mt: 4,
        width: '100%',
        minHeight: '95vh',
      }}
    >
      <Halls
        onAddCinema={addCinema}
        cinemaList={cinemaList}
        onCreateHallSeats={addHallSeats}
        onGetCinemaHalls={fetchCinemaHalls}
        onDeleteCinema={onDeleteCinema}
        onUpdateCinemaHall={onUpdateCinemaHalls}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HallsPage;
