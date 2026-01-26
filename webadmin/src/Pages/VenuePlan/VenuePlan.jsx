import { Box, Tabs, Tab, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useEffect, useState } from 'react';
import VenuePlanView from '../../components/VenueBuilder/VenuePlanVIew';
import VenuePlanBuilder from '../../components/VenueBuilder/VenueBuilder';
import SeatToolkit from "@mezh-hq/react-seat-toolkit";
import "@mezh-hq/react-seat-toolkit/styles";
import EventListingLayout from '../EventListingLayout/EventListingLayout';


const VenuePlan = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [openBuild, setOpenBuild] = useState(false);

  const fetchVenuePlan = async () => {
    try {
      const response = await api.get('/api/venue_plan_view/', {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('No response from server');
        return;
      }
      const data = response.data.data;
      console.log('Venue plan fetched successfully', data);
      if (Array.isArray(data)) {
        setPlans(data);
      }
    } catch (error) {
      const errMess = error instanceof Error ? error.message : 'Unknown error';
      console.log('Error', errMess);
    }
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
  const onDeleteVenuePlan = async (id) => {
    if (!id) return console.log('No id selected');

    try {
      const response = await api.delete(`/api/delete_venue/${id}/`, { withCredentials: true });

      if (!response.data) {
        console.log('No resposne sended from server');
        return;
      }
      console.log('venue plan delete successfully');
      fetchVenuePlan();
    } catch (error) {
      console.log('Failed to delete venue plan');
    }
  };

  const onUpdateVenuePlan = async (id, data) => {
    try {
      const response = await api.put(`/api/venue_plan_update/${id}/`, data, {
        withCredentials: true,
      });
      if (!response.data) {
        console.log('FAiled to update venue');
        return;
      }

      console.log('Venue plan updated successfully');
      fetchVenuePlan();
    } catch (error) {
      console.log('Server error');
    }
  };
  useEffect(() => {
    fetchVenuePlan();
  }, []);

  const handleTabChange = (eventt, newValue) => {
    setSelectedIndex(newValue);
  };

  return (
    <EventListingLayout />
  );
};

export default VenuePlan;
