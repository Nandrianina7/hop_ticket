import { Box, Paper, Typography, useTheme } from '@mui/material';
import { Constumer } from '../../components/Home/Constumer';
import { useEffect, useState } from 'react';
import api from '../../api/api';

const ConstumerPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/all_ticket/', { withCredentials: true });
      if (!response.data) {
        console.log('No data found');
        setData([]);
        return;
      }
      console.log(response.data.data);
      setData(response.data.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ mt: 6, width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
      <Paper
        sx={{
          overflow: 'hidden',
          width: '100%',
          p: 2,
          backgroundColor: theme.palette.primary,
        }}
      >
        <Constumer data={data} isLoading={loading} />
      </Paper>
    </Box>
  );
};

export default ConstumerPage;
