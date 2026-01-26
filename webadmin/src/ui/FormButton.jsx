import { Button } from '@mui/material';

const FormButton = ({ text, onClick }) => {
  return (
    <Button
      variant="contained"
      fullWidth
      size="large"
      sx={{
        maxWidth: '450px',
        py: 1.5,
        borderRadius: 1,
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      }}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default FormButton;
