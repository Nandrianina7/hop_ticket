import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const DeleteDialog = ({ open, handleClose, onClick, eventName }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-dialog-title"
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: theme.palette.background.paper,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: theme.palette.error.main,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.main,
            }}
          >
            <WarningAmberRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="600">
              Delete Event
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              This action cannot be undone
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 0 }}>
        <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
          Are you sure you want to delete this item ?
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            p: 2,
            mt: 2,
            borderRadius: 1,
            backgroundColor: theme.palette.error.background || '#fef6f6',
            border: `1px solid ${theme.palette.error.light}`,
          }}
        >
          <WarningAmberRoundedIcon
            sx={{ fontSize: 18, color: theme.palette.error.main, mt: 0.25 }}
          />
          <Typography variant="body2" color="error.main" sx={{ lineHeight: 1.5 }}>
            Cela va supprimer définitivement l'item et toutes ses données associées.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          sx={{
            flex: 1,
            borderRadius: 2,
            py: 1,
            borderColor: theme.palette.mode === 'light' ? 'grey.300' : 'grey.700',
            color: 'text.primary',
            '&:hover': {
              borderColor: theme.palette.mode === 'light' ? 'grey.400' : 'grey.600',
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onClick}
          variant="contained"
          size="large"
          startIcon={<DeleteOutlineRoundedIcon />}
          sx={{
            flex: 1,
            borderRadius: 2,
            py: 1,
            backgroundColor: theme.palette.error.main,
            color: 'white',
            fontWeight: '600',
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
            },
          }}
        >
          Delete Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
