// PASTE THIS CODE INTO: src/App.jsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './Pages/Home';
import Tournaments from './Pages/Tournaments';

// We'll add more pages here later
const comingSoon = () => <div className="p-12 text-center text-2xl">Coming Soon!</div>;

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/register" element={comingSoon()} />
          <Route path="/moments" element={comingSoon()} />
          <Route path="/about" element={comingSoon()} />
          <Route path="/sponsors" element={comingSoon()} />
          <Route path="/contact" element={comingSoon()} />
          <Route path="/faq" element={comingSoon()} />
          <Route path="/volunteers" element={comingSoon()} />
          <Route path="/shop" element={comingSoon()} />
          <Route path="/tournament-details" element={comingSoon()} />
        </Routes>
      </Layout>
    </Router>
  );
}