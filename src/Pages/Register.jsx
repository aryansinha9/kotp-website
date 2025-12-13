// src/Pages/Register.jsx (New Redesigned Version with Live Payment Logic - COMPLETE)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, User, Mail, Phone, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Tournament } from '@/Entities/all';
import { supabase } from '@/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    team_name: '',
    contact_person: '',
    email: '',
    phone: '',
    division: '',
  });

  useEffect(() => {
    if (searchParams.get('status') === 'cancelled') {
      setError('Your payment was cancelled. Please try again.');
    }
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const data = await Tournament.getById(tournamentId);
        if (data) {
          setTournament(data);
        } else {
          setError(`Tournament with ID #${tournamentId} could not be found.`);
        }
      } catch (err) {
        setError('Failed to load tournament details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId, searchParams]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the terms and conditions to proceed.");
      return;
    }
    setSubmitting(true);
    setError('');
    const registrationPayload = {
      tournamentId: tournamentId,
      teamName: formData.team_name,
      contactPerson: formData.contact_person,
      email: formData.email,
      phone: formData.phone,
      ageGroup: formData.division,
    };
    const { data, error: invokeError } = await supabase.functions.invoke(
      'create-stripe-checkout', { body: registrationPayload }
    );
    if (invokeError) {
      setError(`Could not contact payment server: ${invokeError.message}`);
      setSubmitting(false); return;
    }
    if (data.error) {
      setError(`Payment initialization failed: ${data.error}`);
      setSubmitting(false); return;
    }
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError('An unknown error occurred. Could not retrieve payment URL.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" /></div>;
  }
  if (!tournament) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-center px-4"><div className="text-white"><AlertCircle className="w-12 h-12 text-[#FF6B00] mx-auto mb-4" /><h1 className="headline-font text-3xl">Tournament Not Found</h1><p className="text-gray-400 mt-2">{error}</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-4xl mx-auto mb-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"><Crown className="w-10 h-10 text-white" /></div>
          <h1 className="headline-font text-5xl md:text-7xl text-white mb-4 text-glow">CLAIM YOUR CROWN</h1>
          <p className="text-gray-400 text-xl">Registering for: <span className="text-white font-semibold">{tournament.name}</span></p>
          <p className="headline-font text-3xl text-[#FF6B00] mt-2">Fee: ${tournament.entry_fee}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-12">
          <div className="space-y-6">
            <div><h2 className="headline-font text-3xl text-white mb-2">REGISTRATION DETAILS</h2><p className="text-gray-400">Enter your team and contact information to proceed to payment.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2"><Users className="w-4 h-4 text-[#FF6B00]" />TEAM NAME *</label>
                <Input value={formData.team_name} onChange={(e) => handleChange("team_name", e.target.value)} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12" placeholder="Your team name" />
              </div>
              <div>
                <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2"><User className="w-4 h-4 text-[#FF6B00]" />CONTACT PERSON *</label>
                <Input value={formData.contact_person} onChange={(e) => handleChange("contact_person", e.target.value)} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-[#FF6B00]" />EMAIL *</label>
                <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-[#FF6B00]" />PHONE *</label>
                <Input type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12" placeholder="Phone number" />
              </div>
              <div>
                <label className="block text-white mb-2 headline-font text-sm flex items-center gap-2"><Users className="w-4 h-4 text-[#FF6B00]" />DIVISION *</label>
                <Select value={formData.division} onValueChange={(value) => handleChange("division", value)} required>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"><SelectValue placeholder="Select your division" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {tournament.age_groups?.map((group) => (<SelectItem key={group} value={group} className="text-white hover:bg-white/5">{group}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-4">
              <Checkbox id="terms" onCheckedChange={setAgreed} className="border-white/20 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]" />
              <label htmlFor="terms" className="text-sm text-gray-400">I have read and agree to the <Link to="/terms-and-conditions" target="_blank" className="underline text-[#FF6B00] hover:text-orange-400">Terms & Conditions</Link> and <Link to="/privacy-policy" target="_blank" className="underline text-[#FF6B00] hover:text-orange-400">Privacy Policy</Link>.</label>
            </div>
            {error && (<Alert className="bg-red-500/10 border-red-500/30"><AlertCircle className="h-4 w-4 text-red-400" /><AlertDescription className="text-red-400">{error}</AlertDescription></Alert>)}
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <Button type="submit" disabled={submitting || !agreed} className="w-full kotp-button bg-[#FF6B00] text-white py-6 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300 disabled:opacity-50">
              {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> REDIRECTING...</> : "PROCEED TO PAYMENT"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
