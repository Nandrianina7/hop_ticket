import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  alpha,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import api from '../../../api/api';
import { useEffect, useState } from 'react';
import { getRoleColor } from '../../../utils/getRoleColor';
import TitleDialog from './TitleDialog';
import ContentDialog from './ContentDialog';

const ManageOrganizer = ({ open, onClose, org_id, onUpdate }) => {
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchOrganizerData = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/accounts/org_data/${id}`, { withCredentials: true });

      if (!res.data) {
        console.log('No data found for this user, maybe this user is not registered');
        return;
      }
      const data = res.data.data;
      console.log('organizer data', data);

      setOrgData(data);
      setEditFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'unknown error';
      console.log('message', errorMess);
      console.log('error', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizer = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/accounts/update_organizer/${org_id}/`, {...editFormData, is_active: isActive}, {
        withCredentials: true,
      });

      if (res.data.success) {
        showSnackbar('Informations mises à jour avec succès', 'success');
        setIsEditing(false);
        await fetchOrganizerData(org_id);
        if (onUpdate) onUpdate();
      } else {
        showSnackbar(res.data.message || 'Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      const errorMess = error instanceof Error ? error.message : 'unknown error';
      console.log('message', errorMess);
      showSnackbar('Erreur lors de la mise à jour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field) => (event) => {
    setEditFormData({
      ...editFormData,
      [field]: event.target.value,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      full_name: orgData?.full_name || '',
      email: orgData?.email || '',
      phone: orgData?.phone || '',
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleStatusChange = (event) => {
    setIsActive(event.target.checked)
  }
  useEffect(() => {
    if (orgData) {
      setIsActive(orgData.is_active);
    };
  }, [orgData]);

  useEffect(() => {
    if (open && org_id) {
      fetchOrganizerData(org_id);
      setIsEditing(false);
    }
  }, [open, org_id]);

  const roleColor = getRoleColor(orgData?.role);

  if (loading && !orgData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
          >
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
            m: 0,
            position: 'relative',
            bgcolor: roleColor.light,
            borderBottom: `1px solid ${alpha(roleColor.bg, 0.2)}`,
          }}
        >
          <TitleDialog
            orgData={orgData}
            handleCancelEdit={handleCancelEdit}
            handleEditChange={handleEditChange}
            setIsEditing={setIsEditing}
            updateOrganizer={updateOrganizer}
            isEditing={isEditing}
            editFormData={editFormData}
            loading={loading}
            isActive={isActive}
            handleStatusChange={handleStatusChange}
          />
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <ContentDialog orgData={orgData} />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManageOrganizer;
