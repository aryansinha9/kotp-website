import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, Trophy, Users, Mail, Phone, HeartPulse, FileText, Send, CheckCircle, AlertCircle, Calendar, MapPin, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
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

  // Form State
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState([
    { id: 1, firstName: "", lastName: "", isCaptain: true, email: "", phone: "", instagram: "" },
    { id: 2, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
    { id: 3, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
    { id: 4, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
    { id: 5, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
    { id: 6, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
    { id: 7, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
  ]);
  const [medicalInfo, setMedicalInfo] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split("T")[0]);

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

  const handlePlayerChange = (id, field, value) => {
    setPlayers(players.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleCaptainChange = (id) => {
    setPlayers(players.map((p) => ({
      ...p,
      isCaptain: p.id === id,
      email: p.id === id ? p.email : "",
      phone: p.id === id ? p.phone : "",
      instagram: p.id === id ? p.instagram : "",
    })));
  };

  const addPlayer = () => {
    if (players.length < 10) {
      setPlayers([...players, { id: Date.now(), firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" }]);
    }
  };

  const removePlayer = (id) => {
    if (players.length > 7) {
      const isRemovingCaptain = players.find(p => p.id === id)?.isCaptain;
      let newPlayers = players.filter(p => p.id !== id);
      
      if (isRemovingCaptain && newPlayers.length > 0) {
        newPlayers[0].isCaptain = true;
      }
      setPlayers(newPlayers);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the terms and conditions to proceed.");
      return;
    }
    
    // Captain validation is handled by HTML5 required attributes conditionally rendered
    
    setSubmitting(true);
    setError('');
    
    const captain = players.find(p => p.isCaptain);
    
    const registrationPayload = {
      tournamentId: tournament.id,
      teamName: teamName,
      contactPerson: `${captain.firstName} ${captain.lastName}`,
      email: captain.email,
      phone: captain.phone,
      players: players,
      medicalInfo: medicalInfo,
      signature: signature,
      signatureDate: signatureDate
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
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"><Crown className="w-10 h-10 text-white" /></div>
          <h1 className="headline-font text-5xl md:text-7xl text-white mb-4 text-glow">CLAIM YOUR CROWN</h1>
          <p className="text-gray-400 text-xl">Registering for: <span className="text-white font-semibold">{tournament.name}</span></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 bg-[#1a1a1a] border border-white/10 rounded-lg p-6 max-w-2xl mx-auto text-left">
            <div className="flex items-center gap-3 text-white">
              <Calendar className="w-5 h-5 text-[#FF6B00]" />
              <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <MapPin className="w-5 h-5 text-[#FF6B00]" />
              <span>{tournament.venue || 'TBA'}</span>
            </div>
            <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/10 mt-2">
                <p className="text-gray-400 text-sm mb-1">Registration Fee</p>
                <p className="headline-font text-3xl text-[#FF6B00]">${tournament.entry_fee}</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
          
          {/* Team Identity */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 space-y-6">
            <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              TEAM IDENTITY
            </h3>
            <div>
              <Label className="text-white mb-2 block">Team Name *</Label>
              <Input
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] text-lg py-6"
                placeholder="Enter your team name"
              />
            </div>
          </div>

          {/* Roster */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
                <Users className="w-6 h-6" />
                TEAM ROSTER ({players.length}/10)
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              You must register between 7 and 10 players. Exactly one player must be designated as the Team Captain. 
              The Captain is required to provide contact information. Division selection is no longer required.
            </p>

            <div className="space-y-6">
              {players.map((player, index) => (
                <div key={player.id} className={`p-4 rounded-lg border \${player.isCaptain ? 'bg-[#FF6B00]/5 border-[#FF6B00]/50' : 'bg-[#0a0a0a] border-white/10'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="headline-font text-lg text-white flex items-center gap-3">
                      PLAYER {index + 1}
                      {player.isCaptain && <span className="bg-[#FF6B00] text-white text-xs px-2 py-1 rounded">CAPTAIN</span>}
                    </h4>
                    <div className="flex items-center gap-4">
                      {!player.isCaptain && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="text-xs text-gray-400 hover:text-[#FF6B00] h-auto py-1"
                          onClick={() => handleCaptainChange(player.id)}
                        >
                          Make Captain
                        </Button>
                      )}
                      {players.length > 7 && (
                        <button type="button" onClick={() => removePlayer(player.id)} className="text-red-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300 text-xs mb-1 block">First Name *</Label>
                      <Input required value={player.firstName} onChange={(e) => handlePlayerChange(player.id, 'firstName', e.target.value)} className="bg-[#1a1a1a] border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs mb-1 block">Last Name *</Label>
                      <Input required value={player.lastName} onChange={(e) => handlePlayerChange(player.id, 'lastName', e.target.value)} className="bg-[#1a1a1a] border-white/10 text-white" />
                    </div>
                  </div>

                  {player.isCaptain && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-[#FF6B00]/20">
                      <div>
                        <Label className="text-[#FF6B00] text-xs mb-1 block">Email *</Label>
                        <Input type="email" required value={player.email} onChange={(e) => handlePlayerChange(player.id, 'email', e.target.value)} className="bg-[#1a1a1a] border-[#FF6B00]/30 text-white" />
                      </div>
                      <div>
                        <Label className="text-[#FF6B00] text-xs mb-1 block">Phone Number *</Label>
                        <Input type="tel" required value={player.phone} onChange={(e) => handlePlayerChange(player.id, 'phone', e.target.value)} className="bg-[#1a1a1a] border-[#FF6B00]/30 text-white" />
                      </div>
                      <div>
                        <Label className="text-[#FF6B00] text-xs mb-1 block">Instagram Handle *</Label>
                        <Input required value={player.instagram} onChange={(e) => handlePlayerChange(player.id, 'instagram', e.target.value)} placeholder="@username" className="bg-[#1a1a1a] border-[#FF6B00]/30 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {players.length < 10 && (
              <Button type="button" onClick={addPlayer} className="w-full bg-transparent border border-dashed border-white/20 text-white hover:bg-white/5 py-8">
                <Plus className="w-5 h-5 mr-2" /> ADD PLAYER ({10 - players.length} remaining)
              </Button>
            )}
          </div>

          {/* Medical */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 space-y-6">
            <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
              <HeartPulse className="w-6 h-6" />
              MEDICAL INFORMATION
            </h3>
            <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm mb-2 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                Please list any medical conditions for any player on your roster. 
              </p>
              <div className="mt-3 pl-6">
                <p className="text-xs text-gray-400 font-mono">Format exactly like this:</p>
                <div className="bg-[#0a0a0a] p-3 rounded mt-1 font-mono text-xs text-gray-300">
                  <span className="text-white">John Doe</span> - Asthma - <span className="text-gray-400">Requires Ventolin inhaler before games.</span>
                </div>
              </div>
            </div>
            <div>
              <Textarea
                value={medicalInfo}
                onChange={(e) => setMedicalInfo(e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white min-h-[120px] focus:border-[#FF6B00] font-mono text-sm"
                placeholder="Enter medical details here. If none, leave blank."
              />
            </div>
          </div>

          {/* Terms */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 space-y-6">
            <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
              <FileText className="w-6 h-6" />
              TERMS &amp; CONDITIONS
            </h3>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 space-y-4">
              <p className="text-gray-400 text-sm">
                By acknowledging and signing below, I am delivering an electronic signature that will have the same
                effect as an original manual paper signature.
              </p>
              <div className="flex items-start gap-3 p-4 bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg">
                <Checkbox
                  required
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked)}
                  id="terms-checkbox"
                  className="mt-1 border-white/20 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                />
                <Label htmlFor="terms-checkbox" className="text-white leading-relaxed font-normal cursor-pointer">
                  I acknowledge that I have read and agree to both the{' '}
                  <Link to="/terms-and-conditions" target="_blank" className="text-[#FF6B00] hover:underline font-semibold">Terms and Conditions</Link>{' '}
                  and the{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-[#FF6B00] hover:underline font-semibold">Privacy Policy</Link>. *
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white mb-2 block">Digital Signature (Full Name) *</Label>
                  <Input
                    required
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00] font-serif italic text-lg tracking-wider px-4"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Signature Date *</Label>
                  <Input
                    type="date"
                    required
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00] dark-calendar"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (<Alert className="bg-red-500/10 border-red-500/30"><AlertCircle className="h-4 w-4 text-red-400" /><AlertDescription className="text-red-400">{error}</AlertDescription></Alert>)}

          <div className="mt-8 pt-8 border-t border-white/10">
             <Button
                type="submit"
                disabled={submitting || !agreed || players.length < 7}
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-8 rounded-lg headline-font text-2xl tracking-wider pulse-glow disabled:opacity-50 transition-all duration-300 h-auto disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> SECURING CHECKOUT...</>
                ) : (
                  <><Send className="w-6 h-6 mr-3" /> PROCEED TO PAYMENT</>
                )}
              </Button>
          </div>
        </form>

        <style>{`
          .dark-calendar::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  );
}
