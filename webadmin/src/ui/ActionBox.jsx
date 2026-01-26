import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';

const ActionBox = ({ onOpenDialog, openDelete }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Tooltip title="Edit">
      <IconButton onClick={onOpenDialog}>
        <EditOutlined />
      </IconButton>
    </Tooltip>
    <Tooltip title="Delete">
      <IconButton color="error" onClick={openDelete}>
        <DeleteOutline />
      </IconButton>
    </Tooltip>
  </Box>
);

export default ActionBox;
