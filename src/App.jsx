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
import Contact from './Pages/Contact';
import Moments from './Pages/Moments';
import Register from './Pages/Register';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Gallery from './Pages/Gallery';
// --- NEW: Import the success page component ---
import RegistrationSuccess from './Pages/RegistrationSuccess';

// A component for the public-facing layout
const PublicLayout = () => (
  <Layout>
    <Outlet /> {/* Child routes will render here */}
  </Layout>
);

// A placeholder for our Admin routes
const AdminLayout = () => (
    <div className="bg-slate-50 min-h-screen">
        <Outlet />
    </div>
);

const ComingSoon = () => <div className="p-12 text-center text-2xl">Coming Soon!</div>;

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
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<ComingSoon />} />
          <Route path="/volunteers" element={<ComingSoon />} />
          <Route path="/shop" element={<ComingSoon />} />
          <Route path="/tournament-details" element={<ComingSoon />} />
        </Route>

        {/* --- NEW: Add the standalone route for the success page --- */}
        <Route path="/registration-success" element={<RegistrationSuccess />} />

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