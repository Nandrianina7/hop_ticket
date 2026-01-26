import { styled } from '@mui/material';
import { NavLink } from 'react-router-dom';

export const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
  borderRadius: '8px',
  margin: '4px 0',
  transition: 'all 0.2s ease',

  '&.active': {
    borderRight: `4px solid ${theme.palette.primary.main}`,
    '& .MuiListItem-root': {
      backgroundColor: 'rgba(171, 15, 15, 0.05)',
      color: theme.palette.primary.main,
      borderRadius: '8px',

      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },

      '&:hover': {
        '& .MuiListItem-root': {
          backgroundColor: 'rgba(209, 46, 46, 0.15)',
        },
      },
    },
  },

  '&:hover .MuiListItem-root': {
    backgroundColor: 'rgba(171, 15, 15, 0.05)',
    borderRadius: '8px',
  },
}));
