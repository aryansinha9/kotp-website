// src/App.jsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useParams,
} from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './Pages/Home';
import Tournaments from './Pages/Tournaments';
import Sponsors from './Pages/Sponsors';
import About from './Pages/About';
import Academy from './Pages/Academy';
import ParkleaProgram from './Pages/ParkleaProgram';
import HolidayProgram from './Pages/HolidayProgram';
import AIAAfterSchoolProgram from './Pages/AIAAfterSchoolProgram';
import Contact from './Pages/Contact';
import Moments from './Pages/Moments';
import LiveScores from './Pages/LiveScores';
import Register from './Pages/Register';
import TournamentRegistration from './Pages/TournamentRegistration';
import ChampionsVsChallengersRegistration from './Pages/ChampionsVsChallengersRegistration';
import YouthInvitationalRegistration from './Pages/YouthInvitationalRegistration';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import ScrollToTop from './Components/ScrollToTop';
import Gallery from './Pages/Gallery';
import RegistrationSuccess from './Pages/RegistrationSuccess';
import UpdatePassword from './Pages/UpdatePassword';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import TermsAndConditions from './Pages/TermsAndConditions';
import { supabase } from './supabaseClient';

const PublicLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const AdminLayout = () => (
  <div className="bg-[#0a0a0a] min-h-screen">
    <Outlet />
  </div>
);

const ComingSoon = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="text-center">
      <h1 className="headline-font text-5xl text-white">COMING SOON</h1>
    </div>
  </div>
);

// Smart redirect: looks up the tournament name and routes to the correct
// registration page. Falls back to the default tournament registration.
const CHAMPIONS_VS_CHALLENGERS_NAME = 'KOTP and Ultimate Soccer Present: Champions vs Challengers';
const YOUTH_INVITATIONAL_NAME = 'KOTP Youth Invitational';
const WORLD_CUP_NAME = 'KOTP World Cup';

function TournamentRedirect() {
  const { tournamentId } = useParams();
  const [redirectTo, setRedirectTo] = React.useState(null);

  React.useEffect(() => {
    const resolve = async () => {
      try {
        const { data } = await supabase
          .from('tournaments')
          .select('name')
          .eq('id', tournamentId)
          .maybeSingle();

        if (data?.name === CHAMPIONS_VS_CHALLENGERS_NAME) {
          setRedirectTo('/champions-vs-challengers-registration');
        } else if (data?.name === YOUTH_INVITATIONAL_NAME) {
          setRedirectTo('/youth-invitational-registration');
        } else {
          // Default: World Cup or any other tournament uses the original page
          setRedirectTo('/tournament-registration');
        }
      } catch {
        setRedirectTo('/tournament-registration');
      }
    };
    resolve();
  }, [tournamentId]);

  if (!redirectTo) {
    // Show a minimal loading state while the DB lookup resolves
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Navigate to={redirectTo} replace />;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Group 1: Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/gallery/:tournamentId" element={<Gallery />} />

          {/* Smart routing: resolves tournament name and redirects accordingly */}
          <Route path="/register/:tournamentId" element={<TournamentRedirect />} />

          {/* Tournament registration pages */}
          <Route path="/tournament-registration" element={<TournamentRegistration />} />
          <Route path="/champions-vs-challengers-registration" element={<ChampionsVsChallengersRegistration />} />
          <Route path="/youth-invitational-registration" element={<YouthInvitationalRegistration />} />

          <Route path="/moments" element={<Moments />} />
          <Route path="/about" element={<About />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/parklea" element={<ParkleaProgram />} />
          <Route path="/holiday-program" element={<HolidayProgram />} />
          <Route path="/academy/aia-after-school" element={<AIAAfterSchoolProgram />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

          <Route path="/live-scores" element={<LiveScores />} />

          <Route path="/faq" element={<ComingSoon />} />
          <Route path="/volunteers" element={<ComingSoon />} />
          <Route path="/shop" element={<ComingSoon />} />
        </Route>

        {/* Standalone routes */}
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Group 2: Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}