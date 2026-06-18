import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Users, FileText, Send, Trophy, Calendar, MapPin, Plus, Trash2, HeartPulse, HelpCircle, Shield, Sword } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { Loader2 } from "lucide-react";

const TOURNAMENT_NAME = "KOTP and Ultimate Soccer Present: Champions vs Challengers";
const MIN_PLAYERS = 5;
const MAX_PLAYERS = 10;

export default function ChampionsVsChallengersRegistration() {
  const navigate = useNavigate();
  const [tournamentId, setTournamentId] = useState(null);

  // Fetch the real tournament ID from Supabase dynamically
  React.useEffect(() => {
    const fetchTournamentId = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id')
        .eq('name', TOURNAMENT_NAME)
        .limit(1)
        .maybeSingle();

      if (data && data.id) {
        setTournamentId(data.id);
      }
    };
    fetchTournamentId();
  }, []);

  const makeDefaultPlayers = () => [
    { id: 1, firstName: "", lastName: "", isCaptain: true, email: "", phone: "", instagram: "" },
    { id: 2, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
    { id: 3, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
    { id: 4, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
    { id: 5, firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" },
  ];

  const [teamName, setTeamName] = useState("");
  const [teamType, setTeamType] = useState(""); // 'Champion' | 'Challenger'
  const [players, setPlayers] = useState(makeDefaultPlayers());
  const [medicalInfo, setMedicalInfo] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signature, setSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split("T")[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      // Clear contact info from former captain so it doesn't stay hidden in state
      email: p.id === id ? p.email : "",
      phone: p.id === id ? p.phone : "",
      instagram: p.id === id ? p.instagram : "",
    })));
  };

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, { id: Date.now(), firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" }]);
    }
  };

  const removePlayer = (id) => {
    if (players.length > MIN_PLAYERS) {
      const isRemovingCaptain = players.find(p => p.id === id)?.isCaptain;
      let newPlayers = players.filter(p => p.id !== id);

      // If we removed the captain, automatically make the first remaining player captain
      if (isRemovingCaptain && newPlayers.length > 0) {
        newPlayers[0].isCaptain = true;
      }
      setPlayers(newPlayers);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.functions.invoke('create-tournament-checkout', {
        body: {
          tournamentId: tournamentId,
          teamName,
          teamType,
          players,
          medicalInfo,
          agreeTerms,
          signature,
          signatureDate
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Failed to generate checkout session.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header & Tournament Details */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Trophy className="w-64 h-64 text-[#FF6B00]" />
          </div>
          <div className="relative z-10 text-center mb-8">
            <h1 className="headline-font text-5xl md:text-7xl text-white mb-4 text-glow">
              TEAM REGISTRATION
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-8">
              Register your team for the most prestigious football event of the year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#0a0a0a] p-6 rounded-lg border border-[#FF6B00]/20">
            <div className="space-y-4">
              <h3 className="headline-font text-2xl text-[#FF6B00] leading-tight">{TOURNAMENT_NAME}</h3>
              <div className="flex items-center gap-3 text-white">
                <Calendar className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
                <span>July 26 &bull; 12:00 PM – 6:00 PM</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <MapPin className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
                <span>Ultimate Soccer</span>
              </div>
            </div>
            <div className="flex flex-col justify-center items-start md:items-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-gray-400 mb-2 text-sm uppercase tracking-widest">Registration Fee</p>
              <h2 className="headline-font text-5xl text-[#FF6B00]">$300</h2>
              <p className="text-gray-500 text-xs mt-1">AUD per team</p>
            </div>
            <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-gray-400 mb-2">Grand Prize</p>
              <h2 className="headline-font text-5xl text-white max-w-[200px] text-left md:text-right">
                $2,000 <span className="text-[#FF6B00]">CASH</span>
              </h2>
            </div>
          </div>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Team Name */}
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

            {/* Champion / Challenger selector */}
            <div>
              <Label className="text-white mb-3 block">Team Type *</Label>
              <p className="text-gray-400 text-sm mb-4">
                Are you entering as a <span className="text-[#FF6B00] font-semibold">Champion</span> (previous KOTP winner / top-tier team) or a <span className="text-blue-400 font-semibold">Challenger</span> (new or rising team)?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Champion option */}
                <button
                  type="button"
                  onClick={() => setTeamType('Champion')}
                  className={`relative p-5 rounded-lg border-2 text-left transition-all duration-200 ${
                    teamType === 'Champion'
                      ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                      : 'border-white/10 bg-[#0a0a0a] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      teamType === 'Champion' ? 'border-[#FF6B00]' : 'border-white/30'
                    }`}>
                      {teamType === 'Champion' && <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
                    </div>
                    <span className="headline-font text-xl text-[#FF6B00]">Champion</span>
                    <Trophy className="w-5 h-5 text-[#FF6B00] ml-auto" />
                  </div>
                  <p className="text-gray-400 text-xs pl-7">Previous KOTP winner or elite-level team</p>
                </button>

                {/* Challenger option */}
                <button
                  type="button"
                  onClick={() => setTeamType('Challenger')}
                  className={`relative p-5 rounded-lg border-2 text-left transition-all duration-200 ${
                    teamType === 'Challenger'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-[#0a0a0a] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      teamType === 'Challenger' ? 'border-blue-500' : 'border-white/30'
                    }`}>
                      {teamType === 'Challenger' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <span className="headline-font text-xl text-blue-400">Challenger</span>
                    <Users className="w-5 h-5 text-blue-400 ml-auto" />
                  </div>
                  <p className="text-gray-400 text-xs pl-7">New or rising team looking to make their mark</p>
                </button>
              </div>
              {/* Hidden required input to trigger HTML5 validation */}
              <input
                type="text"
                required
                value={teamType}
                onChange={() => {}}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
              />
              {!teamType && (
                <p className="text-amber-500 text-xs mt-2">Please select Champion or Challenger to continue.</p>
              )}
            </div>
          </div>

          {/* Players Roster */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
                <Users className="w-6 h-6" />
                TEAM ROSTER ({players.length}/{MAX_PLAYERS})
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              You must register between {MIN_PLAYERS} and {MAX_PLAYERS} players. Exactly one player must be designated as the Team Captain.
              The Captain is required to provide contact information.
            </p>

            <div className="space-y-6">
              {players.map((player, index) => (
                <div key={player.id} className={`p-4 rounded-lg border ${player.isCaptain ? 'bg-[#FF6B00]/5 border-[#FF6B00]/50' : 'bg-[#0a0a0a] border-white/10'}`}>
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
                      {players.length > MIN_PLAYERS && (
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

            {players.length < MAX_PLAYERS && (
              <Button type="button" onClick={addPlayer} className="w-full bg-transparent border border-dashed border-white/20 text-white hover:bg-white/5 py-8">
                <Plus className="w-5 h-5 mr-2" /> ADD PLAYER ({MAX_PLAYERS - players.length} remaining)
              </Button>
            )}
          </div>

          {/* Medical Information */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 space-y-6">
            <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
              <HeartPulse className="w-6 h-6" />
              MEDICAL INFORMATION
            </h3>
            <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm mb-2 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                Please list any medical conditions (allergies, asthma, past injuries, etc.) for any player on your roster.
              </p>
              <div className="mt-3 pl-6">
                <p className="text-xs text-gray-400 font-mono">Format exactly like this:</p>
                <div className="bg-[#0a0a0a] p-3 rounded mt-1 font-mono text-xs text-gray-300">
                  <span className="text-white">John Doe</span> - Asthma - <span className="text-gray-400">Requires Ventolin inhaler before games.</span><br/>
                  <span className="text-white">Alex Smith</span> - Peanut Allergy - <span className="text-gray-400">Carries EpiPen.</span>
                </div>
              </div>
            </div>
            <div>
              <Textarea
                value={medicalInfo}
                onChange={(e) => setMedicalInfo(e.target.value)}
                className="bg-[#0a0a0a] border-white/10 text-white min-h-[120px] focus:border-[#FF6B00] font-mono text-sm"
                placeholder="Enter medical details here. If no players have medical conditions, leave this blank or type 'None'."
              />
            </div>
          </div>

          {/* Terms & Signature */}
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
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked)}
                  id="terms-checkbox"
                  className="mt-1"
                />
                <Label htmlFor="terms-checkbox" className="text-white leading-relaxed font-normal cursor-pointer">
                  I acknowledge that I have read and agree to both the{' '}
                  <Link to="/terms-and-conditions" target="_blank" className="text-[#FF6B00] hover:underline font-semibold">Terms and Conditions</Link>{' '}
                  and the{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-[#FF6B00] hover:underline font-semibold">Privacy Policy</Link>,
                  including the liability waiver and medical consent. By signing on behalf of my team, I confirm I am authorized to do so. *
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white mb-2 block">Digital Signature (Type Full Name) *</Label>
                  <Input
                    required
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00] font-serif italic text-lg tracking-wider px-4"
                    placeholder="Type team captain's full name"
                  />
                  <p className="text-gray-500 text-xs mt-1">Type your full name as your electronic signature</p>
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

          {/* Submit */}
          <div className="pt-8">
            <div className="bg-[#1a1a1a] border border-[#FF6B00]/30 rounded-lg p-6 mb-6 flex justify-between items-center">
              <span className="headline-font text-2xl text-white">TOTAL REGISTRATION FEE:</span>
              <span className="headline-font text-4xl text-[#FF6B00]">$300</span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !agreeTerms || players.length < MIN_PLAYERS || !tournamentId || !teamType}
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-8 rounded-lg headline-font text-2xl tracking-wider pulse-glow disabled:opacity-50 transition-all duration-300 h-auto disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> SECURING CHECKOUT...</>
              ) : (
                <><Send className="w-6 h-6 mr-3" /> PROCEED TO PAYMENT</>
              )}
            </Button>
            {!tournamentId && (
              <p className="text-red-500 text-center mt-4 bg-red-500/10 py-3 px-4 rounded border border-red-500/20">
                Error: This tournament has not been properly set up in the database yet. Registrations are halted until the SQL setup script is run.
              </p>
            )}
            {errorMsg && (
              <p className="text-red-500 text-center mt-4 bg-red-500/10 py-3 px-4 rounded border border-red-500/20">
                {errorMsg}
              </p>
            )}
            <p className="text-center text-gray-500 text-sm mt-6">
              Registration is not complete until payment is finalised.
            </p>
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
