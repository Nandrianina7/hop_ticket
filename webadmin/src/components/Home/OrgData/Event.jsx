import { useEffect, useState } from 'react';
import api from '../../../api/api';
import { Container, Grid, Box, Skeleton, useTheme } from '@mui/material';
import EventsTable from '../EventsTable/EventsTable';

const Event = ({ org_id }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEvent = async (creator) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/organizer_event/${creator}/`, { withCredentials: true });
      if (res.status !== 200 || !res.data) {
        console.log('failed to load data from server');
        return;
      }

      const data = res.data.data;
      console.log(data);
      setEvents(data);
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error';
      console.log('error', error);
      console.log('message', errorMess);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (org_id) {
      getEvent(org_id);
    } else {
      setEvents([]);
    }
  }, [org_id]);
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="text" width={200} height={30} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return <EventsTable data={events} allow_action={false} />;
};

export default Event;
