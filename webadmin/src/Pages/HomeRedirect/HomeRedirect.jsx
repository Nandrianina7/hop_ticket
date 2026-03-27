import { getCookie } from '../../utils/getCookie';
import CineOrgDashboard from '../CineOrgDashboard';
import DashboardPage from '../DashboardPage';

const HomeRedirect = () => {
  const user_role = getCookie('user_role');

  if (user_role === 'event_organizer') {
    return <DashboardPage />;
  } else if (user_role === 'organizer') {
    return <CineOrgDashboard />;
  } else if (user_role === 'admin') {
    return (
      <>
        <CineOrgDashboard />
        <DashboardPage />
      </>
    );
  }
};

export default HomeRedirect;
