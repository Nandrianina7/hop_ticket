import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  TextField,
  Stack,
} from '@mui/material';
import { Close, Edit, Save } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useState, useRef, useEffect } from 'react';
import logo from '../assets/hoplogo.jpeg';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.198:8000';

const EventInfo = ({ open, handleClose, event, onSave, type }) => {
  const defaultPrices = {
    // VIP: { price: '', total: '' },
    // BRONZE: { price: '', total: '' },
    // ARGENT: { price: '', total: '' },
    PUBLIC: { price: '', total: '' },
  };

  const [imagePreview, setImagePreview] = useState(
    event?.image ? `${API_URL}${event.image}` : logo
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [initialPrices, setInitialPrices] = useState(event?.price_tiers || defaultPrices);
  const [currentPrices, setCurrentPrices] = useState({ ...initialPrices });
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log(event);
    setImagePreview(event?.image ? `${API_URL}${event.image}` : logo);
    setSelectedFile(null);

    const newPrices = event?.price_tiers
      ? event.price_tiers.reduce(
          (acc, tier) => {
            acc[tier.tier_type] = {
              price: tier.price,
              total: tier.available_quantity,
            };
            return acc;
          },
          { ...defaultPrices }
        )
      : defaultPrices;

    setInitialPrices(newPrices);
    setCurrentPrices({ ...newPrices });
    setHasChanges(false);
  }, [event]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriceChange = (tier_type, field, value) => {
    setCurrentPrices((prev) => {
      const updatedTier = { ...prev[tier_type], [field]: value };
      const newPrices = { ...prev, [tier_type]: updatedTier };

      const changed = Object.keys(newPrices).some(
        (key) =>
          newPrices[key].price !== initialPrices[key]?.price ||
          newPrices[key].total !== initialPrices[key]?.total
      );

      setHasChanges(changed || selectedFile !== null);

      return newPrices;
    });
  };

  const handleSaveChanges = () => {
    const formData = new FormData();

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    const pricesArray = Object.entries(currentPrices).map(([tier_type, values]) => ({
      tier_type,
      price: parseFloat(values.price) || 0,
      available_quantity: parseInt(values.total) || 0,
    }));

    formData.append('prices_tiers', JSON.stringify(pricesArray));

    onSave(formData);
    setHasChanges(false);
  };

  const handleUpdateChanges = (id) => {
    const formData = new FormData();
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    const pricesArray = Object.entries(currentPrices).map(([tier_type, values]) => ({
      tier_type,
      price: parseFloat(values.price) || 0,
      available_quantity: parseInt(values.total) || 0,
    }));

    formData.append('prices_tiers', JSON.stringify(pricesArray));

    onSave(id, formData);
    setHasChanges(false);
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'visible' },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        <Card sx={{ width: '100%', boxShadow: 'none', borderRadius: 3 }}>
          <Box
            sx={{
              position: 'relative',
              '&:hover .edit-image-button': { opacity: 1 },
            }}
          >
            <CardMedia
              component="img"
              alt="Event image"
              height="200"
              image={imagePreview}
              sx={{
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                objectFit: 'cover',
              }}
            />

            <IconButton
              className="edit-image-button"
              onClick={() => fileInputRef.current.click()}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 2,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <CardContent sx={{ px: 3, pt: 2, pb: 1 }}>
            <Typography gutterBottom variant="h5" component="div">
              {event?.name || 'Event Name'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {event?.venue || 'Venue'}
              </Typography>
              <Box sx={{ mx: 1 }}>•</Box>
              <Typography variant="body2" color="text.secondary">
                {dayjs(event?.date).format('MMM D, YYYY') || 'Date'}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              {event?.description || 'Event description goes here...'}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Prix et Quantités
              </Typography>
              <Stack spacing={2}>
                {Object.entries(currentPrices).map(([tier_type, values]) => (
                  <Box key={tier_type} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      label={`${tier_type} Prix`}
                      type="number"
                      value={values.price}
                      onChange={(e) => handlePriceChange(tier_type, 'price', e.target.value)}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 8 }}>Ar</span>,
                      }}
                      variant="outlined"
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label={`${tier_type} Quantité`}
                      type="number"
                      value={values.total}
                      onChange={(e) => handlePriceChange(tier_type, 'total', e.target.value)}
                      variant="outlined"
                      fullWidth
                      size="small"
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          </CardContent>

          <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={handleClose}>
              Close
            </Button>

            {hasChanges && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<Save />}
                onClick={
                  type === 'update' ? () => handleUpdateChanges(event.id) : handleSaveChanges
                }
                disabled={!hasChanges}
              >
                Save Changes
              </Button>
            )}
          </Box>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default EventInfo;
