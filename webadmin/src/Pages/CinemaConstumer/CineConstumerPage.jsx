import { Box, Paper } from '@mui/material';
import CinemaConstumer from '../../components/Home/Cinema/CinemaConstumer';
import api from '../../api/api';
import { useState } from 'react';
import { useEffect } from 'react';
/**
 * This page is to only fetch all necessary data for displaying constumer
 * @fetcAllTicket is needed to get all the constumer ticket
 */
const CineConstumerPage = () => {
  const [tickets, setTickets] = useState([]);
  const fetchAllTicket = async () => {
    try {
      const response = await api.get('/cinema/organizer/ticket_sold/', { withCredentials: true });
      if (!response.data) {
        console.log('No response found from server');
        return;
      }
      const tickets = response.data.data;
      console.log('constumer fetched successfully', tickets);
      if (Array.isArray(tickets)) {
        setTickets(tickets);
      } else {
        setTickets([]);
      }
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Server error -> ${errorMess}`);
    }
  };

  useEffect(() => {
    fetchAllTicket();
  }, []);
  return (
    <Box sx={{ mt: 6 }}>
      <CinemaConstumer tickets={tickets} />
    </Box>
  );
};

export default CineConstumerPage;
