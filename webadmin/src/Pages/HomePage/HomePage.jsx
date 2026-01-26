import { Box, Snackbar, Alert } from '@mui/material';
import Acceuil from '../../components/Home/Accueil';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import EventInfo from '../../ui/EventInfo';

dayjs.extend(utc);
dayjs.extend(timezone);

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [createdData, setCreadetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/accounts/getCurrentUser/', { withCredentials: true });
      return response.data;
    } catch (error) {
      showSnackbar('Failed to fetch user', 'error');
      return null;
    }
  };

  const buildUploadFormData = (data) => {
  const fd = new FormData();
  const { date, time, file, image, ...rest } = data;

  // combine date + time like before
  const combineDate =
    date && time
      ? dayjs(date).hour(time.hour()).minute(time.minute()).second(0).millisecond(0)
      : null;

  // append simple fields
  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (combineDate) fd.append('date', combineDate.toISOString());

  // append the File as 'file' (backend uses request.FILES.get("file"))
  const f = file || image; // accept either property name from the form
  if (f instanceof File) fd.append('file', f);

  return fd;
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

  const getAllEvents = async () => {
    setLoading(true);
    try {
      const url = '/api/all_event/';
      const response = await api.get(url, { withCredentials: true });
      if (!response.data) {
        showSnackbar('No events found', 'info');
        setEvents([]);
        return;
      }
      setEvents(response.data.data);
      setLoading(false);
    } catch (error) {
      setEvents([]);
      showSnackbar('Failed to load events', 'error');
      setLoading(false);
    }
  };

  const handleClick = async (formData) => {
     const payload = buildUploadFormData(formData);
     const eventLocation= formData.location;

  // optional: debug what’s inside
  console.log(
    'FormData entries:',
    Array.from(payload.entries()).map(([k, v]) => [k, v instanceof File ? `${v.name} (${v.size})` : v])
  );
    try {
      const response = await api.post('/api/add_event/', payload, { withCredentials: true });
    
      if (!response.data) {
        showSnackbar('Failed to create event', 'error');
        return;
      }
        console.log('Event creation response:', response.data.event.id);
      const payloadLocation={
        event_id:response.data.event.id,
        location:eventLocation
      }
      const respoonse = await api.post('/api/eventLocation/',payloadLocation,{withCredentials:true});
      if (!respoonse.data) {
        showSnackbar('Failed to set location for event','error')
      }
      console.log('Event payload', payload);

      console.log('Event created successfully', response.data);
      showSnackbar('Event created successfully', 'success');
      setOpen(true);
      setCreadetData(response.data.event);
      await getAllEvents();
    } catch (error) {
      showSnackbar('Server error while creating event', 'error');
    }
  };

  const onSaveImagePrice = async (data) => {
    if (data instanceof FormData && createdData?.id) {
      const prices = data.get('prices');
      if (prices) {
        data.delete('prices');
        const priceObj = typeof prices === 'string' ? JSON.parse(prices) : prices;
        Object.entries(priceObj).forEach(([tier, value]) => {
          data.append('price_tiers', JSON.stringify({ tier, price: value }));
        });
      }
      try {
        await api.post(`/api/add_image_and_price/${createdData.id}/`, data, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSnackbar('Image and prices saved successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to save image and prices', 'error');
      }
    }
    setOpen(false);
    await getAllEvents();
  };

  const handleUpdateClick = async (id, data, closeDialog) => {
    if (!id) {
      showSnackbar('No event selected', 'warning');
      return;
    }
    try {
      const payload = buildUpload(data);
      await api.put(`/api/update_event/${id}/`, payload, { withCredentials: true });
      showSnackbar('Event updated successfully', 'success');
      getAllEvents();
      closeDialog();
    } catch (error) {
      showSnackbar('Failed to update event', 'error');
    }
  };

  const handleDeleteClick = async (id, closeDialog) => {
    if (!id) {
      showSnackbar('No event selected', 'warning');
      return;
    }
    try {
      await api.delete(`/api/delete_event/${id}/`, { withCredentials: true });
      showSnackbar('Event deleted successfully', 'success');
      closeDialog();
      await getAllEvents();
    } catch (error) {
      showSnackbar('Failed to delete event', 'error');
    }
  };

  const onSaveChange = async (id, data) => {
    if (!id) {
      showSnackbar('No event selected', 'warning');
      return;
    }

    if (data instanceof FormData && id) {
      const prices = data.get('prices');
      if (prices) {
        data.delete('prices');
        const priceObj = typeof prices === 'string' ? JSON.parse(prices) : prices;
        Object.entries(priceObj).forEach(([tier, value]) => {
          data.append('price_tiers', JSON.stringify({ tier, price: value }));
        });
      }
      try {
        await api.patch(`/api/update_image_and_price/${id}/`, data, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSnackbar('Image and prices updated successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to update image and prices', 'error');
      }
    }
    setOpen(false);
    await getAllEvents();
  };

  const fetchVenuePlan = async () => {
    try {
      const response = await api.get('/api/event_site/', {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('No response from server');
        return;
      }
      const data = response.data.data;
      console.log('Venue plan fetched successfully', data);
      if (Array.isArray(data)) {
        setVenues(data);
      }
    } catch (error) {
      const errMess = error instanceof Error ? error.message : 'Unknown error';
      console.log('Error', errMess);
    }
  };

  useEffect(() => {
    // fetchCurrentUser().then((user) => {
    //   if (user) {
    //     setEmail(user.data.email);
    //   } else {
    //     setEmail('');
    //     showSnackbar('No token found', 'info');
    //   }
    // });
  }, []);

  useEffect(() => {
    getAllEvents();
  }, []);

  useEffect(() => {
    fetchVenuePlan();
  }, []);
  return (
    <Box>
      <Acceuil
        email={email}
        onCreate={handleClick}
        data={events}
        onUpdate={handleUpdateClick}
        onDelete={handleDeleteClick}
        onSaveChange={onSaveChange}
        loading={loading}
        venue={venues}
      />
      <EventInfo
        open={open}
        handleClose={() => setOpen(false)}
        event={createdData}
        onSave={onSaveImagePrice}
        type="create"
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

export default HomePage;
