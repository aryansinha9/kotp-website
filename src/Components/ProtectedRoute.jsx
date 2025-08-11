// PASTE THIS CODE INTO: src/components/ProtectedRoute.jsx

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setLoading(false);
    }
    getSession();

    // Listen for changes in auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!session) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/admin" replace />;
  }

  // If user is logged in, show the protected content (the children)
  return children;
}