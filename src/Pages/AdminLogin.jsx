// src/Pages/AdminLogin.jsx (New Redesigned Version with Live Auth)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '@/supabaseClient'; // <-- IMPORT our Supabase client
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, Shield } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Alert, AlertDescription } from "@/Components/ui/alert";

export default function AdminLogin() {
  const navigate = useNavigate(); // <-- Use the standard navigate hook
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // --- TRANSPLANTED: The working Supabase login handler ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/admin/dashboard'); // Redirect to dashboard on success
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-24">
      <div className="absolute inset-0 opacity-5">
        <div className="headline-font text-[20rem] text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
          KOTP
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-10 shadow-2xl shadow-black/20">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg glow-orange">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="headline-font text-4xl text-white mb-2">
              ADMIN ACCESS
            </h1>
            <p className="text-gray-400">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-[#FF6B00]" />EMAIL</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12 transition-all duration-300" placeholder="admin@kingofthepitch.com.au" />
            </div>

            <div>
              <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-[#FF6B00]" />PASSWORD</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12 transition-all duration-300" placeholder="Enter your password" />
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full kotp-button bg-[#FF6B00] text-white py-6 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100">
              {loading ? ( <><Loader2 className="w-5 h-5 mr-2 animate-spin" />AUTHENTICATING...</> ) : ( <><Shield className="w-5 h-5 mr-2" />SIGN IN</> )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            {/* --- FIXED: Replaced createPageUrl with a standard Link 'to' path --- */}
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FF6B00] transition-colors duration-300 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="headline-font text-sm tracking-wider">BACK TO HOME</span>
            </Link>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-6 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2"><Lock className="w-4 h-4" />Secure admin portal - Authorized access only</p>
        </motion.div>
      </motion.div>
    </div>
  );
}