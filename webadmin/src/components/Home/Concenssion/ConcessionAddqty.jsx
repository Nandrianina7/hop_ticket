import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';

/**
 * Small form to add quantity to a concession item.
 * Props:
 * - item: { id, name, stock }
 * - onSave: (payload) => void | Promise<void>  // payload: { id, quantity }
 * - buttonProps: optional MUI Button props override
 */
const ConcessionAddQty = ({ item, onSave, buttonText = 'Ajouter quantité' }) => {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleOpen = () => {
    setQty('');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const v = e.target.value;
    const n = Number(v);
    setQty(Number.isFinite(n) && n >= 0 ? v : '');
  };

  const handleSubmit = async () => {
    const n = parseInt(qty, 10);
    if (!Number.isFinite(n) || n <= 0) {
      setSnack({ open: true, message: 'Quantité invalide', severity: 'warning' });
      return;
    }
    try {
      await onSave?.({ id: item?.id, quantity: n });
      setSnack({ open: true, message: 'Stock mis à jour', severity: 'success' });
      setOpen(false);
    } catch (e) {
      setSnack({ open: true, message: 'Échec de la mise à jour', severity: 'error' });
    }
  };

  return (
    <Box>
      <Button variant="outlined" size="small" onClick={handleOpen}>
        {buttonText}
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Ajouter au stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Article"
              value={item?.name ?? ''}
              InputProps={{ readOnly: true }}
              size="small"
            />
            <TextField
              label="Quantité à ajouter"
              type="number"
              inputProps={{ min: 1 }}
              value={qty}
              onChange={handleChange}
              size="small"
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!qty || parseInt(qty, 10) <= 0}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConcessionAddQty;
