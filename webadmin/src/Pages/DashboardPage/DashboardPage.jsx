import { useEffect, useState } from 'react';
import { Dashboard } from '../../components/Home/Dashboard';
import api from '../../api/api';
import dayjs from 'dayjs';
import EventInfo from '../../ui/EventInfo';
import { Alert, Snackbar } from '@mui/material';

const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [createdData, setCreadetData] = useState(null || []);
  const [snackBar, setSnackBar] = useState({
    open: false,
    severity: '',
    message: '',
  });
  const [movies, setMovies] = useState([]);
  const showSnackbar = (message, severity = 'success') => {
    setSnackBar({ open: true, severity, message });
  };
  const buildUpload = (data) => {
    const { date, time, ...rest } = data;

    const combineDate =
      date && time
        ? dayjs(date).hour(time.hour()).minute(time.minute()).second(0).millisecond(0)
        : null;
    return {
      ...rest,
      date: combineDate?.toISOString() || null,
    };
  };
  const fetchEventData = async () => {
    try {
      const response = await api.get('/api/all_event', { withCredentials: true });
      if (!response.data.data) {
        console.log('No data found');
        return;
      }
      console.log('Fetched successfully', response.data.data);
      setData(response.data.data);
    } catch (error) {
      showSnackbar('Erreur lors de la recuperation des données', 'error');
      console.log('error', error.response.data.error);
      setData([]);
    }
  };
  const fetchAllCustomers = async () => {
    try {
      const response = await api.get('/accounts/allCustomers/', { withCredentials: true });
      if (!response.data) {
        console.log('Pas de client trouvé');
        return;
      }
      console.log('', response.data.data);
      setAllCustomers(response.data.data);
    } catch (error) {
      console.log('error', error.response.data.error);
      setError(error.response.data.error);
      setAllCustomers([]);
    }
  };
  const onCreate = async (formData) => {
    console.log(formData);
    try {
      const payload = buildUpload(formData);
      const response = await api.post('/api/add_event/', payload, { withCredentials: true });
      if (!response.data) {
        console.log('Failed to send data');
        return;
      }
      console.log('Added successfully', response.data.message);
      setCreadetData(response.data.event);
      setOpen(true);
      showSnackbar("succès de l'ajout de l'évenement", 'success');
      await fetchAllCustomers();
      await fetchEventData();
    } catch (error) {
      showSnackbar('une erreur est survenue', 'error');
    }
  };
  const onSaveImagePrice = async (data) => {
    if (data instanceof FormData && createdData?.id) {
      console.log('FormData received:', data);
      const prices = data.get('prices');

      if (prices) {
        data.delete('prices');
        const priceObj = typeof prices === 'string' ? JSON.parse(prices) : prices;
        Object.entries(priceObj).forEach(([tier, value]) => {
          data.append('price_tiers', JSON.stringify({ tier, price: value }));
        });
      }

      try {
        const response = await api.post(`/api/add_image_and_price/${createdData.id}/`, data, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setOpen(false);
        console.log('Backend update response:', response.data);
        showSnackbar('Image and price tier successfully created', 'success');
      } catch (error) {
        showSnackbar('Failed to update event', 'error');
        console.log('Failed to update event:', error);
      }
    } else {
      console.log('hello', data);
      showSnackbar('Form data wrong', 'warning');
    }
    await fetchAllCustomers();
  };

  const saveVenue = async (venue) => {
    try {
      const response = await api.post('/api/venue_plan/', venue, { withCredentials: true });

      if (!response.data) {
        console.log('No response founded');
        return;
      }

      console.log('Successfully saved venue');
    } catch (error) {
      console.log('Error', Error(error).message);
    }
  };

  const fetchAllMovies = async () => {
    try {
      const res = await api.get('/cinema/movie_list/', { withCredentials: true });

      if (!res.data) {
        console.log('No data loaded form server');
        return;
      }

      const data = res.data.data;
      setMovies(data);
    } catch (error) {
      const errMess = error instanceof Error ? error.message : 'Unknown error';
      console.log('message', errMess);
    }
  };
  useEffect(() => {
    const initilizeData = async () => {
      await fetchEventData();
      await fetchAllCustomers();
      fetchAllMovies();
    };
    initilizeData();
  }, []);

  return (
    <>
      <Dashboard
        data={data}
        allCustomers={allCustomers}
        onCreate={onCreate}
        onSaveVenue={saveVenue}
        movies={movies}
      />
      <EventInfo
        open={open}
        handleClose={() => setOpen(false)}
        type="create"
        event={createdData}
        onSave={onSaveImagePrice}
      />
      <Snackbar
        open={snackBar.open}
        onClose={() => setSnackBar({ ...snackBar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={4000}
      >
        <Alert
          onClose={() => setSnackBar({ ...snackBar, open: false })}
          severity={snackBar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackBar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DashboardPage;
