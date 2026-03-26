import {
  CalendarMonth,
  Cancel,
  Delete,
  Edit,
  Email,
  Person,
  Phone,
  Save,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { getRoleDisplay } from '../../../utils/getRoleDisplay';
import { getRoleColor } from '../../../utils/getRoleColor';
import { formatDate } from '../../../utils/formatDate';
import { Android12Switch } from '../../../ui/SwitchCustomed';
import { useState } from 'react';

const TitleDialog = ({
  orgData,
  handleCancelEdit,
  setIsEditing,
  handleEditChange,
  updateOrganizer,
  isEditing,
  editFormData,
  loading,
  isActive,
  handleStatusChange,
  isDelete = false,
  changeDelete,
  handleRestore
}) => {
  const roleColor = getRoleColor(orgData?.role);

  return (
    <Box sx={{ p: 3, pr: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: roleColor.bg,
              fontSize: '2rem',
            }}
          >
            {orgData?.full_name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {orgData?.full_name || 'Utilisateur'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={getRoleDisplay(orgData?.role)}
                size="small"
                sx={{
                  bgcolor: roleColor.bg,
                  color: '#fff',
                  fontWeight: 500,
                  mt: 0.5,
                }}
              />
              <Typography variant="subtitle1" fontSize={12}>
                Status de compte:{' '}
                {orgData.is_active ? (
                  <Chip label="Activé" color="success" variant="outlined" size="small" />
                ) : (
                  <Chip label="Desactivé" color="error" variant="outlined" />
                )}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={isEditing ? <Cancel fontSize="small" /> : <Edit />}
            onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
          {!orgData.is_deleted && (
            <Button
              startIcon={<Delete fontSize="small" />}
              size="small"
              variant="contained"
              onClick={changeDelete}
            >
              Delete
            </Button>
          )}
          {orgData.is_deleted && (
            <Button variant='contained' size='small' onClick={handleRestore}>Restaurer</Button>
          )}
        </Box>
      </Box>

      {!isEditing ? (
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {[
            {
              icon: <Email sx={{ fontSize: 16, color: 'text.secondary' }} />,
              text: orgData?.email || 'Non renseigné',
            },
            {
              icon: <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />,
              text: orgData?.phone || 'Non renseigné',
            },
            {
              icon: <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />,
              text: `Membre depuis: ${orgData?.created_at ? formatDate(orgData.created_at) : 'N/A'}`,
            },
          ].map((item, index) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} key={index}>
              {item.icon}
              <Typography variant="body2" color="text.secondary">
                {item.text}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid>
              <TextField
                fullWidth
                label="Nom complet"
                value={editFormData.full_name}
                onChange={handleEditChange('full_name')}
                size="small"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                }}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={handleEditChange('email')}
                size="small"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                }}
              />
            </Grid>
            <Grid>
              <TextField
                fullWidth
                label="Téléphone"
                value={editFormData.phone}
                onChange={handleEditChange('phone')}
                size="small"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                }}
              />
            </Grid>
            <Grid>
              <FormControlLabel
                control={
                  <Android12Switch
                    checked={isActive}
                    onChange={handleStatusChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    {isActive ? 'Compte activé' : 'Compte désactivé'}
                  </Typography>
                }
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={updateOrganizer}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TitleDialog;
