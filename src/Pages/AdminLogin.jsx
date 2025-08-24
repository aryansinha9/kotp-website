// src/Pages/AdminLogin.jsx

import React, { useState } from 'react';
// --- CHANGED: Imported the 'Link' component ---
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
// --- CHANGED: Imported the 'ArrowLeft' icon ---
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg"> {/* Changed space-y-8 to space-y-6 for better spacing */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500 mt-2">Access the tournament dashboard.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}
          <div>
            <Button type="submit" className="w-full btn-accent font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </div>
        </form>

        {/* --- NEW: "Back to Home" Link --- */}
        <div className="text-center pt-4 border-t border-slate-200">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        {/* --- END OF NEW LINK --- */}

      </div>
    </div>
  );
}