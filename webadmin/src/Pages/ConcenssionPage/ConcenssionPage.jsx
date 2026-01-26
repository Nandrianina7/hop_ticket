import { Box, Paper, Button, Pagination } from '@mui/material';
import ConcenssionForm from '../../components/Home/Concenssion/ConcessionForm';
import ConcessionCard from '../../components/Home/Concenssion/ConcenssionCard';
import api from '../../api/api';
import { useEffect, useState } from 'react';

const ConcenssionPage = () => {
  const [concenssionList, setConcenssionList] = useState([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const fetchConcenssion = async (page = 1) => {
    try {
      const response = await api.get(`/cinema/organizer/get_concenssion/?page=${page}`, {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('Server not responding');
        return;
      }

      if (response.data.results) {
        setConcenssionList(response.data.results);
        console.log('Concessions fetched successfully:', response.data.results);
        setCount(response.data.count);
        setCurrentPage(page);
      } else {
        setConcenssionList(response.data.data || []);
      }
    } catch (error) {
      console.log('Failed to load concessions from server', error);
    }
  };

  const onSendData = async (formData) => {
    try {
      const response = await api.post('/cinema/organizer/concenssion/', formData, {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('Server not responding');
        return;
      }
      console.log('Concession saved successfully');
      await fetchConcenssion(currentPage);
    } catch (error) {
      console.log('Failed to save data', error);
    }
  };

  const onDeleteConcenssion = async (id) => {
    if (!id) return console.log('No selected item');

    try {
      const response = await api.delete(`/cinema/organizer/concenssion_delete/${id}/`, {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('Failed to process delete');
        return;
      }

      console.log('Item successfully deleted');
      await fetchConcenssion(currentPage);
    } catch (error) {
      console.log('Server error ->', error);
    }
  };

  const onUpdateConcenssion = async (data, id) => {
    try {
      const response = await api.put(`/cinema/organizer/concenssion_update/${id}/`, data, {
        withCredentials: true,
      });

      if (!response.data) {
        console.log('Failed to process update');
        return;
      }

      console.log('Updated successfully');
      await fetchConcenssion(currentPage);
    } catch (error) {
      console.log('Server error ->', error);
    }
  };

  useEffect(() => {
    fetchConcenssion();
    // fetchConcenssionCategories();
  }, []);

  const totalPages = Math.ceil(count / pageSize);

  return (
    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: '60px',
            p: 3,
          }}
        >
          <ConcenssionForm onSave={onSendData} />
        </Paper>

        <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          <ConcessionCard
            concessionList={concenssionList}
            onDelete={onDeleteConcenssion}
            onUpdate={onUpdateConcenssion}
          />
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                color="primary"
                onChange={(e, page) => fetchConcenssion(page)}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ConcenssionPage;
