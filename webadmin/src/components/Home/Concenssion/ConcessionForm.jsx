import { EditOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../../api/api';
import { getImagePath } from '../../../utils/getImagePath';

const ConcenssionForm = ({ onSave, initialData, concenssionCategories, type = 'cinema' }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageFile: null,
    imagePreview: '',
    quantity: '',
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category || '',
        imageFile: null,
        imagePreview: getImagePath(initialData.image_url) || '',
        quantity: initialData.stock || '',
      });
    }
  }, [open, initialData]);

  const toggleOpen = (newVal) => () => {
    setOpen(newVal);
    if (!newVal) {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        imageFile: null,
        imagePreview: '',
      });
    }
  };

  const onChangeInput = (e) => {
    const { value, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: previewUrl,
      }));
    }
  };

  const handleSave = () => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('price', Number(formData.price));
    data.append('stock', Number(formData.quantity));

    if (formData.imageFile) {
      data.append('image', formData.imageFile);
    }

    if (initialData) {
      onSave?.(data, initialData.id);
    } else {
      onSave(data);
    }
    toggleOpen(false)();
  };

  return (
    <Box>
      {initialData ? (
        <IconButton size="small" onClick={toggleOpen(true)}>
          <EditOutlined />
        </IconButton>
      ) : (
        <Button variant="contained" onClick={toggleOpen(true)}>
          Ajouter nouvelle concession
        </Button>
      )}
      <Dialog open={open} onClose={toggleOpen(false)} fullWidth maxWidth="sm" sx={{ p: 1 }}>
        <DialogTitle>
          {initialData ? 'Modifier la concession' : 'Créer une nouvelle concession'}
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="concession-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={onChangeInput}
            label="nom de la concession"
            sx={{ mt: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={onChangeInput}
            multiline
            rows={4}
          />

          <TextField
            label="Prix"
            type="number"
            name="price"
            value={formData.price}
            onChange={onChangeInput}
          />

          <TextField
            label="Quantité en stock"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={onChangeInput}
          />

          <FormControl>
            <InputLabel htmlFor="category">Categorie</InputLabel>
            <Select
              id="Category"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              name="category"
              label="Categorie"
            >
              {type === 'cinema' &&
                concenssionCategories.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.category_name}
                  </MenuItem>
                ))}
              {type === 'event' &&
                concenssionCategories.map((item) => (
                  <MenuItem key={item.id} value={item.category_name}>
                    {item.category_name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Box>
            <Button variant="outlined" component="label">
              {initialData ? 'Changer image' : 'Selectionner une image'}
              <input type="file" hidden accept="image/*" onChange={onImageChange} />
            </Button>

            {formData.imagePreview && (
              <Box mt={2}>
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={toggleOpen(false)}>
            annuler
          </Button>
          <Button variant="contained" onClick={handleSave}>
            soumettre
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConcenssionForm;
