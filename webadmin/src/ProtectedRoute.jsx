import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = document.cookie.includes('refresh_token');
  const location = useLocation();

  if (
    isAuthenticated &&
    (location.pathname === '/' ||
      location.pathname === '/signup' ||
      location.pathname === '/organizer/signup' ||
      location.pathname === '/event_organizer/signup')
  ) {
    return <Navigate to="/home" replace />;
  }
  if (
    !isAuthenticated &&
    location.pathname !== '/' &&
    location.pathname !== '/signup' &&
    location.pathname !== '/organizer/signup' &&
    location.pathname !== '/event_organizer/signup'
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
