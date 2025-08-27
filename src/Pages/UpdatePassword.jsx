// src/Pages/UpdatePassword.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    // This command updates the logged-in user's password.
    // The user is already logged in at this point from clicking the invite link.
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      // Wait a few seconds before redirecting so they can read the success message.
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        {success ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">Password Set!</h1>
            <p className="text-slate-600 mt-2">
              You are now being redirected to the admin dashboard.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900">Create Your Password</h1>
              <p className="text-slate-500 mt-2">Welcome! Set a password to secure your admin account.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">New Password</label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
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
                  Set Password and Sign In
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}