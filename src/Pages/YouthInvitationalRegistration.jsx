import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { Users, FileText, Send, Trophy, Calendar, MapPin, Plus, Trash2, HeartPulse, HelpCircle } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { Loader2 } from "lucide-react";

const TOURNAMENT_NAME = "KOTP Youth Invitational";
const MAX_PLAYERS = 10;

const DIVISIONS = [
  {
    value: "U12-14 7 Aside",
    label: "U12-14",
    subtitle: "7 Aside",
    minPlayers: 7,
    color: "#FF6B00",
    description: "Ages 12–14 • 7 players on the field",
  },
  {
    value: "U9-11s 5 Aside",
    label: "U9-11s",
    subtitle: "5 Aside",
    minPlayers: 5,
    color: "#8B5CF6",
    description: "Ages 9–11 • 5 players on the field",
  },
];

export default function YouthInvitationalRegistration() {
  const navigate = useNavigate();
  const [tournamentId, setTournamentId] = useState(null);

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

  const [division, setDivision] = useState("");
  const [teamName, setTeamName] = useState("");

  // Dynamic min players based on division
  const selectedDiv = DIVISIONS.find(d => d.value === division);
  const minPlayers = selectedDiv?.minPlayers || 5;

  const makeDefaultPlayers = (count) => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i + 1,
        firstName: "",
        lastName: "",
        isCaptain: i === 0,
        email: "",
        phone: "",
        instagram: "",
      });
    }
    return arr;
  };

  const [players, setPlayers] = useState(makeDefaultPlayers(5));
  const [medicalInfo, setMedicalInfo] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signature, setSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split("T")[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // When division changes, reset roster to the correct minimum
  const handleDivisionChange = (divValue) => {
    setDivision(divValue);
    const div = DIVISIONS.find(d => d.value === divValue);
    if (div) {
      // If current roster is smaller than new minimum, expand to min
      // If current roster is larger than new minimum, keep as-is
      if (players.length < div.minPlayers) {
        const newPlayers = [...players];
        while (newPlayers.length < div.minPlayers) {
          newPlayers.push({
            id: Date.now() + newPlayers.length,
            firstName: "",
            lastName: "",
            isCaptain: false,
            email: "",
            phone: "",
            instagram: "",
          });
        }
        setPlayers(newPlayers);
      }
    }
  };

  const handlePlayerChange = (id, field, value) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
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
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, { id: Date.now(), firstName: "", lastName: "", isCaptain: false, email: "", phone: "", instagram: "" }]);
    }
  };

  const removePlayer = (id) => {
    if (players.length > minPlayers) {
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
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.functions.invoke('create-tournament-checkout', {
        body: {
          tournamentId,
          teamName,
          division,
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
              Register your team for the KOTP Youth Invitational — $2K cash per division winner!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#0a0a0a] p-6 rounded-lg border border-[#FF6B00]/20">
            <div className="space-y-4">
              <h3 className="headline-font text-2xl text-[#FF6B00] leading-tight">{TOURNAMENT_NAME}</h3>
              <div className="flex items-center gap-3 text-white">
                <Calendar className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
                <span>August 9 &bull; 12:00 PM – 6:00 PM</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <MapPin className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
                <span>Ultimate Soccer</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/20">U12-14 7 Aside</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">U9-11s 5 Aside</span>
              </div>
            </div>
            <div className="flex flex-col justify-center items-start md:items-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-gray-400 mb-2 text-sm uppercase tracking-widest">Registration Fee</p>
              <h2 className="headline-font text-5xl text-[#FF6B00]">$300</h2>
              <p className="text-gray-500 text-xs mt-1">AUD per team</p>
            </div>
            <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-gray-400 mb-2">Cash Prize</p>
              <h2 className="headline-font text-5xl text-white max-w-[200px] text-left md:text-right">
                $2K <span className="text-[#FF6B00]">PER WINNER</span>
              </h2>
            </div>
          </div>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Division Selector */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 space-y-6">
            <h3 className="headline-font text-2xl text-[#FF6B00] flex items-center gap-2">
              <Users className="w-6 h-6" />
              SELECT YOUR DIVISION
            </h3>
            <p className="text-gray-400 text-sm">
              Choose which age group and format your team is entering. This determines the minimum roster size.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DIVISIONS.map((div) => (
                <button
                  key={div.value}
                  type="button"
                  onClick={() => handleDivisionChange(div.value)}
                  className={`relative p-6 rounded-lg border-2 text-left transition-all duration-200 ${
                    division === div.value
                      ? `border-[${div.color}] bg-[${div.color}]/10`
                      : 'border-white/10 bg-[#0a0a0a] hover:border-white/30'
                  }`}
                  style={division === div.value ? { borderColor: div.color, backgroundColor: `${div.color}15` } : {}}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: division === div.value ? div.color : 'rgba(255,255,255,0.3)' }}
                    >
                      {division === div.value && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: div.color }} />
                      )}
                    </div>
                    <div>
                      <span className="headline-font text-2xl text-white">{div.label}</span>
                      <span className="headline-font text-lg ml-2" style={{ color: div.color }}>{div.subtitle}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm pl-8">{div.description}</p>
                  <p className="text-gray-500 text-xs pl-8 mt-1">Min {div.minPlayers} players · Max {MAX_PLAYERS} players</p>
                </button>
              ))}
            </div>
            <input type="text" required value={division} onChange={() => {}} className="sr-only" aria-hidden="true" tabIndex={-1} />
            {!division && (
              <p className="text-amber-500 text-xs mt-2">Please select a division to continue.</p>
            )}
          </div>

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
              You must register between {minPlayers} and {MAX_PLAYERS} players. Exactly one player must be designated as the Team Captain.
              The Captain is required to provide contact information. Instagram handle is optional.
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
                      {players.length > minPlayers && (
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
                        <Label className="text-gray-400 text-xs mb-1 block">Instagram Handle (Optional)</Label>
                        <Input value={player.instagram} onChange={(e) => handlePlayerChange(player.id, 'instagram', e.target.value)} placeholder="@username" className="bg-[#1a1a1a] border-white/10 text-white" />
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
              disabled={isSubmitting || !agreeTerms || !division || players.length < minPlayers || !tournamentId}
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
