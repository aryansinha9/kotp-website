// REPLACE THE ENTIRE CONTENTS OF: src/Pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tournament, Registration } from '@/Entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function Register() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // --- WHAT WE CHANGED ---
  // Removed 'age_group' from the initial form state.
  const [formData, setFormData] = useState({
    team_name: '',
    contact_person: '',
    email: '',
    phone: '',
    division: '', // This will now be controlled by our new dropdown
  });

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const data = await Tournament.getById(tournamentId);
        if (data) { setTournament(data); } 
        else { setError(`Tournament with ID #${tournamentId} could not be found.`); }
      } catch (err) {
        setError('Failed to load tournament details.'); console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId]);

  const handleInputChange = (e) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id]: value })); };
  const handleSelectChange = (id, value) => { setFormData(prev => ({ ...prev, [id]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const registrationData = { ...formData, tournament_id: tournamentId };
    const { data, error } = await Registration.create(registrationData);
    if (error) {
      setError(`Registration failed: ${error.message}`);
      setSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 5000);
    }
  };

  // Loading, Success, and Not Found states are unchanged.
  if (loading) { return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-amber-500" /></div>; }
  if (success) { return ( <div className="min-h-screen flex items-center justify-center text-center bg-slate-50 px-4"><div><CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" /><h1 className="text-4xl font-bold text-slate-800 mb-4">Registration Complete!</h1><p className="text-lg text-slate-600 mb-2">Thank you, {formData.contact_person}, for registering <strong>{formData.team_name}</strong>.</p><p className="text-slate-500 mb-8">A confirmation email has been sent to {formData.email}.</p><Button onClick={() => navigate('/')}>Back to Home</Button></div></div>) }
  if (!tournament) { return ( <div className="min-h-screen flex items-center justify-center text-center bg-slate-50 px-4"><div><AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6" /><h1 className="text-4xl font-bold text-slate-800 mb-4">Tournament Not Found</h1><p className="text-lg text-slate-600 mb-8">{error || `We couldn't find the tournament you're looking for.`}</p><Link to="/tournaments"><Button>View All Tournaments</Button></Link></div></div>); }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg-px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-amber-600 font-semibold">Registering for</p>
          <h1 className="text-4xl font-bold text-slate-900 mt-2">{tournament.name}</h1>
          <p className="text-lg text-slate-500 mt-3">{format(new Date(tournament.start_date), 'MMM d, yyyy')} • {tournament.venue}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="team_name" className="block text-sm font-medium text-slate-700 mb-1">Team Name</label><Input id="team_name" value={formData.team_name} onChange={handleInputChange} required /></div>
                <div><label htmlFor="contact_person" className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label><Input id="contact_person" value={formData.contact_person} onChange={handleInputChange} required /></div>
                <div><label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                <div><label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label><Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} required /></div>
                
                {/* --- WHAT WE CHANGED --- */}
                {/* REMOVED the age_group Select component */}

                {/* CHANGED the Division from a text input to a Select component */}
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
            {error && (<div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3"><AlertTriangle className="w-5 h-5" /><p>{error}</p></div>)}
            <div><Button type="submit" size="lg" className="w-full btn-accent font-semibold text-lg" disabled={submitting}>{submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}{submitting ? 'Submitting...' : 'Complete Registration'}</Button></div>
        </form>
      </div>
    </div>
  );
}