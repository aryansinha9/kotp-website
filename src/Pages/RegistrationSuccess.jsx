// src/Pages/RegistrationSuccess.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/Components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center bg-slate-50 px-4">
      <div>
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Payment Successful!</h1>
        <p className="text-lg text-slate-600 mb-2">
          Thank you for your payment. Your team's registration is now being processed.
        </p>
        <p className="text-slate-500 mb-8">
          A final confirmation email will be sent to you shortly once the registration is officially recorded in our system.
        </p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}