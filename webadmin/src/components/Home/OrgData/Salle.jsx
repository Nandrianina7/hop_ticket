import { useEffect, useState } from 'react';
import api from '../../../api/api';
import { Box, Typography } from '@mui/material';
import { Halls } from '../Halls';

const Salle = ({ org_id }) => {
  const [cinemaList, setCinemaList] = useState([]);
  const fetchCinema = async (id) => {
    try {
      const response = await api.get(`/cinema/organizer/cinema/list/${id}`, {
        withCredentials: true,
      });
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
  useEffect(() => {
    if (org_id) {
      fetchCinema(org_id);
    } else {
      console.log("Can't retrieve the cinema list");
    }
  }, [org_id]);
  return (
    <Box>
      <Typography>Tous les salles</Typography>
      <Halls cinemaList={cinemaList} onGetCinemaHalls={fetchCinemaOrgHall} allowedAction={false} />
    </Box>
  );
};

export default Salle;
