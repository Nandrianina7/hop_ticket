import { Button, lighten, styled } from '@mui/material';

export const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
    backgroundColor: lighten(theme.palette.primary.main, 0.1),
  },
  transition: theme.transitions.create(['box-shadow', 'background-color'], {
    duration: theme.transitions.duration.short,
  }),
}));
