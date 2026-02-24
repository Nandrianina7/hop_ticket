import {
  Box,
  Container,
  styled,
  Typography,
  Paper,
  Stack,
  useTheme,
  Chip,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import { useEffect, useState } from 'react';
import ManageDialog from '../../../ui/ManageDialog';
import EventsTable from '../EventsTable';
import AddIcon from '@mui/icons-material/Add';
import { StyledButton } from '../../../utils/StyledButton';
import { SearchTwoTone } from '@mui/icons-material';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Acceuil = ({ email, onCreate, onUpdate, data, loading, onDelete, onSaveChange, venue }) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [index, setIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const meassage = [
    { title: 'Organisez vos evenements', subtitle: '' },
    { title: 'Suivez les ventes de billet', subtitle: '' },
    { title: "Simplifiez l'organisation", subtitle: '' },
  ];

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filterEventsByDate = (events, filterType) => {
    const now = new Date();

    switch (filterType) {
      case 'Evenements passés':
        return events.filter((event) => new Date(event.date) < now);
      case 'Avenir':
        return events.filter((event) => new Date(event.date) >= now);
      case 'tous':
      default:
        return events;
    }
  };

  const filteredEventsBySearc = (events, search) => {
    if (!search.trim()) return events;
    const searchLower = search.toLowerCase();
    return events.filter(
      (event) =>
        event.name?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.venue?.toLowerCase().includes(searchLower)
    );
  };
  const getFilterEvent = () => {
    let result = data || [];
    result = filterEventsByDate(result, activeFilter);

    result = filteredEventsBySearc(result, searchTerm);

    return result;
  };
  const filteredData = getFilterEvent();
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % meassage.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [meassage.length]);

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 2, mt: 3 }}>
        <Stack direction="column" spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {meassage[index].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {meassage[index].subtitle}
              </Typography>
            </Box>

            <StyledButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ minWidth: '160px' }}
            >
              Cree un evenement
            </StyledButton>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Stack direction="column" spacing={0.2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['tous', 'Evenements passés', 'Avenir'].map((item) => (
                    <Chip
                      label={item}
                      key={item}
                      onClick={() => setActiveFilter(item)}
                      color={activeFilter === item ? 'primary' : 'default'}
                      variant={activeFilter === item ? 'filled' : 'outlined'}
                      clickable
                      size="small"
                    />
                  ))}
                </Box>
                <Box>
                  <TextField
                    size="small"
                    placeholder="Recherche ..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mr: 2, width: 250 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <SearchTwoTone />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 10,
                      },
                    }}
                  />
                </Box>
              </Box>
              <EventsTable
                data={filteredData}
                loading={loading}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onSaveChange={onSaveChange}
              />
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <ManageDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onClick={onCreate}
        type="create"
        venue={venue}
      />
    </Box>
  );
};

export default Acceuil;
