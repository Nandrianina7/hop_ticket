import React, { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import renderElementKonva from '../../ui/renderElementKonva';
import { Box, Typography, Divider, useTheme, IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import DeleteDialog from '../../ui/DeleteDialog';
import VenuePlanBuilder from './VenueBuilder';
const VenuePlanView = ({
  plan,
  zoom = 1,
  selectedId = null,
  onElementClick = () => {},
  onDeletePlan,
  onUpdatePLan,
}) => {
  const width = plan?.metadata?.stageSize?.width ?? 800;
  const height = plan?.metadata?.stageSize?.height ?? 600;
  const theme = useTheme();
  const [openDelete, setOpenDelete] = useState(false);
  const [openBuilder, setOpenBuilder] = useState(false);

  if (!plan) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          bgcolor: 'grey.100',
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary">No plan selected</Typography>
      </Box>
    );
  }
  const toggleOpen = (newValue) => () => {
    setOpenDelete(newValue);
  };
  const handleDelete = () => {
    onDeletePlan(plan?.id);
    toggleOpen(false)();
  };
  const handleUpdate = (data) => {
    onUpdatePLan(plan?.id, data);
    setOpenBuilder(false);
  };
  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6">{plan.site_name || 'Venue Plan'}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Created at: {new Date(plan.created_at).toLocaleString()}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mr: 2,
          }}
        >
          <IconButton size="small" color="primary" onClick={toggleOpen(true)}>
            <Delete />
          </IconButton>
          <IconButton size="small" onClick={() => setOpenBuilder(true)}>
            <Edit />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: 'primary.main' }} />

      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 500,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Stage
          width={width}
          height={height}
          scaleX={zoom}
          scaleY={zoom}
          style={{
            background: theme.palette.background.default,
            borderRadius: '8px',
          }}
        >
          <Layer>
            {(plan?.elements || []).map((el) =>
              renderElementKonva(el, {
                selectedId,
                onElementClick,
                draggable: false,
              })
            )}
          </Layer>
        </Stage>
      </Box>
      <DeleteDialog open={openDelete} handleClose={toggleOpen(false)} onClick={handleDelete} />
      <VenuePlanBuilder
        open={openBuilder}
        onClose={() => setOpenBuilder(false)}
        initialPlan={plan}
        onSave={handleUpdate}
      />
    </Box>
  );
};

export default VenuePlanView;
