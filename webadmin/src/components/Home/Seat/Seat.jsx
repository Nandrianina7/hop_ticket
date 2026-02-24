import React from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import { Chair, Star, Block, Save, Clear, TheaterComedy, Update } from '@mui/icons-material';
import { SeatGridContainer, StatCard, StyledPaper, SeatButton } from '../../../utils/StyleForSeat';

const Seat = ({ id, onSaveHall, initialLayout, type, onUpdateHall, hall_id, ...props }) => {
  const [rows, setRows] = React.useState(initialLayout?.rows || 6);
  const [cols, setCols] = React.useState(initialLayout?.cols || 8);
  const [disabledSeats, setDisabledSeats] = React.useState(initialLayout?.disabledSeats || []);
  const [VIPSeats, setVIPSeats] = React.useState(initialLayout?.VIPSeats || []);
  const [onAddToVIP, setOnAddToVIP] = React.useState(false);
  const [onAddToDisabled, setOnAddToDisabled] = React.useState(false);
  const [hallsForm, setHallsForm] = React.useState({
    name: initialLayout?.name || '',
    screentype: initialLayout?.screen_type || '',
  });
  const [showJson, setShowJson] = React.useState(false);

  const toggleSeat = (row, col, seatType) => {
    const seatId = `${row}-${col}`;

    if (seatType === 'vip') {
      setVIPSeats((prev) =>
        prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
      );
      setDisabledSeats((prev) => prev.filter((s) => s !== seatId));
    } else if (seatType === 'disabled') {
      setDisabledSeats((prev) =>
        prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
      );
      setVIPSeats((prev) => prev.filter((s) => s !== seatId));
    } else {
      setVIPSeats((prev) => prev.filter((s) => s !== seatId));
      setDisabledSeats((prev) => prev.filter((s) => s !== seatId));
    }
  };

  const getSeatStatus = (row, col) => {
    const seatId = `${row}-${col}`;
    if (disabledSeats.includes(seatId)) return 'disabled';
    if (VIPSeats.includes(seatId)) return 'vip';
    return 'normal';
  };

  const getLayout = () => ({
    rows,
    cols,
    disabledSeats,
    VIPSeats,
    totalSeats: rows * cols,
    availableSeats: rows * cols - disabledSeats.length,
    vipSeatsCount: VIPSeats.length,
    disabledSeatsCount: disabledSeats.length,
    name: hallsForm.name,
    screen_type: hallsForm.screentype,
  });

  const handleChange = (e) => {
    const { value, name } = e.target;
    setHallsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const layout = getLayout();
    const payload = {
      cinema: id,
      name: hallsForm.name,
      screen_type: hallsForm.screentype,
      base_price: 1000,
      rows: layout.rows,
      cols: layout.cols,
      disabledSeats: layout.disabledSeats,
      VIPSeats: layout.VIPSeats,
    };
    await onSaveHall(payload);
  };

  const handleManualUpdate = () => {
    if (onUpdateHall) {
      const layout = getLayout();
      onUpdateHall(hall_id, {
        rows: layout.rows,
        cols: layout.cols,
        disabledSeats: layout.disabledSeats,
        VIPSeats: layout.VIPSeats,
        name: layout.name,
        screen_type: layout.screen_type,
      });
    }
  };

  const resetLayout = () => {
    setDisabledSeats([]);
    setVIPSeats([]);
    setOnAddToVIP(false);
    setOnAddToDisabled(false);
  };
  const cancelChange = () => {
    if (initialLayout) {
      setRows(initialLayout.rows || 6);
      setCols(initialLayout.cols || 6);
      setDisabledSeats(initialLayout.disabledSeats || []);
      setVIPSeats(initialLayout.VIPSeats || []);
      setHallsForm({
        name: initialLayout.name || '',
        screentype: initialLayout.screen_type || '',
      });
    }
  };
  const totalSeats = rows * cols;
  const availableSeats = totalSeats - disabledSeats.length;
  const vipSeatsCount = VIPSeats.length;

  React.useEffect(() => {
    if (initialLayout) {
      setRows(initialLayout.rows || 6);
      setCols(initialLayout.cols || 8);
      setDisabledSeats(initialLayout.disabledSeats || []);
      setVIPSeats(initialLayout.VIPSeats || []);
      setHallsForm({
        name: initialLayout.name || '',
        screentype: initialLayout.screen_type || '',
      });
    }
  }, [initialLayout]);

  return (
    <StyledPaper {...props}>
      {type === 'create' ? (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}
          >
            <TheaterComedy color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight="700" color="primary">
              Création de Salle de Cinema
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Concevez le plan de votre salle de cinéma avec une gestion interactive des sièges
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}
          >
            <TheaterComedy color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight="700" color="primary">
              Salle de Cinema
            </Typography>
          </Box>
        </Box>
      )}

      <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
        <Grid minWidth={800}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">plan de salle</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="VIP Mode">
                    <IconButton
                      color={onAddToVIP ? 'warning' : 'default'}
                      onClick={() => {
                        setOnAddToVIP(!onAddToVIP);
                        setOnAddToDisabled(false);
                      }}
                    >
                      <Star />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Désactivation Mode">
                    <IconButton
                      color={onAddToDisabled ? 'error' : 'default'}
                      onClick={() => {
                        setOnAddToDisabled(!onAddToDisabled);
                        setOnAddToVIP(false);
                      }}
                    >
                      <Block />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Layout">
                    <IconButton color="default" onClick={resetLayout}>
                      <Clear />
                    </IconButton>
                  </Tooltip>
                  {onUpdateHall && type !== 'create' && (
                    <Tooltip title="modifier La salle">
                      <IconButton color="info" onClick={handleManualUpdate}>
                        <Update />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              {onAddToVIP && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  VIP Mode: Cliquez sur les sièges pour les marquer comme VIP
                </Alert>
              )}
              {onAddToDisabled && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Désactivation Mode: Cliquez sur les sièges pour les désactiver
                </Alert>
              )}

              <SeatGridContainer sx={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}>
                {Array.from({ length: rows }).map((_, row) =>
                  Array.from({ length: cols }).map((_, col) => {
                    const seatStatus = getSeatStatus(row, col);
                    const currentMode = onAddToVIP ? 'vip' : onAddToDisabled ? 'disabled' : null;

                    return (
                      <SeatButton
                        key={`${row}-${col}`}
                        seatstatus={seatStatus}
                        onClick={() => toggleSeat(row, col, currentMode || 'normal')}
                        sx={{ width: '30px', height: '30px' }}
                      >
                        <Chair fontSize="small" />
                      </SeatButton>
                    );
                  })
                )}
              </SeatGridContainer>
              <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                {[
                  {
                    color: 'primary',
                    text: totalSeats - disabledSeats.length,
                    label: 'Place totale',
                  },
                  { color: 'success.main', text: availableSeats, label: 'Place disponible' },
                  { color: 'warning.main', text: vipSeatsCount, label: 'Place VIP' },
                  // { color: 'error.main', text: disabledSeats.length, label: 'Place désactivée' },
                ].map((item, index) => (
                  <StatCard key={index}>
                    <CardContent sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h6" color={item.color}>
                        {item.text}
                      </Typography>
                      <Typography variant="body2">{item.label}</Typography>
                    </CardContent>
                  </StatCard>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid sx={{ width: 390 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuration de salle
              </Typography>

              <TextField
                fullWidth
                label="nom de salle"
                value={hallsForm.name}
                onChange={handleChange}
                name="name"
                sx={{ mb: 2 }}
                placeholder="Enter hall name"
              />

              <Select
                fullWidth
                value={hallsForm.screentype}
                onChange={handleChange}
                name="screentype"
                displayEmpty
                sx={{ mb: 2 }}
                renderValue={(selected) => selected || "Sélectionner le type d'écran"}
              >
                <MenuItem value="">type d'écran</MenuItem>
                {['2D', '3D', 'IMAX', '4DX'].map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Rows"
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
                    inputProps={{ min: 1, max: 20 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Columns"
                    value={cols}
                    onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
                    inputProps={{ min: 1, max: 20 }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {[
                  { label: 'Simple', color: 'primary', variant: 'outlined' },
                  { label: 'VIP', color: 'warning' },
                  // { label: 'Disabled', color: 'error' },
                ].map((item, index) => (
                  <Chip
                    key={index}
                    icon={<Chair />}
                    label={item.label}
                    color={item.color}
                    variant={item?.variant}
                  />
                ))}
              </Box>
              {/* <FormControlLabel
                control={
                  <Switch checked={showJson} onChange={(e) => setShowJson(e.target.checked)} />
                }
                label="Show JSON Layout"
              /> */}

              {type === 'create' ? (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ mt: 2 }}
                  onClick={handleSave}
                >
                  Enregister la salle
                </Button>
              ) : (
                <Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Update />}
                    sx={{ mt: 1, mb: 1 }}
                    onClick={handleManualUpdate}
                    color="info"
                  >
                    modifier la salle
                  </Button>
                  <Button variant="outlined" fullWidth onClick={cancelChange}>
                    Annuler la mise à jour
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {showJson && (
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Layout Configuration
              </Typography>
              <Box
                sx={{
                  background: '#1a1a1a',
                  color: '#00ff00',
                  padding: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <pre>{JSON.stringify(getLayout(), null, 2)}</pre>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </StyledPaper>
  );
};

export default Seat;
