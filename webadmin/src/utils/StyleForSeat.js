import { Box, Button, Card, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  boxShadow: '0 8px px rgba(0,0,0,0.1)',
}));

export const SeatGridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: '8px',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'auto',
  maxHeight: '500px',
  justifyContent: 'center',
}));

export const SeatButton = styled(Button)(({ theme, seatstatus }) => ({
  minWidth: '40px',
  width: '40px',
  height: '40px',
  padding: 0,
  borderRadius: '6px',
  transition: 'all 0.2s ease-in-out',
  ...(seatstatus === 'disabled' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.main,
      transform: 'scale(1.1)',
    },
  }),
  ...(seatstatus === 'vip' && {
    background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)',
    color: theme.palette.getContrastText('#FFD700'),
    '&:hover': {
      background: 'linear-gradient(45deg, #FFA500 0%, #FF8C00 100%)',
      transform: 'scale(1.1)',
    },
  }),
  ...(seatstatus === 'normal' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'scale(1.1)',
    },
  }),
}));

export const StatCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));
