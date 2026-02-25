import { Box } from '@mui/material';
import History from '../../components/Home/History';
import api from '../../api/api';
import { useEffect, useState } from 'react';

const Organizators = () => {
  const [organizators, setOrganizators] = useState([]);
  const getOrganizators = async () => {
    try {
      const res = await api.get('/accounts/all_organizers/', { withCredentials: true });
      if (!res.data) {
        console.log('Failed to load data');
        setOrganizators([]);
        return;
      }
      const data = res.data.data;
      console.log(data);
      setOrganizators(data);
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unkown error occured';
      console.log(errorMess);
    }
  };

  useEffect(() => {
    getOrganizators();
  }, []);
  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '60%' }}>
        <History organizators={organizators} />
      </Box>
    </Box>
  );
};

export default Organizators;
