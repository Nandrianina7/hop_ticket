import { useSearchParams } from 'react-router-dom';
import Movie from '../../components/Home/OrgData/Movie';
import { Box, Divider, Typography, Container } from '@mui/material';
import Event from '../../components/Home/OrgData/Event';
import Salle from '../../components/Home/OrgData/Salle';
import PlanView from '../../components/Home/OrgData/PlanView';

const OrganizerData = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const xme = searchParams.get('xme');
  const orgId = searchParams.get('organizerId');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Organisateur {type}: {xme}
      </Typography>

      {type === 'cinema' ? (
        <Box>
          <Movie org_id={orgId} />
          <Divider sx={{ my: 4 }} />
          <Salle org_id={orgId} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Événements
            </Typography>
            <Event org_id={orgId} />
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Plans de salle
            </Typography>
            <PlanView org_id={orgId} />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default OrganizerData;
