import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, CardMedia, useTheme, IconButton } from '@mui/material';
import { getImagePath } from '../../../utils/getImagePath';
import { DeleteOutlineTwoTone, EditOutlined } from '@mui/icons-material';
import DeleteDialog from '../../../ui/DeleteDialog';
import ConcenssionForm from './ConcessionForm';
import ConcessionAddQty from './ConcessionAddqty';
import api from '../../../api/api';
const ConcessionCard = ({ concessionList = [], onDelete, onUpdate, concenssionCategories}) => {
  const theme = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQty] = useState(0);
  const [openDelete, setOpenDelete] = useState(false);
  const toggleDelete = (newVal) => {
    setOpenDelete(newVal);
    if (typeof newVal === 'boolean' && newVal === false) {
      setSelectedItem(null);
    }
  };

  const onClickDelete = (id) => {
    if (id !== null) {
      onDelete(id);
    }
    toggleDelete(false);
  };

  return (
    <Box sx={{ mt: 2, width: '100%', mb: 2 }}>
      <Stack spacing={2}>
        {concessionList.map((item, index) => (
          <Box
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              p: 1,
              border: '1px solid',
              position: 'relative',
              borderRadius: 2,
              borderColor: theme.palette.divider,
              backgroundColor:
                theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[800],
              },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="subtitle1">Prix: {item.price} MGA</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Categorie: {item.category_name || item.category}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {item.description}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {item.stock + quantity} en stock
              </Typography>
            </Box>

            {hoveredIndex === index && (
              <Box sx={{ display: 'flex', position: 'absolute', top: 5, right: '50%' }}>
                <IconButton
                  size="small"
                  sx={{ color: theme.palette.primary.main }}
                  onClick={() => {
                    toggleDelete(true);
                    setSelectedItem(item.id);
                  }}
                >
                  <DeleteOutlineTwoTone />
                </IconButton>
                <ConcenssionForm onSave={onUpdate} initialData={item} concenssionCategories={concenssionCategories} />
                <ConcessionAddQty
                  item={item}
                  onSave={async ({ id, quantity }) => {
                    // Call backend view, then update list
                    await api.post(`/cinema/concessions/${id}/add-stock/`, { quantity });
                    setQty(quantity);
                    // onUpdate?.({ ...item, stock: (item.stock || 0) + quantity })
                  }}
                />
              </Box>
            )}

            {item.image && (
              <CardMedia
                component="img"
                sx={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 1, ml: 2 }}
                image={getImagePath(item.image)}
                alt={item.name}
              />
            )}
          </Box>
        ))}
        <DeleteDialog
          open={openDelete}
          handleClose={() => toggleDelete(false)}
          onClick={() => onClickDelete(selectedItem)}
        />
      </Stack>
    </Box>
  );
};

export default ConcessionCard;
