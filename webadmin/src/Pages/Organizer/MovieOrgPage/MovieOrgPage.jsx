import { Box, Paper } from '@mui/material';

const MovieOrgPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 6, gap: 2 }}>
      <Paper
        sx={{
          height: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Box sx={{ ml: 3 }}>here chip</Box>
        <Box sx={{ mr: 3 }}>her searc input</Box>
      </Paper>
      <Paper>
        <Box>No item to display</Box>
      </Paper>
    </Box>
  );
};

export default MovieOrgPage;
