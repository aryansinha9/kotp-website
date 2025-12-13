// src/App.jsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './Pages/Home';
import Tournaments from './Pages/Tournaments';
import Sponsors from './Pages/Sponsors';
import About from './Pages/About';
import Academy from './Pages/Academy';
import Contact from './Pages/Contact';
import Moments from './Pages/Moments';
// --- NEW: Import the LiveScores page ---
import LiveScores from './Pages/LiveScores';
import Register from './Pages/Register';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import Gallery from './Pages/Gallery';
import RegistrationSuccess from './Pages/RegistrationSuccess';
import UpdatePassword from './Pages/UpdatePassword';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import TermsAndConditions from './Pages/TermsAndConditions';

const PublicLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

// We need to update the AdminLayout to match the new dark theme
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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Group 1: Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/gallery/:tournamentId" element={<Gallery />} />
          <Route path="/register/:tournamentId" element={<Register />} />
          <Route path="/moments" element={<Moments />} />
          <Route path="/about" element={<About />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

          {/* --- NEW: Add the route for the Live Scores page --- */}
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