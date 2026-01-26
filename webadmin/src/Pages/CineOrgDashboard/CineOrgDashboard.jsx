import { Box } from '@mui/material';
import DashboardCinema from '../../components/Home/Cinema/Dashboard';
import { useEffect, useState } from 'react';
import api from '../../api/api';

const CineOrgDashboard = () => {
  const [movieList, setMovieList] = useState([]);
  const [tickets_upc, setTickets_upc] = useState([]);
  const [hallList, setHallList] = useState([]);
  const [ticketSold, setTicketSold] = useState([]);
  const fetchAllMovie = async () => {
    try {
      const response = await api.get('/cinema/movie_list/', { withCredentials: true });

      if (!response.data) {
        console.log('No resposne form server');
        return;
      }

      if (response.status !== 200) {
        console.log('error to load movie');
        return;
      }
      const movies = response.data.data;
      console.log('movie list', movies);

      if (Array.isArray(movies)) {
        setMovieList(movies);
      }
    } catch (error) {
      console.log('Server error, failed to fetch movie');
    }
  };

  const getUpcomingMovie = (movies = []) => {
    const now = new Date();
    const upcomingMovies = movies
      .map((movie) => {
        const futureSessions = movie.sessions
          .filter((s) => new Date(s.start_time) > now)
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        return {
          ...movie,
          nextSession: futureSessions[0] || null,
        };
      })
      .filter((m) => m.nextSession);
    return upcomingMovies;
  };

  const fetchHallList = async () => {
    try {
      const response = await api.get('/cinema/organizer/cinema_hall_list/', {
        withCredentials: true,
      });
      if (!response.data) {
        console.log('No response form the server');
        return;
      }
      const cinema = response.data.data;
      console.log('hall list fetched successfully', cinema);
      setHallList(cinema[0].halls);
    } catch (error) {
      console.log('Failed to fetched successfully');
    }
  };

  const fetchSoldTicket = async () => {
    try {
      const response = await api.get('/cinema/organizer/ticket_sold/', { withCredentials: true });
      if (!response.data) {
        console.log('No response');
        return;
      }

      const data = response.data.data;
      console.log('Successfully fetched', data);
      setTicketSold(data);
    } catch (error) {
      console.log('Failed to load data from server');
    }
  };

  const fetchUpcomingSessionTicketSold = async () => {
    try {
      const response = await api.get('/cinema/organizer/ticket_sold_upcoming_session/', {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('Server not send a response data');
        return;
      }

      const data = response.data.data;
      console.log('Successfully load data from server', data);
      setTickets_upc(data);
    } catch (error) {
      console.log('FAiled to load data form server', String(error));
    }
  };
  useEffect(() => {
    fetchAllMovie();
  }, []);

  useEffect(() => {
    fetchSoldTicket();
  }, []);

  useEffect(() => {
    fetchHallList();
  }, []);

  useEffect(() => {
    fetchUpcomingSessionTicketSold();
  }, []);
  return (
    <Box sx={{ mt: 6 }}>
      <DashboardCinema
        movies={movieList}
        upcomingMovie={getUpcomingMovie(movieList)}
        halls={hallList}
        tickets={ticketSold}
        soldTicUpc={tickets_upc}
      />
    </Box>
  );
};

export default CineOrgDashboard;
