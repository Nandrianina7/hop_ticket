import EventLayoutComponent from "../../components/VenueBuilder/EventLayout";

import { Box, Tabs, Tab, Button } from '@mui/material';

const EventLayout = () => {

  return <Box sx={{ backgroundColor: '#030303ff', display: 'flex', flexDirection: 'column', mt: 6, gap: 2 , overflow: "auto"}}> <EventLayoutComponent></EventLayoutComponent> </Box>;
};

export default EventLayout;
