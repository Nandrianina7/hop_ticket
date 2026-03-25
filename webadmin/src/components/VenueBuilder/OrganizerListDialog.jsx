import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../api/api';

const OrganizerListDialog = ({ open, onClose, selected_site }) => {
  const [list, setList] = useState([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllOrganizer = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounts/org_lst/', { withCredentials: true });

      if (!response.data) {
        console.log('Failed to get organizer list');
        return;
      }

      const result = response.data;
      setList(result.data || []);
      console.log('data', result);
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'Unknown error';
      console.log('error message', errorMess);
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOptions = list.filter(
    (organizer) =>
      (organizer.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (organizer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (organizer.id || '').toString().includes(searchTerm)
  );

  const handleSelection = (event, newValue) => {
    setSelectedOrganizer(newValue);
  };

  const handleInputChange = (event, newInputValue) => {
    setSearchTerm(newInputValue);
  };
  const handleSubmit = async () => {
    if (!selectedOrganizer) return;

    try {
      const response = await api.put(
        `/api/event_site/update/${selected_site}/`,
        { org_id: selectedOrganizer.id },
        { withCredentials: true }
      );
      console.log('result', response);
      console.log('Plan réglé pour', selectedOrganizer);
      onClose();
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAllOrganizer();
    } else {
      setSelectedOrganizer(null);
      setSearchTerm('');
    }
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{"Sélectionner l'organisateur associé à ce plan"}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, minWidth: 300 }}>
          <Autocomplete
            size="small"
            options={filteredOptions}
            loading={loading}
            value={selectedOrganizer}
            onChange={handleSelection}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.full_name || option.email || ''}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rechercher un organisateur"
                placeholder="Nom, email ou ID..."
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <span>Loading...</span> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box>
                  <strong>
                    {option.full_name} ({option.id}){' '}
                  </strong>
                  {option.email && (
                    <Box
                      component="span"
                      sx={{ display: 'block', fontSize: '0.875rem', color: 'text.secondary' }}
                    >
                      {option.email}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            noOptionsText="Aucun organisateur trouvé"
            loadingText="Chargement..."
            autoHighlight
            autoSelect
            freeSolo={false}
            blurOnSelect
          />
        </Box>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!selectedOrganizer} variant="contained">
            Regler
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizerListDialog;
