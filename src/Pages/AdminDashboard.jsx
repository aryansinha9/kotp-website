// src/Pages/AdminDashboard.jsx (FINAL - Redesigned with Live Score Panel)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Registration, FeaturedReel, Tournament, MediaItem, Team, Game } from '@/Entities/all';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, LogOut, Users, Upload, Film, Mail, Phone, Trash2, Loader2, Image as ImageIcon, Video, Trophy, Plus, Minus } from "lucide-react";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";

// --- Helper Components ---
const Section = ({ icon: Icon, title, count, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-4">
          <div className="bg-[#FF6B00]/10 rounded-lg p-3"><Icon className="w-6 h-6 text-[#FF6B00]" /></div>
          <div className="text-left"><h2 className="headline-font text-2xl text-white">{title} {count !== undefined && `(${count})`}</h2></div>
        </div>
        {isOpen ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="p-6 border-t border-white/10">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
const StyledTable = ({ headers, children }) => ( <div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-300"><thead className="bg-[#0a0a0a] uppercase text-xs text-gray-400 headline-font tracking-wider"><tr>{headers.map(h => <th key={h} scope="col" className="px-6 py-3 whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div> );
const StyledTableRow = ({ children }) => <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">{children}</tr>;
const StyledTableCell = ({ children, className = '' }) => <td className={`px-6 py-4 whitespace-nowrap ${className}`}>{children}</td>;
const StyledButton = ({ children, disabled, ...props }) => <button {...props} disabled={disabled} className={`w-full kotp-button bg-[#FF6B00] text-white py-4 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center ${props.className}`}>{children}</button>;
const StyledTextarea = (props) => <textarea {...props} className={`w-full bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] focus:ring-0 rounded-md p-4 min-h-[120px] font-mono text-sm ${props.className}`} />;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [reels, setReels] = useState([]);
  const [completedTournaments, setCompletedTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newReelEmbedCode, setNewReelEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: "", text: "" });
  const [submittingReel, setSubmittingReel] = useState(false);
  const [reelMessage, setReelMessage] = useState({ type: "", text: "" });
  const [ongoingTournaments, setOngoingTournaments] = useState([]);
  const [selectedScoreTournamentId, setSelectedScoreTournamentId] = useState('');
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regData, reelData, allTournaments] = await Promise.all([
        Registration.list(), FeaturedReel.list(), Tournament.getAll(),
      ]);
      setRegistrations(regData);
      setReels(reelData);
      setCompletedTournaments(allTournaments.filter(t => t.status === 'completed'));
      setOngoingTournaments(allTournaments.filter(t => t.status === 'ongoing'));
    } catch (error) { console.error("Failed to load dashboard data", error); } 
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!selectedScoreTournamentId) { setTeams([]); setGames([]); return; }
    const loadScoreData = async () => {
      const [teamData, gameData] = await Promise.all([
        Team.filter({ tournament_id: selectedScoreTournamentId }),
        Game.filter({ tournament_id: selectedScoreTournamentId }),
      ]);
      setTeams(teamData);
      setGames(gameData);
    };
    loadScoreData();
  }, [selectedScoreTournamentId]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/admin'); };
  const handleFileChange = (e) => { setSelectedFiles(Array.from(e.target.files)); setUploadMessage({ type: "", text: "" }); };
  const getStatusBadge = (status) => (status === 'paid' ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">Paid</span> : <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Unpaid</span>);
  
  const handleGallerySubmit = async () => {
    if (!selectedTournamentId || selectedFiles.length === 0) { setUploadMessage({ type: "error", text: "Please select a tournament and at least one file." }); return; }
    setUploading(true); setUploadMessage({ type: "", text: "" });
    const uploadPromises = selectedFiles.map(file => MediaItem.upload(file, selectedTournamentId));
    const results = await Promise.all(uploadPromises);
    const failedUploads = results.filter(result => result.error);
    if (failedUploads.length > 0) { setUploadMessage({ type: "error", text: `${failedUploads.length} out of ${selectedFiles.length} files failed to upload.` }); } 
    else { setUploadMessage({ type: "success", text: "All files uploaded successfully!" }); setSelectedFiles([]); document.getElementById('file-upload').value = ""; setTimeout(() => setUploadMessage({ type: "", text: "" }), 5000); }
    setUploading(false);
  };
  
  const handleAddReel = async () => {
    if (!newReelEmbedCode.trim()) { setReelMessage({ type: "error", text: "Please paste an embed code." }); return; }
    setSubmittingReel(true); setReelMessage({ type: "", text: "" });
    const { error } = await FeaturedReel.create({ embed_html: newReelEmbedCode });
    if (error) { setReelMessage({ type: "error", text: `Failed to add reel: ${error.message}` }); } 
    else { setReelMessage({ type: "success", text: "Reel added successfully!" }); setNewReelEmbedCode(''); await loadData(); setTimeout(() => setReelMessage({ type: "", text: "" }), 5000); }
    setSubmittingReel(false);
  };

  const handleDeleteReel = async (reelId) => {
    if (window.confirm("Are you sure?")) {
      const { error } = await FeaturedReel.deleteById(reelId);
      if (error) { setReelMessage({ type: "error", text: `Failed to delete reel: ${error.message}` }); }
      else { setReelMessage({ type: "success", text: "Reel deleted."}); setReels(reels.filter(r => r.id !== reelId)); setTimeout(() => setReelMessage({ type: "", text: "" }), 3000); }
    }
  };

  const handleCreateGame = async () => {
    if (!selectedScoreTournamentId || !teamAId || !teamBId || teamAId === teamBId) { alert("Please select a tournament and two different teams."); return; }
    setIsCreatingGame(true);
    await Game.create({ tournament_id: selectedScoreTournamentId, team_a_id: teamAId, team_b_id: teamBId, status: 'SCHEDULED' });
    const gameData = await Game.filter({ tournament_id: selectedScoreTournamentId });
    setGames(gameData);
    setTeamAId(""); setTeamBId(""); setIsCreatingGame(false);
  };

  const handleScoreChange = async (gameId, field, increment) => {
    const game = games.find(g => g.id === gameId);
    const currentScore = game[field] || 0;
    const newScore = Math.max(0, currentScore + (increment ? 1 : -1));
    const { data: updatedGame } = await Game.update(gameId, { [field]: newScore });
    if (updatedGame) setGames(games.map(g => g.id === gameId ? updatedGame : g));
  };

  const handleStatusChange = async (gameId, currentStatus) => {
    const newStatus = currentStatus === "SCHEDULED" ? "LIVE" : "FINAL";
    const { data: updatedGame } = await Game.update(gameId, { status: newStatus });
    if (updatedGame) setGames(games.map(g => g.id === gameId ? updatedGame : g).sort((a, b) => a.start_time - b.start_time));
  };

  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || "Unknown Team";

  const liveGames = games.filter(g => g.status === "LIVE");
  const scheduledGames = games.filter(g => g.status === "SCHEDULED");
  const finalGames = games.filter(g => g.status === "FINAL");

  if (loading) { return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" /></div>; }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div><h1 className="headline-font text-5xl md:text-6xl text-white mb-2">ADMIN DASHBOARD</h1><p className="text-gray-400">Manage your tournaments and content</p></div>
          <button onClick={handleLogout} className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 px-6 py-3 rounded-md headline-font tracking-wider flex items-center gap-2 transition-colors"><LogOut className="w-5 h-5" />LOGOUT</button>
        </div>

        <div className="space-y-6">
          <Section icon={Users} title="REGISTRATIONS" count={registrations.length} defaultOpen={true}>
            {registrations.length === 0 ? <p className="text-center text-gray-500 py-8">No registrations yet</p> : (
              <StyledTable headers={["Team Name", "Tournament", "Contact Person", "Email", "Phone", "Division", "Payment"]}>
                {registrations.map((reg) => (
                  <StyledTableRow key={reg.id}>
                    <StyledTableCell className="font-semibold text-white">{reg.team_name || "N/A"}</StyledTableCell>
                    <StyledTableCell>{reg.tournaments?.name || "N/A"}</StyledTableCell>
                    <StyledTableCell>{reg.contact_person}</StyledTableCell>
                    <StyledTableCell><a href={`mailto:${reg.email}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Mail className="w-4 h-4" />Email</a></StyledTableCell>
                    <StyledTableCell><a href={`tel:${reg.phone}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Phone className="w-4 h-4" />Call</a></StyledTableCell>
                    <StyledTableCell>{reg.division || 'N/A'}</StyledTableCell>
                    <StyledTableCell>{getStatusBadge(reg.payment_status)}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </StyledTable>
            )}
          </Section>
          
          <Section icon={Trophy} title="SCORE CONTROL PANEL">
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 headline-font text-sm">SELECT AN ONGOING TOURNAMENT</label>
                <Select value={selectedScoreTournamentId} onValueChange={setSelectedScoreTournamentId}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"><SelectValue placeholder="Choose an ongoing tournament" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {ongoingTournaments.length === 0 ? <div className="p-4 text-gray-500 text-center">No ongoing tournaments</div> : ongoingTournaments.map((t) => (<SelectItem key={t.id} value={t.id} className="text-white hover:bg-white/5">{t.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {selectedScoreTournamentId && (
                <>
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                    <h3 className="headline-font text-xl text-white mb-4">CREATE NEW GAME</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select value={teamAId} onValueChange={setTeamAId}><SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white h-12"><SelectValue placeholder="Select Team A" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10">{teams.map((team) => (<SelectItem key={team.id} value={team.id} className="text-white hover:bg-white/5">{team.name}</SelectItem>))}</SelectContent></Select>
                      <Select value={teamBId} onValueChange={setTeamBId}><SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white h-12"><SelectValue placeholder="Select Team B" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10">{teams.map((team) => (<SelectItem key={team.id} value={team.id} className="text-white hover:bg-white/5">{team.name}</SelectItem>))}</SelectContent></Select>
                      <StyledButton onClick={handleCreateGame} disabled={isCreatingGame} className="py-2 h-12 text-base">{isCreatingGame ? "CREATING..." : "CREATE GAME"}</StyledButton>
                    </div>
                  </div>

                  {liveGames.length > 0 && (<div><h3 className="headline-font text-2xl text-white mb-4 flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>LIVE GAMES ({liveGames.length})</h3><div className="space-y-4">{liveGames.map((game) => (<div key={game.id} className="bg-[#0a0a0a] border-2 border-red-500/30 rounded-lg p-6"><div className="flex items-center justify-between mb-4"><span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs headline-font">LIVE</span><StyledButton onClick={() => handleStatusChange(game.id, game.status)} className="py-2 h-10 text-sm">END GAME</StyledButton></div><div className="grid grid-cols-3 gap-4 items-center"><div className="text-right"><p className="headline-font text-xl text-white mb-2">{getTeamName(game.team_a_id)}</p><div className="flex items-center justify-end gap-2"><button onClick={() => handleScoreChange(game.id, "team_a_score", false)} className="p-2 border border-white/10 rounded-md"><Minus className="w-4 h-4" /></button><span className="text-4xl headline-font text-[#FF6B00] w-12 text-center">{game.team_a_score || 0}</span><button onClick={() => handleScoreChange(game.id, "team_a_score", true)} className="p-2 bg-[#FF6B00] rounded-md"><Plus className="w-4 h-4" /></button></div></div><div className="text-center"><span className="text-3xl text-gray-500">VS</span></div><div className="text-left"><p className="headline-font text-xl text-white mb-2">{getTeamName(game.team_b_id)}</p><div className="flex items-center gap-2"><button onClick={() => handleScoreChange(game.id, "team_b_score", false)} className="p-2 border border-white/10 rounded-md"><Minus className="w-4 h-4" /></button><span className="text-4xl headline-font text-[#FF6B00] w-12 text-center">{game.team_b_score || 0}</span><button onClick={() => handleScoreChange(game.id, "team_b_score", true)} className="p-2 bg-[#FF6B00] rounded-md"><Plus className="w-4 h-4" /></button></div></div></div></div>))}</div></div>)}
                  {scheduledGames.length > 0 && (<div><h3 className="headline-font text-2xl text-white mb-4">SCHEDULED ({scheduledGames.length})</h3><div className="space-y-4">{scheduledGames.map((game) => (<div key={game.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6"><div className="flex items-center justify-between"><div className="flex-1 grid grid-cols-3 gap-4 items-center"><div className="text-right"><p className="headline-font text-lg text-white">{getTeamName(game.team_a_id)}</p></div><div className="text-center"><span className="text-xl text-gray-500">VS</span></div><div className="text-left"><p className="headline-font text-lg text-white">{getTeamName(game.team_b_id)}</p></div></div><StyledButton onClick={() => handleStatusChange(game.id, game.status)} className="ml-4 py-2 h-10 text-sm">START GAME</StyledButton></div></div>))}</div></div>)}
                  {finalGames.length > 0 && (<div><h3 className="headline-font text-2xl text-white mb-4">FINAL ({finalGames.length})</h3><div className="space-y-4">{finalGames.map((game) => (<div key={game.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 opacity-60"><div className="flex items-center justify-between mb-2"><span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs headline-font">FINAL</span></div><div className="grid grid-cols-3 gap-4 items-center"><div className="text-right"><p className="headline-font text-lg text-white">{getTeamName(game.team_a_id)}</p><span className="text-3xl headline-font text-white">{game.team_a_score || 0}</span></div><div className="text-center"><span className="text-xl text-gray-500">VS</span></div><div className="text-left"><p className="headline-font text-lg text-white">{getTeamName(game.team_b_id)}</p><span className="text-3xl headline-font text-white">{game.team_b_score || 0}</span></div></div></div>))}</div></div>)}
                </>
              )}
            </div>
          </Section>
          
          <Section icon={Upload} title="MANAGE TOURNAMENT GALLERY">{/* ... Gallery upload form ... */}</Section>
          <Section icon={Film} title="MANAGE FEATURED REELS" count={reels.length}>{/* ... Reels management ... */}</Section>
        </div>
      </div>
    </div>
  );
}