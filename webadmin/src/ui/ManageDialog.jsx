import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Stack,
  Divider,
  Autocomplete,
  Typography,
  Box,
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import LocationInput from '../components/VenueBuilder/LocationInput';

const ManageDialog = ({ open, onClose, onClick, type, initialData = {}, venue }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: dayjs(),
    time: dayjs(),
    description: '',
    venue: '',
    file: null,
    location: {
      name: '',
      lon: '',
      lat: '',
    },
    owner_percentage: 0,
  });

  const handleInput = (e) => {
    if (e?.target) {
      const { value, name } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, date: e }));
    }
  };

  const handleDateChange = (newValue) => {
    setFormData((prev) => ({ ...prev, date: newValue }));
  };

  const handleLocationChange = (newValue) => {
    console.log('Location selected in dialog:', newValue);
    setFormData((prev) => ({ ...prev, location: newValue }));
  };

  const handleTimeChange = (newValue) => {
    setFormData((prev) => ({ ...prev, time: newValue }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = () => {
    onClick(formData);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData?.name || '',
        date: initialData?.date ? dayjs(initialData.date) : dayjs(),
        time: initialData?.time ? dayjs(initialData.time) : dayjs(),
        description: initialData?.description || '',
        venue: initialData?.venue || '',
        file: initialData?.file || null,
        owner_percentage: initialData?.owner_percentage || 0,
      });
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          fontWeight: '600',
          fontSize: '1.25rem',
        }}
      >
        {type === 'create' ? 'Créer un événement' : "Mettre à jour l'événement"}
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="name"
              label="nom de l'événement"
              value={formData.name}
              onChange={handleInput}
              variant="outlined"
              size="small"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInput}
              variant="outlined"
              size="small"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={venue?.map((v) => v.site_name) || []}
              value={formData.venue}
              onChange={(_, newValue) => {
                handleInput({ target: { name: 'venue', value: newValue } });
              }}
              onInputChange={(_, newInputValue) => {
                handleInput({ target: { name: 'venue', value: newInputValue } });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="choisir le plan de salle"
                  size="small"
                  sx={{ borderRadius: 2, minWidth: 235 }}
                />
              )}
            />
            <LocationInput onSelectLocation={(location) => handleLocationChange(location)} />
          </Grid>

          {/* File Upload Section */}
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={500}>
                Upload d'image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                }}
              >
                {formData.file ? 'Changer de fichier' : 'Choisir un fichier'}
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </Button>

              {formData.file && (
                <Box mt={1}>
                  {formData.file.type.startsWith('image/') ? (
                    <Box
                      component="img"
                      src={URL.createObjectURL(formData.file)}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '1px solid #ddd',
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {formData.file.name}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="date de l'événement"
                value={formData.date}
                onChange={handleDateChange}
                views={['year', 'month', 'day']}
                openTo="day"
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { borderRadius: 2, width: 150 },
                  },
                }}
              />
              <TimePicker
                label="heure de l'événement"
                value={formData.time}
                onChange={handleTimeChange}
                ampm={false}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { borderRadius: 2, width: 120 },
                  },
                }}
              />
            </Stack>
          </Grid>
        </Grid>
        <TextField
          type="number"
          fullWidth
          sx={{ mt: 1 }}
          size="small"
          placeholder="Commission"
          InputProps={{
            sx: { borderRadius: 2 },
          }}
          name="owner_percentage"
          value={formData.owner_percentage}
          onChange={handleInput}
          label="Commission"
        />
      </DialogContent>

      <Divider sx={{ my: 1 }} />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
            onClick={handleSubmit}
          >
            {type === 'create' ? 'Créer' : 'Mettre à jour'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ManageDialog;
