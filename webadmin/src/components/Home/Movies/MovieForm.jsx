import { Add, Close, Edit } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Drawer,
  IconButton,
  Input,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import React, { useEffect } from 'react';

const MoviesForm = ({ onSave, initialData, type, onClose, open }) => {
  const [movieData, setMovieData] = React.useState(
    initialData || {
      title: '',
      description: '',
      duration: '',
      release_date: '',
      genre: '',
      director: '',
      cast: '',
      poster: null,
      trailer_url: '',
    }
  );

  const defaults = {
    title: '',
    description: '',
    duration: '',
    release_date: new Date(),
    genre: '',
    director: '',
    cast: '',
    poster: null,
    trailer_url: '',
  };

  
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [posterFile, setPosterFile] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const posterInputRef = React.useRef(null);
  const [imagePreview, setImagePreview] = React.useState(null);

  const theme = useTheme();

  React.useEffect(() => {
    if (open) {
      setMovieData(
        initialData || {
          title: '',
          description: '',
          duration: '',
          release_date:new Date(),
          genre: '',
          director: '',
          cast: '',
          poster: '',
          trailer_url: '',
        }
      );
    }
  }, [open, initialData]);
  useEffect(() => {
    if (initialData) {
      setMovieData(initialData);
    }
  }, [initialData]);

 useEffect(() => {
    if (!open) return;
    const base = initialData ?? defaults;
    setMovieData({
      ...base,
      release_date: base?.release_date ? dayjs(base.release_date).format('YYYY-MM-DD') : '',
    });
  }, [open, initialData?.id]); // avoid running on every parent re-render

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    if (name === 'release_date') {
      const normalized = value ? dayjs(value).format('YYYY-MM-DD') : '';
      setMovieData((prev) => ({ ...prev, release_date: normalized }));
      return;
    }
    setMovieData((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(movieData).forEach(([key, value]) => {
      if (key !== 'poster') {
        formData.append(key, value);
      }
    });

    if (selectedFile) {
      formData.append('default_image', selectedFile);
    }
    if (posterFile) {
      formData.append('poster', posterFile);
    }

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    onSave(formData);
    onClose();
  };

  return (
    <Box>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '80%', md: '60%' },
            marginTop: '60px',
            p: 2,
            gap: 2,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">{type === 'update' ? 'modification de film' : 'ajout de film'}</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
          {[
            { name: 'title', value: movieData.title || '', label: 'Titre', type: 'text' },
            {
              name: 'description',
              value: movieData.description || '',
              label: 'Description du film',
              type: 'text',
              multiline: true,
              rows: 3,
            },
            {
              name: 'duration',
              value: movieData.duration || '',
              label: 'durée (minutes)',
              type: 'number',
            },
            {
              name: 'release_date',
              value: movieData.release_date || '',
              label: 'Date de sortie (YYYY-MM-DD)',
              type: 'date',
            },
            { name: 'director', value: movieData.director || '', label: 'Réalisateur', type: 'text' },
            { name: 'cast', value: movieData.cast || '', label: 'Casting', type: 'text' },
            {
              name: 'trailer_url',
              value: movieData.trailer_url || '',
              label: 'URL de la bande-annonce',
              type: 'url',
            },
          ].map((item, index) => 
            item.name === 'release_date' ? (
              <DatePicker
                key={`release-${index}`}
                label="Release Date"
                value={item.value ? dayjs(item.value) : null}
                onChange={(newValue) =>
                  handleInputChange({
                    target: {
                      name: item.name,
                      value: newValue ? dayjs(newValue).format('YYYY-MM-DD') : '',
                    },
                  })
                }
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            ) : (
              <TextField
                key={index}
                name={item.name}
                value={item.value}
                label={item.label}
                onChange={handleInputChange}
                type={item.type}
                multiline={item.multiline}
                rows={item.rows}
                fullWidth
                size="small"
              />
            )
          )}
          <Select
            name="genre"
            value={movieData.genre || ''}
            onChange={handleInputChange}
            displayEmpty
            fullWidth
            size="small"
          >
            <MenuItem value="">genre de film</MenuItem>
            {['Action', 'Child', 'Adult', 'Thriller', 'Drama', 'Romance'].map((item, index) => (
              <MenuItem value={item} key={index}>
                {item}
              </MenuItem>
            ))}
          </Select>

          <Box>
            <Button variant="outlined" onClick={() => posterInputRef.current?.click()} fullWidth>
              Upload de Poster
            </Button>
            <Input
              type="file"
              name="poster"
              inputRef={posterInputRef}
              accept="image/*"
              onChange={handlePosterChange}
              sx={{ display: 'none' }}
            />
            {posterFile && <Box sx={{ mt: 1 }}>Selected: {posterFile.name}</Box>}
          </Box>
          <Box>
            {/* <Button variant="outlined" onClick={() => fileInputRef.current?.click()} fullWidth>
              Upload Default Image
            </Button>
            <Input
              type="file"
              name="default_image"
              inputRef={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              sx={{ display: 'none' }}
            /> */}
            {selectedFile && <Box sx={{ mt: 1 }}>Selected: {selectedFile.name}</Box>}
          </Box>

          {imagePreview && (
            <Card>
              <CardMedia component="img" height="140" image={imagePreview} alt="Preview" />
            </Card>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} variant="outlined" fullWidth>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" fullWidth>
            {type === 'update' ? 'Modifier le film' : 'Enregistrer le film'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MoviesForm;
