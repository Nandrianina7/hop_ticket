import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox,
  Grid,
  Box,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import { CardGiftcard } from '@mui/icons-material';

const PromocodeForm = ({ type, btnText, onSave, isItem = false }) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = (newVal) => () => {
    setOpen(newVal);
  };

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: '',
    valid_from: null,
    valid_until: null,
    is_active: true,
    usage_limit: '',
    per_user_limit: 1,
    seat_type: 'ALL',
    min_tickets: 0,
    min_total_spent: 0,
  });

  const handleInput = (e) => {
    const { value, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelect = (e) => {
    const { value, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckbox = (e) => {
    const { checked, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async() => {
    await onSave(formData);
    toggleOpen(false)();
  }
  return (
    <>
      {isItem ? (
        <MenuItem onClick={toggleOpen(true)}>
          <ListItemIcon>
            <CardGiftcard fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={btnText} />
        </MenuItem>
      ) : (
        <Button variant='contained' onClick={toggleOpen(true)}>{btnText}</Button>
      )}
      <Dialog
        open={open}
        onClose={toggleOpen(false)}
        maxWidth="md"
        aria-labelledby="promocode-creation"
        scroll="paper"
      >
        <DialogTitle>
          {type === "edit" ? "Edit Promocode" : "Create New Promocode"}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid>
                  <TextField
                    size='small'
                    name="code"
                    label="Promotion Code"
                    value={formData.code}
                    onChange={handleInput}
                    fullWidth
                    required
                    placeholder="e.g., SUMMER25"
                  />
                </Grid>
                <Grid >
                  <TextField
                  size='small'
                    name="description"
                    label="Description"
                    multiline
                    value={formData.description}
                    onChange={handleInput}
                    fullWidth
                    placeholder="Describe the purpose of this promocode"
                    sx={{ width: 400}}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Discount Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      size='small'
                      name="discount_type"
                      value={formData.discount_type}
                      onChange={handleSelect}
                      label="Discount Type"
                    >
                      <MenuItem value="percent">Percentage</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                  size='small'
                    name="discount_value"
                    type="number"
                    label={formData.discount_type === 'percent' ? 'Discount Percentage' : 'Discount Amount'}
                    value={formData.discount_value}
                    onChange={handleInput}
                    fullWidth
                    required
                    inputProps={{ 
                      min: 0,
                      max: formData.discount_type === 'percent' ? 100 : undefined 
                    }}
                    helperText={formData.discount_type === 'percent' ? 'Enter value between 0-100' : ''}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Validity Period
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Valid From"
                      value={formData.valid_from}
                      onChange={(val) => handleDateChange("valid_from", val)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Valid Until"
                      value={formData.valid_until}
                      onChange={(val) => handleDateChange("valid_until", val)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Box>

            <Divider />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Usage Limits
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size='small'
                    name="usage_limit"
                    type="number"
                    label="Total Usage Limit"
                    value={formData.usage_limit}
                    onChange={handleInput}
                    fullWidth
                    placeholder="Leave blank for unlimited"
                    inputProps={{ min: 0 }}
                    helperText="Maximum total uses across all users"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size='small'
                    name="per_user_limit"
                    type="number"
                    label="Per User Limit"
                    value={formData.per_user_limit}
                    onChange={handleInput}
                    fullWidth
                    inputProps={{ min: 1 }}
                    helperText="Maximum uses per individual user"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Eligibility Requirements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Applicable Seat Types</InputLabel>
                    <Select
                      size='small'
                      name="seat_type"
                      value={formData.seat_type}
                      onChange={handleSelect}
                      label="Applicable Seat Types"
                    >
                      <MenuItem value="ALL">All seats</MenuItem>
                      <MenuItem value="VIP">VIP only</MenuItem>
                      <MenuItem value="REGULAR">Regular only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    size='small'
                    name="min_tickets"
                    type="number"
                    label="Minimum Tickets"
                    value={formData.min_tickets}
                    onChange={handleInput}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    size='small'
                    name="min_total_spent"
                    type="number"
                    label="Minimum Spend"
                    value={formData.min_total_spent}
                    onChange={handleInput}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_active}
                    name="is_active"
                    onChange={handleCheckbox}
                  />
                }
                label={
                  <Typography variant="body1">
                    <strong>Activate this promocode immediately</strong>
                  </Typography>
                }
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={toggleOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            size="large"
          >
            {type === "edit" ? "Update Promocode" : "Create Promocode"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PromocodeForm;