import { createHashRouter } from 'react-router-dom';
import SigninPage from './Pages/Signin';
import { SignupPage } from './Pages/Signup';
import Layout from './Layout';
import DashboardPage from './Pages/DashboardPage';
import HomePage from './Pages/HomePage';
import { ConstumerPage } from './Pages/ConstumerPage';
import ProtectedRoute from './ProtectedRoute';
import HallsPage from './Pages/HallsPage';
import MoviesPage from './Pages/MoviesPage';
import CinemaSignup from './Pages/CinemaSignup/CinemaSignup';
import HallOrgPage from './Pages/Organizer/HallOrgPage';
import ConcenssionPage from './Pages/ConcenssionPage';
import CineConstumerPage from './Pages/CinemaConstumer/CineConstumerPage';
import HomeRedirect from './Pages/HomeRedirect';
import EventOrgSignup from './Pages/EventOrgSignup';
import VenuePlan from './Pages/VenuePlan/VenuePlan';
import EventLayout from './Pages/EventLayout/EventLayout';
import EventListingLayout from './Pages/EventListingLayout/EventListingLayout';
import TestPlayer from './components/Home/testPlayer/testPlayer';
import Organizators from './Pages/Organizator';
import OrganizerData from './Pages/OrganizerData';
import EventFoods from './Pages/EventFoods';

export const router = createHashRouter([
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <SigninPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/organizer/signup', element: <CinemaSignup /> },
      { path: '/event_organizer/signup', element: <EventOrgSignup /> },
      {
        element: <Layout />,
        children: [
          { path: 'home', element: <HomeRedirect /> },
          { path: 'event', element: <HomePage /> },
          { path: 'constumers', element: <ConstumerPage /> },
          { path: 'cinema/halls', element: <HallsPage /> },
          { path: 'test/testPlayer', element: <TestPlayer /> },
          { path: 'cinema/movies', element: <MoviesPage /> },
          { path: 'organizer/movie', element: <MoviesPage /> },
          { path: 'organizer/hall', element: <HallOrgPage /> },
          { path: 'organizer/snack', element: <ConcenssionPage /> },
          { path: 'organizer/customers', element: <CineConstumerPage /> },
          { path: 'plan', element: <VenuePlan /> },
          { path: 'event-layout', element: <EventLayout /> },
          { path: 'event-listing', element: <EventListingLayout /> },
          { path: 'history', element: <Organizators /> },
          { path: 'organizer/data', element: <OrganizerData /> },
          { path: 'event/food', element: <EventFoods /> },
        ],
      },
    ],
  },
]);
