import { Box, Snackbar, Alert } from '@mui/material';
import api from '../../../api/api';
import { Halls } from '../../../components/Home/Halls';
import { useEffect, useState } from 'react';

const HallOrgPage = () => {
  const [cinemaList, setCinemaList] = useState([]);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success'); // "success" | "error"

  const showSnackbar = (message, severity = 'success') => {
    setSnackMessage(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const fetchOrgCinema = async () => {
    try {
      const response = await api.get('/cinema/organizer/cinema', { withCredentials: true });
      if (response.status !== 200) {
        showSnackbar('Failed to load data from server', 'error');
        return;
      }
      const resultat = response.data.data;
      if (Array.isArray(resultat)) {
        setCinemaList(resultat);
      }
    } catch (error) {
      showSnackbar('Server error, failed to fetch cinema for the organizer', 'error');
    }
  };

  const addCinema = async (data) => {
    try {
      const response = await api.post('/cinema/add_cinema/', data, { withCredentials: true });
      if (!response.data) {
        showSnackbar('Failed to send data', 'error');
        return;
      }
      await fetchOrgCinema();
      showSnackbar('Cinema added successfully');
    } catch (error) {
      const errorMess = error?.message || 'Unknown error';
      showSnackbar(`Error -> ${errorMess}`, 'error');
    }
  };

  const fetchCinemaOrgHall = async (id) => {
    try {
      const response = await api.get(`/cinema/cinema_halls/${id}`, { withCredentials: true });
      if (!response.data || response.status !== 200) {
        showSnackbar('Failed to fetch halls', 'error');
        return;
      }
      return response.data;
    } catch (error) {
      showSnackbar('Failed to get hall data', 'error');
    }
  };

  const addHallSeats = async (formData) => {
    try {
      const response = await api.post('/cinema/add_halls_seats/', formData, {
        withCredentials: true,
      });
      if (response.status === 200 || response.status === 201) {
        showSnackbar('Hall seats created successfully');
      } else {
        showSnackbar('Bad request or missing required field', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to add hall seats', 'error');
    }
  };

  const deleteCinema = async (id) => {
    if (!id) return showSnackbar('No selected item', 'error');

    try {
      const response = await api.delete(`/cinema/delete_cinema/${id}/`, { withCredentials: true });
      if (!response.data) {
        showSnackbar('Delete failed', 'error');
        return;
      }
      await fetchOrgCinema();
      showSnackbar('Cinema deleted successfully');
    } catch (error) {
      showSnackbar('Failed to delete the cinema', 'error');
    }
  };

  const updateHallSeat = async (id, data) => {
    if (!id) return showSnackbar('No selected item', 'error');

    try {
      const response = await api.put(`/cinema/update_cinema_halls/${id}/`, data, {
        withCredentials: true,
      });
      if (!response.data) {
        showSnackbar('Failed to process the update', 'error');
        return;
      }
      await fetchOrgCinema();
      showSnackbar('Updated successfully');
    } catch (error) {
      showSnackbar('Failed to update hall seat', 'error');
    }
  };

  useEffect(() => {
    fetchOrgCinema();
  }, []);
  return (
    <Box sx={{ mt: 6 }}>
      <Halls
        onAddCinema={addCinema}
        cinemaList={cinemaList}
        onCreateHallSeats={addHallSeats}
        onGetCinemaHalls={fetchCinemaOrgHall}
        onDeleteCinema={deleteCinema}
        onUpdateCinemaHall={updateHallSeat}
      />

      <Snackbar
        open={snackOpen}
        autoHideDuration={5000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HallOrgPage;
