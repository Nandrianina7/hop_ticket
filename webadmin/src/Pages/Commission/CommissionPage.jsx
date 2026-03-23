import { useEffect, useState } from 'react';
import Commission from '../../components/Home/Commission/Commission';
import api from '../../api/api';

const CommissionPage = () => {
  const [tickets, setTickets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchAllTicket = async (page, rowsPerPage) => {
    try {

      const response = await api.get(
        `/api/commission_history/?page=${page + 1}&limit=${rowsPerPage}`, 
        { withCredentials: true }
      );
      if (!response.data) {
        console.log('No response found from server');
        return;
      }
      setTotalCount(response.data.total);
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
    } finally {
      setLoading(false)
    }
  };
  const getSelectedEvent = async (id) => {
    try {
      const response = await api.get(`/api/event_info/${id}`, { withCredentials: true });
      if (!response.data) {
        console.log('Failed to load event info');
        return {};
      }
      return response.data;
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Server error -> ${errorMess}`);
      return {};
    }
  };

  const getCustomerInfo = async (customer_id) => {
    try {
      const response = await api.get(`/accounts/customer_info/${customer_id}/`, {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('Failed to load info');
        return null;
      }
      return response.data;
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Server error -> ${errorMess}`);
    }
  };
  return (
    <Commission 
      tickets={tickets} 
      getEventInfo={getSelectedEvent} 
      getUserInfo={getCustomerInfo} 
      fetchTickets={fetchAllTicket}
      totalCount={totalCount}
      loading={loading}
    />
  );
};

export default CommissionPage;
