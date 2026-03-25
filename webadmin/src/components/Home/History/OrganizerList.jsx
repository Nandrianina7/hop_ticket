import { Stack, Typography } from '@mui/material';
import OrganizerCard from './OrganizerCard';

const OrganizerList = ({ organizators, expandedOrg, handleExpandClick }) => {
  if (organizators.length === 0) {
    return <Typography color="text.secondary">No organizers found.</Typography>;
  }

  return (
    <Stack spacing={2}>
      {organizators.map((org) => (
        <OrganizerCard
          key={org.id}
          org={org}
          expandedOrg={expandedOrg}
          handleExpandClick={handleExpandClick}
        />
      ))}
    </Stack>
  );
};

export default OrganizerList;
