// src/Pages/Register.jsx

// --- THE ONLY FIX: Corrected a typo from 'auseState' to 'useState' in the line below ---
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Tournament } from '@/Entities/all';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox"
import { Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/supabaseClient';

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
      setError('Your registration was cancelled. Feel free to try again.');
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

  const handleInputChange = (e) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id]: value })); };
  const handleSelectChange = (id, value) => { setFormData(prev => ({ ...prev, [id]: value })); };

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
      'create-stripe-checkout',
      { body: registrationPayload }
    );

    if (invokeError) {
      setError(`Could not contact payment server: ${invokeError.message}`);
      setSubmitting(false);
      return;
    }

    if (data.error) {
      setError(`Payment initialization failed: ${data.error}`);
      setSubmitting(false);
      return;
    }
    
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError('An unknown error occurred. Could not retrieve payment URL.');
      setSubmitting(false);
    }
  };

  if (loading) { return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-amber-500" /></div>; }
  
  if (!tournament) { return ( <div className="min-h-screen flex items-center justify-center text-center bg-slate-50 px-4"><div><AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6" /><h1 className="text-4xl font-bold text-slate-800 mb-4">Tournament Not Found</h1><p className="text-lg text-slate-600 mb-8">{error || `We couldn't find the tournament you're looking for.`}</p><Link to="/tournaments"><Button>View All Tournaments</Button></Link></div></div>); }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg-px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-amber-600 font-semibold">Registering for</p>
          <h1 className="text-4xl font-bold text-slate-900 mt-2">{tournament.name}</h1>
          <p className="text-lg text-slate-500 mt-3">
            {format(new Date(tournament.start_date), 'MMM d, yyyy')} • {tournament.venue}
          </p>
          <p className="text-2xl font-bold text-slate-700 mt-4">
            Entry Fee: ${tournament.entry_fee}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="team_name" className="block text-sm font-medium text-slate-700 mb-1">Team Name</label><Input id="team_name" value={formData.team_name} onChange={handleInputChange} required /></div>
                <div><label htmlFor="contact_person" className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label><Input id="contact_person" value={formData.contact_person} onChange={handleInputChange} required /></div>
                <div><label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                <div><label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label><Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} required /></div>
                <div>
                    <label htmlFor="division" className="block text-sm font-medium text-slate-700 mb-1">Division</label>
                    <Select onValueChange={(value) => handleSelectChange('division', value)} required>
                        <SelectTrigger><SelectValue placeholder="Select a division" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Div 1">Division 1</SelectItem>
                            <SelectItem value="Div 2">Division 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms" onCheckedChange={setAgreed} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none text-slate-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the&nbsp;
                <Link to="/terms-and-conditions" target="_blank" className="underline text-amber-600 hover:text-amber-700">
                  Terms & Conditions
                </Link>
                &nbsp;and&nbsp;
                <Link to="/privacy-policy" target="_blank" className="underline text-amber-600 hover:text-amber-700">
                  Privacy Policy
                </Link>.
              </label>
            </div>
            
            {error && (<div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3"><AlertTriangle className="w-5 h-5" /><p>{error}</p></div>)}
            
            <div>
              <Button type="submit" size="lg" className="w-full btn-accent font-semibold text-lg" disabled={submitting || !agreed}>
                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {submitting ? 'Redirecting...' : `Proceed to Payment`}
              </Button>
            </div>
        </form>
      </div>
    </div>
  );
}