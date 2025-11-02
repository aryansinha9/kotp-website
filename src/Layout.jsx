// src/Layout.jsx (New Redesigned Version - COMPLETE)

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: "HOME", path: "/" },
    { name: "TOURNAMENTS", path: "/tournaments" },
    { name: "MOMENTS", path: "/moments" },
    { name: "ABOUT", path: "/about" },
    { name: "SPONSORS", path: "/sponsors" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');
        :root { --kotp-orange: #FF6B00; --kotp-dark: #0a0a0a; --kotp-charcoal: #1a1a1a; --kotp-grey: #2a2a2a; }
        body { font-family: 'Inter', sans-serif; background: var(--kotp-dark); color: #E5E7EB; overflow-x: hidden; }
        .headline-font { font-family: 'Bebas Neue', cursive; letter-spacing: 0.05em; }
        .glow-orange { box-shadow: 0 0 20px rgba(255, 107, 0, 0.4); }
        .glow-orange-hover:hover { box-shadow: 0 0 30px rgba(255, 107, 0, 0.6); }
        .text-glow { text-shadow: 0 0 20px rgba(255, 107, 0, 0.5); }
        .kotp-button { position: relative; overflow: hidden; transition: all 0.3s ease; }
        .kotp-button::before { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.1); transform: translate(-50%, -50%); transition: width 0.6s, height 0.6s; }
        .kotp-button:hover::before { width: 300px; height: 300px; }
        .parallax-bg { background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 0, 0.4); } 50% { box-shadow: 0 0 40px rgba(255, 107, 0, 0.8); } }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${ scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg shadow-black/20" : "bg-transparent" }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="headline-font text-2xl text-white leading-none">KING OF THE PITCH</div>
                <div className="text-xs text-gray-400 tracking-wider">WESTERN SYDNEY</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} className={`headline-font text-sm tracking-wider transition-all duration-300 relative group ${ location.pathname === item.path ? "text-[#FF6B00]" : "text-white hover:text-[#FF6B00]" }`}>
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#FF6B00] transition-all duration-300 ${ location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full' }`}></span>
                </Link>
              ))}
              <Link to="/tournaments">
                <button className="kotp-button bg-[#FF6B00] text-white px-6 py-2 rounded-md headline-font text-sm tracking-wider glow-orange-hover transition-all duration-300">REGISTER NOW</button>
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-[#1a1a1a] border-t border-white/10">
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link key={item.name} to={item.path} className={`block headline-font text-lg tracking-wider py-2 transition-colors ${ location.pathname === item.path ? "text-[#FF6B00]" : "text-white hover:text-[#FF6B00]" }`}>
                    {item.name}
                  </Link>
                ))}
                <Link to="/tournaments" className="block">
                  <button className="w-full kotp-button bg-[#FF6B00] text-white px-6 py-3 rounded-md headline-font text-sm tracking-wider glow-orange">REGISTER NOW</button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="relative">{children}</main>

      <footer className="bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-lg flex items-center justify-center"><Crown className="w-6 h-6 text-white" /></div>
                <div className="headline-font text-xl text-white">KING OF THE PITCH</div>
              </div>
              <p className="text-gray-400 text-sm mb-4">Western Sydney's premier street football experience. Building legends from the streets.</p>
              <div className="text-[#FF6B00] headline-font text-lg">RULE THE PITCH.</div>
            </div>
            
            <div>
              <h3 className="headline-font text-white text-lg mb-4">QUICK LINKS</h3>
              <div className="space-y-2">
                {navItems.map((item) => ( <Link key={item.name} to={item.path} className="block text-gray-400 text-sm hover:text-[#FF6B00] transition-colors">{item.name}</Link> ))}
              </div>
            </div>
            
            <div>
              <h3 className="headline-font text-white text-lg mb-4">LEGAL & INFO</h3>
              <div className="space-y-2">
                <Link to="/privacy-policy" className="block text-gray-400 text-sm hover:text-[#FF6B00] transition-colors">PRIVACY POLICY</Link>
                <Link to="/terms-and-conditions" className="block text-gray-400 text-sm hover:text-[#FF6B00] transition-colors">TERMS & CONDITIONS</Link>
                <Link to="/contact" className="block text-gray-400 text-sm hover:text-[#FF6B00] transition-colors">CONTACT US</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 King of the Pitch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}