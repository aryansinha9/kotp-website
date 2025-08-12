// REPLACE THE CONTENTS OF: src/Layout.js

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Trophy, UserPlus, Camera, Info, Handshake, Mail, HelpCircle, Users, ShoppingCart, Menu, X, Facebook, Instagram, Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Note: I've simplified the navigationItems to use direct paths instead of createPageUrl
const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Tournaments", url: "/tournaments", icon: Trophy },
  { title: "Moments", url: "/moments", icon: Camera },
  { title: "About", url: "/about", icon: Info },
  { title: "Sponsors", url: "/sponsors", icon: Handshake },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // This is the original style code from Base44, unchanged.
  const style = `
    :root { --primary: 26 26 26; --secondary: 229 161 52; --accent: 229 161 52; --muted: 248 250 252; }
    .hero-gradient { background: linear-gradient(135deg, rgb(34, 34, 34) 0%, rgb(15, 15, 15) 100%); }
    .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
    .btn-accent { background-color: rgb(var(--accent)); color: rgb(var(--primary)); }
    .btn-accent:hover { background-color: rgb(229 161 52 / 0.9); }
    .text-accent { color: rgb(var(--accent)); }
  `

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100">
      <style>{style}</style>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3710b9f79_Screenshot2025-08-09at72020pm.png" alt="KOTP Logo" className="w-14 h-14" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900">King of the Pitch</h1>
                <p className="text-xs text-slate-500">Premier Tournaments</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    location.pathname === item.url
                      ? "bg-amber-50 text-amber-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Link>
              ))}
            </div>

            {/* CTA Button & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Link to="/tournaments" className="hidden sm:block">
                <Button className="btn-accent font-semibold px-6 shadow-md hover:shadow-lg transition-all">Register Now</Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.concat([
                  { title: "Contact", url: "/contact", icon: Mail },
                  { title: "FAQ", url: "/faq", icon: HelpCircle },
                  { title: "Volunteers", url: "/volunteers", icon: Users },
                  { title: "Shop", url: "/shop", icon: ShoppingCart },
              ]).map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === item.url
                      ? "bg-amber-50 text-amber-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              ))}
              <div className="pt-4">
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full btn-accent font-semibold text-lg py-3">Register Now</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Brand */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-3 mb-4">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3710b9f79_Screenshot2025-08-09at72020pm.png" alt="KOTP Logo" className="w-14 h-14 bg-white rounded-full" />
          <div>
            <h3 className="text-lg font-bold">King of the Pitch</h3>
            <p className="text-sm text-slate-400">Premier Tournaments</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-6">The ultimate stage for youth football. Compete with the best, showcase your talent.</p>
        
        {/* Social Links -- CHANGED */}
        <div className="flex gap-3">
          <a href="mailto:kotp.football@gmail.com" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Email">
            <Mail className="w-5 h-5" />
          </a>
          <a href="https://www.facebook.com/kotp.football/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Facebook">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com/kotp.football/?hl=en" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Instagram">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://www.youtube.com/@kotp.football" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="YouTube">
            <Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Quick Links -- VERIFIED */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
        <div className="space-y-2">
          <Link to="/tournaments" className="block text-slate-400 hover:text-white transition-colors">Register Now</Link>
          <Link to="/tournaments" className="block text-slate-400 hover:text-white transition-colors">Upcoming Tournaments</Link>
          <Link to="/faq" className="block text-slate-400 hover:text-white transition-colors">FAQ & Rules</Link>
          <Link to="/contact" className="block text-slate-400 hover:text-white transition-colors">Contact Us</Link>
        </div>
      </div>

      {/* Information -- VERIFIED */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Information</h4>
        <div className="space-y-2">
          <Link to="/about" className="block text-slate-400 hover:text-white transition-colors">About Us</Link>
          <Link to="/sponsors" className="block text-slate-400 hover:text-white transition-colors">Become a Sponsor</Link>
          <Link to="/volunteers" className="block text-slate-400 hover:text-white transition-colors">Volunteer with Us</Link>
          <Link to="/shop" className="block text-slate-400 hover:text-white transition-colors">Official Merchandise</Link>
        </div>
      </div>

      {/* Contact Info -- CHANGED */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
        <div className="space-y-3 text-slate-400">
          <div>
            <p className="font-medium text-white">Email</p>
            <a href="mailto:kotp.football@gmail.com" className="hover:text-white transition-colors">kotp.football@gmail.com</a>
          </div>
          <div>
            <p className="font-medium text-white">Phone</p>
            <a href="tel:+61298765432" className="hover:text-white transition-colors">+61 2 9876 5432</a>
          </div>
          <div>
            <p className="font-medium text-white">Main Venue</p>
            <p>Wanderers Fives</p>
            <p>Football Dr, Rooty Hill NSW 2766</p>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
  <p className="text-slate-400 text-sm">
    © 2024 King of the Pitch Tournament Series. All rights reserved.
  </p>
  <div className="flex gap-4 items-center mt-4 md:mt-0"> {/* Adjusted gap for better spacing */}
    <Link to="#" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
    <span className="text-slate-600">|</span> {/* Separator */}
    <Link to="#" className="text-slate-400 hover:text-white text-sm transition-colors">Terms & Conditions</Link>
    <span className="text-slate-600">|</span> {/* Separator */}
    {/* NEW LINK ADDED HERE */}
    <Link to="/admin" className="text-slate-400 hover:text-white text-sm transition-colors">Admin Login</Link>
  </div>
</div>
  </div>
</footer>

      {/* Floating Register Button (Mobile) */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <Link to="/register">
          <Button className="w-16 h-16 rounded-full btn-accent shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <UserPlus className="w-7 h-7" />
          </Button>
        </Link>
      </div>
    </div>
  );
}