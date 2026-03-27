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
  Typography,
  Button,
} from '@mui/material';
import { Close as CloseIcon, Delete, WarningAmber } from '@mui/icons-material';
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
  const [isDelete, setIsDelete] = useState(false);
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

  const changeIsDelete = () => {
    setIsDelete(true);
  };
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
      const res = await api.put(
        `/accounts/update_organizer/${org_id}/`,
        { ...editFormData, is_active: isActive },
        {
          withCredentials: true,
        }
      );

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

  const handleDelete = async () => {
    try {
      const res = await api.put(`/accounts/delete_org/${org_id}/`, {}, { withCredentials: true });

      if (!res.data) {
        showSnackbar('echec de suppression', 'error');
        return;
      }
      await fetchOrganizerData(org_id);
      showSnackbar('Compte supprimer', 'success');
      console.log('deleted');
    } catch (error) {
      if (error.response?.data) {
        showSnackbar(error.response.data.message);
      } else {
        showSnackbar('Erreur de la suppression', 'Error');
      }
    }
  };

  const handleRestore = async () => {
    try {
      const res = await api.put(`/accounts/restore_org/${org_id}/`, {}, { withCredentials: true });
      if (!res.data) {
        showSnackbar('echec de restoration', 'error');
        return;
      }
      await fetchOrganizerData(org_id);
      showSnackbar('Compte restorer', 'success');
      console.log('Restored');
    } catch (error) {
      if (error.response?.data) {
        showSnackbar(error.response.data.message);
      } else {
        showSnackbar('Erreur de la restoration', 'Error');
      }
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
    setIsActive(event.target.checked);
  };
  useEffect(() => {
    if (orgData) {
      setIsActive(orgData.is_active);
    }
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
            changeDelete={changeIsDelete}
            handleRestore={handleRestore}
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
          {isDelete && !orgData?.is_deleted && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  p: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'error.main',
                  mb: 2,
                  width: '500px',
                  animation: 'fadeIn 0.3s ease-in-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <WarningAmber sx={{ color: 'error.main', fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600} color="error.dark">
                    Confirmation de suppression
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Voulez-vous vraiment supprimer cet utilisateur ?
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Cette action entraîne la suppression de toutes les données associées à cet
                  utilisateur. Cette opération est irréversible.
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={() => setIsDelete(false)}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    sx={{ borderRadius: 2 }}
                    startIcon={<Delete />}
                    onClick={handleDelete}
                  >
                    Confirmer la suppression
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
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
