import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
  useTheme,
  alpha,
  Pagination,
  Stack,
  Skeleton,
  Menu,
  MenuItem,
  Button,
  Divider,
} from '@mui/material';
import { LocationOn, MoreVert, Edit, Delete, Visibility } from '@mui/icons-material';
import dayjs from 'dayjs';
import { stringToColor } from '../../../utils/stringToColor';
import ManageDialog from '../../../ui/ManageDialog';
import DeleteDialog from '../../../ui/DeleteDialog';
import EventInfo from '../../../ui/EventInfo';
import { getImagePath } from '../../../utils/getImagePath';

const EventsTable = ({ data, onUpdate, onDelete, loading = false, onSaveChange }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedData, setSelectedData] = useState({
    id: '',
    name: '',
    date: dayjs(),
    description: '',
    venue: '',
    time: dayjs(),
    price_tiers: [],
    image: null,
    location_name:''
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleMenuOpen = (event, item) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };
  const onOpenDialog = (item, e) => {
    e?.stopPropagation();
    setOpenInfo(false);
    setSelectedData({
      id: item.id,
      name: item.name,
      date: item.date ? dayjs(item.date?.split(' ')[0]) : dayjs(),
      description: item.description,
      venue: item.venue,
      time: item.date ? dayjs(item.date.split(' ')[1]) : dayjs(),
      price_tiers: item.price_tiers,
      image: item.image || null,
    });
    setOpen(true);
    handleMenuClose();
  };
  const onOpenDelete = (item, e) => {
    e?.stopPropagation();
    setOpenInfo(false);
    setSelectedData({
      id: item.id,
      name: item.name,
      date: item.date ? dayjs(item.date?.split(' ')[0]) : dayjs(),
      description: item.description,
      venue: item.venue,
      time: item.date ? dayjs(item.date.split(' ')[1]) : dayjs(),
      price_tiers: item.price_tiers,
      image: item.image || null,
    });
    setOpenDelete(true);
    handleMenuClose();
  };
  const onOpenInfo = (item, e) => {
    e?.stopPropagation();
    setSelectedData({
      id: item.id,
      name: item.name,
      date: item.date ? dayjs(item.date?.split(' ')[0]) : dayjs(),
      description: item.description,
      venue: item.venue,
      time: item.date ? dayjs(item.date.split(' ')[1]) : dayjs(),
      price_tiers: item.price_tiers,
      image: item.image || null,
    });
    setOpenInfo(true);
  };

  const calculateTotalTickets = (item) => {
    if (!item || !item.price_tiers) return 0;
    return item.price_tiers.reduce((total, tier) => total + (tier.available_quantity || 0), 0);
  };

  const getStatusChip = (item) => {
    const isSoldOut = item.tickets_sold >= calculateTotalTickets(item);
    const isUpcoming = dayjs.utc(item.date).isAfter(dayjs());
    if (isSoldOut) {
      return (
        <Chip
          label="Guicher fermée"
          size="small"
          sx={{
            borderRadius: 10,
            color: 'white',
            backgroundColor: alpha(stringToColor(item.name), 0.6),
          }}
        />
      );
    }
    if (!isUpcoming) {
      return (
        <Chip
          label="Complet"
          color="secondary"
          size="small"
          sx={{
            borderRadius: 10,
            color: 'white',
            backgroundColor: alpha(stringToColor(item.name), 0.6),
          }}
        />
      );
    }
    return (
      <Chip
        label="En vente"
        color="error"
        size="small"
        sx={{
          borderRadius: 10,
          color: 'white',
          backgroundColor: alpha(stringToColor(item.name), 0.6),
        }}
      />
    );
  };

  const getSalesProgress = (item) => {
    const total = calculateTotalTickets(item);
    return total > 0 ? (item.tickets_sold / total) * 100 : 0;
  };

  const totalPages = Math.ceil((data?.length || 0) / rowsPerPage);
  const paginatedData = data?.slice(page * rowsPerPage, (page + 1) * rowsPerPage) || [];

  if (loading) {
    return (
      <Grid container spacing={3} sx={{ mb: 2, mt: 6 }}>
        {Array.from({ length: rowsPerPage }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ position: 'relative' }}>
            <Card sx={{ width: '100%', p: 1, borderRadius: 3 }}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2 }}
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
                <Skeleton animation="wave" height={24} width="60%" />
                <Skeleton animation="wave" height={20} width="80%" />
                <Skeleton animation="wave" height={20} width="40%" />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Skeleton animation="wave" height={8} width="70%" />
                  <Skeleton animation="wave" height={20} width="20%" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if ((!data || data.length === 0) && !loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
          No events found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          There are currently no events to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Divider sx={{ mt: 1 }} />
      <Grid container spacing={3} sx={{ mb: 2, mt: 2 }}>
        {paginatedData.map((item) => {
          const date = dayjs.utc(item.date).local().format('MMM D, YYYY');
          const time = dayjs.utc(item.date).local().format('h:mm A');
          const totalTickets = calculateTotalTickets(item);
          const salesProgress = getSalesProgress(item);
          const eventColor = stringToColor(item.name);
          const imageSrc = getImagePath(item.image);
          return (
            <Grid item xs={12} key={item.id} sx={{ position: 'relative' }}>
              <Card
                sx={{
                  width: 340,
                  p: 1,
                  borderRadius: 3,
                  cursor: 'pointer',
                  boxShadow: 'rgba(0, 0, 0, 0.18) 0px 2px 4px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
                onClick={(e) => onOpenInfo(item, e)}
              >
                <CardMedia
                  component="div"
                  image={imageSrc}
                  alt={item.name}
                  sx={{
                    height: 200,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                ></CardMedia>
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>{getStatusChip(item)}</Box>

                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, p: 1.2 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {date} • {time}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, item)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" fontWeight="600" sx={{ lineHeight: 1 }}>
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: '250px' }}
                  >
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {item.location_name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={salesProgress}
                      sx={{
                        borderRadius: 10,
                        height: 7,
                        flexGrow: 1,
                        backgroundColor: alpha(eventColor, 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 10,
                          backgroundColor: eventColor,
                        },
                      }}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {salesProgress.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textAlign: 'center' }}
                    >
                      {item.tickets_sold} / {totalTickets} tickets vendus
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      mt: 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInfo(item, e);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 4,
          p: 3,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {paginatedData.length} sur {data?.length || 0}
        </Typography>

        <Stack spacing={2} direction="row" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Evenements par Pages:
          </Typography>
          <select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            style={{
              padding: '8px 12px',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              cursor: 'pointer',
            }}
          >
            {[8, 16, 24].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(event, value) => handleChangePage(event, value - 1)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            mt: 1,
            minWidth: 140,
          },
        }}
      >
        <MenuItem onClick={(e) => onOpenDialog(selectedItem, e)} sx={{ fontSize: '14px' }}>
          <Edit sx={{ fontSize: 18, mr: 1.5 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={(e) => onOpenDelete(selectedItem, e)}
          sx={{ fontSize: '14px', color: theme.palette.error.main }}
        >
          <Delete sx={{ fontSize: 18, mr: 1.5 }} /> Delete
        </MenuItem>
      </Menu>
      <ManageDialog
        open={open}
        onClose={() => setOpen(false)}
        initialData={selectedData}
        onClick={(updatedFormData) => {
          setOpenInfo(false);
          onUpdate(selectedData.id, updatedFormData, () => setOpen(false));
        }}
        type="update"
      />
      <DeleteDialog
        open={openDelete}
        handleClose={() => setOpenDelete(false)}
        onClick={() => onDelete(selectedData.id, () => setOpenDelete(false))}
      />
      <EventInfo
        open={openInfo}
        event={selectedData}
        handleClose={() => setOpenInfo(false)}
        onSave={onSaveChange}
        type="update"
      />
    </Box>
  );
};

export default EventsTable;
