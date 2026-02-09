import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PartnerBanner from "@/Components/PartnerBanner";
import ShinyText from "@/Components/ShinyText";
import UnderConstructionBanner from "@/Components/UnderConstructionBanner";
import ShapeBlur from "@/Components/ShapeBlur";

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navItems = [
    { name: "HOME", path: "/" },
    { name: "TOURNAMENTS", path: "/tournaments" },
    { name: "ACADEMY", path: "/academy" },
    { name: "LIVE SCORES", path: "/live-scores" },
    { name: "MOMENTS", path: "/moments" },
    { name: "ABOUT", path: "/about" },
    { name: "SPONSORS", path: "/sponsors" },
    { name: "CONTACT", path: "/contact" },
  ];

  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');
        :root { --kotp-orange: #FF6B00; --kotp-dark: #0a0a0a; --kotp-charcoal: #1a1a1a; --kotp-grey: #2a2a2a; }
        body { font-family: 'Inter', sans-serif; background: var(--kotp-dark); overflow-x: hidden; }
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
        .animate-scroll { animation: scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite; }
        @keyframes scroll { to { transform: translate(calc(-50% - 0.5rem)); } }
        /* LogoLoop Styles */
        .logoloop { position: relative; --logoloop-gap: 32px; --logoloop-logoHeight: 28px; --logoloop-fadeColorAuto: #0a0a0a; }
        .logoloop__track { display: flex; width: max-content; will-change: transform; user-select: none; position: relative; z-index: 0; }
        .logoloop__list { display: flex; align-items: center; }
        .logoloop__item { flex: 0 0 auto; margin-right: var(--logoloop-gap); font-size: var(--logoloop-logoHeight); line-height: 1; }
        .logoloop__item:last-child { margin-right: var(--logoloop-gap); }
        .logoloop__node { display: inline-flex; align-items: center; }
        .logoloop__item img { height: var(--logoloop-logoHeight); width: auto; display: block; object-fit: contain; image-rendering: -webkit-optimize-contrast; -webkit-user-drag: none; pointer-events: none; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .logoloop--fade::before, .logoloop--fade::after { content: ''; position: absolute; top: 0; bottom: 0; width: clamp(24px, 8%, 120px); pointer-events: none; z-index: 10; }
        .logoloop--fade::before { left: 0; background: linear-gradient(to right, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0, 0, 0, 0) 100%); }
        .logoloop--fade::after { right: 0; background: linear-gradient(to left, var(--logoloop-fadeColor, var(--logoloop-fadeColorAuto)) 0%, rgba(0, 0, 0, 0) 100%); }
      `}</style>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#FF6B00] origin-left z-[60]"
        style={{ scaleX: window.scrollY / (document.body.scrollHeight - window.innerHeight) }}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3 group relative z-50">
              <img src="/kotp_new_logo.png" alt="King of the Pitch" className="h-16 w-auto transform group-hover:scale-110 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="headline-font text-xl text-white leading-none">KING OF THE PITCH</span>
                <span className="text-xs text-gray-400 tracking-wider">WESTERN SYDNEY</span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors group relative z-50"
              aria-label="Open Menu"
            >
              <div className="flex flex-col gap-1.5 items-end">
                <span className="w-8 h-0.5 bg-white group-hover:bg-[#FF6B00] transition-colors"></span>
                <span className="w-6 h-0.5 bg-white group-hover:bg-[#FF6B00] transition-colors"></span>
                <span className="w-4 h-0.5 bg-white group-hover:bg-[#FF6B00] transition-colors"></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0a0a0a] border-l border-white/10 z-[60] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <span className="headline-font text-xl text-white tracking-wider">MENU</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                >
                  <X className="w-8 h-8 text-white group-hover:text-[#FF6B00] transition-colors" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center justify-between py-2 border-b border-white/5 hover:border-[#FF6B00]/30 transition-colors ${location.pathname === item.path ? "text-[#FF6B00]" : "text-white hover:text-[#FF6B00]"}`}
                  >
                    <span className="headline-font text-2xl tracking-wide">
                      {item.name === "ACADEMY" ? <ShinyText text={item.name} /> : item.name}
                    </span>
                    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${location.pathname === item.path ? "text-[#FF6B00] translate-x-1" : "text-gray-600 group-hover:text-[#FF6B00] group-hover:translate-x-1"}`} />
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t border-white/10 bg-[#111]">
                <Link to="/register" className="block">
                  <button className="w-full kotp-button bg-[#FF6B00] text-white py-4 rounded-md headline-font text-xl tracking-wider glow-orange-hover">
                    REGISTER NOW
                  </button>
                </Link>
                <div className="mt-6 flex justify-center gap-6">
                  <a href="#" className="text-gray-400 hover:text-[#FF6B00] transition-colors text-sm">INSTAGRAM</a>
                  <a href="#" className="text-gray-400 hover:text-[#FF6B00] transition-colors text-sm">FACEBOOK</a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="relative">{children}</main>
      <PartnerBanner />
      <UnderConstructionBanner />

      <footer className="bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/kotp_new_logo.png" alt="King of the Pitch" className="h-20 w-auto" />
              </div>
              <p className="text-gray-400 text-sm mb-4">Western Sydney's premier street football experience. Building legends from the streets.</p>
              <div className="text-[#FF6B00] headline-font text-lg">RULE THE PITCH.</div>
            </div>
            <div>
              <h3 className="headline-font text-white text-lg mb-4">QUICK LINKS</h3>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link key={item.name} to={item.path} className="block text-gray-400 text-sm hover:text-[#FF6B00] transition-colors">{item.name}</Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="headline-font text-white text-lg mb-4">CONNECT</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>Western Sydney, NSW</p>
                <p>info@kingofthepitch.com.au</p>
                <div className="flex gap-4 mt-4">
                  <a href="#" className="hover:text-[#FF6B00] transition-colors">Instagram</a>
                  <a href="#" className="hover:text-[#FF6B00] transition-colors">Facebook</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm text-center md:text-left">&copy; 2025 King of the Pitch. All rights reserved.</p>

              <a
                href="https://anantasystems.com.au/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block w-20 h-20 opacity-50 hover:opacity-80 transition-opacity"
              >
                <ShapeBlur
                  variation={0}
                  pixelRatioProp={2}
                  shapeSize={1.2}
                  roundness={0.4}
                  borderSize={0.15}
                  circleSize={0.2}
                  circleEdge={0.5}
                />
              </a>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
                <Link to="/privacy-policy" className="text-gray-500 hover:text-[#FF6B00] transition-colors">Privacy Policy</Link>
                <Link to="/terms-and-conditions" className="text-gray-500 hover:text-[#FF6B00] transition-colors">Terms & Conditions</Link>
                <Link to="/admin" className="text-gray-500 hover:text-[#FF6B00] transition-colors flex items-center gap-1"><span>Admin</span></Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}