import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { FeaturedReel, Tournament, MediaItem, Team, Game, Field } from '@/Entities/all';
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Users, Upload, Film, Mail, Phone, Trash2, Loader2, Image as ImageIcon, Video, Trophy, Plus, Minus, Download, ClipboardList, MoreVertical, Copy, LayoutDashboard, ChevronRight, CheckCircle, Clock, X, Menu } from "lucide-react";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import * as XLSX from 'xlsx';

// ── Shared UI ─────────────────────────────────────────────────────────────────
const T = ({ headers, children }) => (
  <div className="overflow-x-auto rounded-xl border border-white/10">
    <table className="w-full text-sm text-left text-gray-300">
      <thead className="bg-[#0d0d0d] uppercase text-xs text-gray-500 headline-font tracking-wider">
        <tr>{headers.map(h => <th key={h} className="px-5 py-3.5 whitespace-nowrap">{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
const TR = ({ children }) => <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">{children}</tr>;
const TD = ({ children, className = '' }) => <td className={`px-5 py-3.5 whitespace-nowrap ${className}`}>{children}</td>;
const SBtn = ({ children, onClick, disabled }) => <Button onClick={onClick} disabled={disabled} className="bg-[#FF6B00] text-white px-6 py-2.5 rounded-lg headline-font hover:bg-[#FF6B00]/90 flex items-center w-full md:w-auto">{children}</Button>;
const STa = ({ value, onChange, placeholder }) => <Textarea value={value} onChange={onChange} placeholder={placeholder} className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] min-h-[120px] font-mono text-sm" />;

const StatCard = ({ title, icon: Icon, total, paid, pending, onClick, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
    onClick={onClick} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 cursor-pointer group hover:border-[#FF6B00]/40 transition-all duration-300">
    <div className="flex items-start justify-between mb-5">
      <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/10 rounded-xl p-3"><Icon className="w-5 h-5 text-[#FF6B00]" /></div>
      <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition-all" />
    </div>
    <p className="text-gray-500 text-xs uppercase tracking-widest font-medium mb-1.5">{title}</p>
    <p className="headline-font text-5xl text-white mb-5">{total}</p>
    <div className="flex gap-5 pt-4 border-t border-white/5">
      <span className="flex items-center gap-1.5 text-xs text-gray-500"><CheckCircle className="w-3.5 h-3.5 text-green-400" />{paid} paid</span>
      <span className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="w-3.5 h-3.5 text-amber-400" />{pending} pending</span>
    </div>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tournamentRegistrations, setTournamentRegistrations] = useState([]);
  const [parkleaRegistrations, setParkleaRegistrations] = useState([]);
  const [holidayRegistrations, setHolidayRegistrations] = useState([]);
  const [aiaRegistrations, setAiaRegistrations] = useState([]);
  const [reels, setReels] = useState([]);
  const [completedTournaments, setCompletedTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newReelEmbedCode, setNewReelEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [submittingReel, setSubmittingReel] = useState(false);
  const [reelMessage, setReelMessage] = useState({ type: '', text: '' });
  const [ongoingTournaments, setOngoingTournaments] = useState([]);
  const [selectedScoreTournamentId, setSelectedScoreTournamentId] = useState('');
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newGameLabel, setNewGameLabel] = useState('');
  
  // Fields State
  const [fields, setFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);
  const [selectedFieldFilter, setSelectedFieldFilter] = useState('ALL');
  const [gameFieldId, setGameFieldId] = useState('UNASSIGNED');

  const loadData = async () => {
    try {
      const dedupeAndSort = (data) => {
        const keys = new Set(data.filter(r => r.payment_status === 'successful' || r.payment_status === 'paid').map(r => `${(r.participant_first_name || r.participant_name || '').toLowerCase()}-${(r.parent_email || '').toLowerCase()}`));
        data = data.filter(r => { const k = `${(r.participant_first_name || r.participant_name || '').toLowerCase()}-${(r.parent_email || '').toLowerCase()}`; return !((r.payment_status === 'pending' || r.payment_status === 'pending_payment') && keys.has(k)); });
        data.sort((a, b) => { const w = r => { const p = r.payment_status === 'successful' || r.payment_status === 'paid'; const s = !r.package_type || r.package_type === 'standard'; return p && s ? 1 : p ? 2 : s ? 3 : 4; }; return w(a) - w(b); });
        return data;
      };
      const [tournRegData, reelData, allT, parkleaData, holidayData, aiaData] = await Promise.all([
        supabase.from('tournament_registrations').select('*, tournaments(name)').order('created_at', { ascending: false }).then(res => res.data || []),
        FeaturedReel.list(), Tournament.list('start_date'),
        supabase.from('parklea_registrations').select('*').order('created_at', { ascending: false }).then(res => dedupeAndSort(res.data || [])),
        supabase.from('holiday_program_registrations').select('*').order('created_at', { ascending: false }).then(res => dedupeAndSort(res.data || [])),
        supabase.from('aia_program_registrations').select('*').order('created_at', { ascending: false }).then(res => dedupeAndSort(res.data || [])),
      ]);
      setTournamentRegistrations(tournRegData); setParkleaRegistrations(parkleaData); setHolidayRegistrations(holidayData);
      setAiaRegistrations(aiaData); setReels(reelData);
      setCompletedTournaments(allT.filter(t => t.status === 'completed'));
      setOngoingTournaments(allT.filter(t => t.status === 'ongoing'));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!selectedScoreTournamentId) { setTeams([]); setGames([]); setFields([]); return; }
    const load = async () => { 
      const [td, gd, fd] = await Promise.all([
        Team.filter({ tournament_id: selectedScoreTournamentId }), 
        Game.filter({ tournament_id: selectedScoreTournamentId }),
        Field.filter({ tournament_id: selectedScoreTournamentId })
      ]); 
      setTeams(td); 
      setGames(gd); 
      setFields(fd);
    };
    load();
  }, [selectedScoreTournamentId]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/admin'); };
  const handleFileChange = (e) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'];
    const max = 20*1024*1024; const valid = [];
    for (let f of Array.from(e.target.files)) {
      if (!allowed.includes(f.type)) { setUploadMessage({ type: 'error', text: `Invalid: ${f.name}` }); return; }
      if (f.size > max) { setUploadMessage({ type: 'error', text: `Too large: ${f.name}` }); return; }
      valid.push(f);
    }
    setSelectedFiles(valid); setUploadMessage({ type: '', text: '' });
  };
  const getStatusBadge = s => ['paid', 'successful', 'completed'].includes(s?.toLowerCase())
    ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">Paid</span>
    : <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">Pending</span>;

  const getTeamTypeBadge = t => t === 'Champion'
    ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/20">Champion</span>
    : t === 'Challenger'
    ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">Challenger</span>
    : <span className="text-gray-600 text-xs">—</span>;

  const csvDown = (name, headers, rows) => { const c = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n'); const l = document.createElement('a'); l.setAttribute('href', encodeURI(c)); l.setAttribute('download', `${name}_${new Date().toISOString().split('T')[0]}.csv`); document.body.appendChild(l); l.click(); document.body.removeChild(l); };
  const downloadParkleaCSV = () => { if (!parkleaRegistrations.length) return; csvDown('Parklea_Registrations', ['Date','Package','Status','Participant','Age','DOB','Team','Position','Parent Name','Parent Phone','Parent Email','Emergency Contact','Address','Jersey','Shorts','Socks','Medical?','Medical Details','Medication?','Medication Details','Signature'], parkleaRegistrations.map(r => [new Date(r.created_at).toLocaleDateString(),(r.package_type||'standard'),r.payment_status,r.participant_name,r.age_turning_2026,r.dob,r.team,r.position,r.parent_name,r.parent_phone,r.parent_email,r.emergency_contact,`"${(r.home_address||'').replace(/"/g,'""')}"`,r.jersey_size,r.shorts_size,r.socks_size,r.has_medical_condition,`"${(r.medical_description||'').replace(/"/g,'""')}"`,r.has_medication,`"${(r.medication_details||'').replace(/"/g,'""')}"`,r.signature])); };
  const downloadHolCSV = () => { if (!holidayRegistrations.length) return; csvDown('Holiday_Registrations', ['Date','Package','Total','Status','Selected Days','Participant','Age','DOB','Position','Parent Name','Parent Phone','Parent Email','Emergency Contact','Address','Medical?','Medical Details','Medication?','Medication Details','Signature'], holidayRegistrations.map(r => [new Date(r.created_at).toLocaleDateString(),(r.package_type||'Custom'),`$${r.total_amount||0}`,r.payment_status,`"${(r.selected_days||'').replace(/"/g,'""')}"`,r.participant_name,r.age_turning_2026,r.dob,r.position,r.parent_name,r.parent_phone,r.parent_email,r.emergency_contact,`"${(r.home_address||'').replace(/"/g,'""')}"`,r.has_medical_condition,`"${(r.medical_description||'').replace(/"/g,'""')}"`,r.has_medication,`"${(r.medication_details||'').replace(/"/g,'""')}"`,r.signature])); };
  const downloadAIACSV = () => { if (!aiaRegistrations.length) return; csvDown('AIA_Registrations', ['Date','Status','First Name','Last Name','DOB','Year Group','Parent First','Parent Last','Phone','Email','Address','City','State','Postcode','Allergies','Inhaler','Signature'], aiaRegistrations.map(r => [new Date(r.created_at).toLocaleDateString(),r.payment_status,r.participant_first_name,r.participant_last_name,r.dob,(r.year_group||'').replace('-',' '),r.parent_first_name,r.parent_last_name,r.parent_phone,r.parent_email,`"${(r.street_address||'').replace(/"/g,'""')}"`,r.city,r.state,r.postal_code,`"${(r.allergies||'').replace(/"/g,'""')}"`,`"${(r.inhaler||'').replace(/"/g,'""')}"`,r.signature])); };
  const downloadTournamentCSV = () => {
    if (!tournamentRegistrations.length) return;
    
    const csvContentRows = [];
    
    tournamentRegistrations.forEach(r => {
      // 1. Team Info Header Row
      csvContentRows.push(['TEAM SUMMARY', 'Tournament', 'Team Name', 'Team Type', 'Div/Contact', 'Email', 'Phone', 'Payment Status', 'Agreed Terms', 'Signature Date', 'Signature']);
      csvContentRows.push([
        ' ',
        `"${(r.tournaments?.name || 'N/A').replace(/"/g, '""')}"`,
        `"${(r.team_name || 'N/A').replace(/"/g, '""')}"`,
        r.team_type || 'N/A',
        `"${(r.contact_person || 'N/A').replace(/"/g, '""')}"`,
        `"${(r.email || 'N/A').replace(/"/g, '""')}"`,
        `"${(r.phone || 'N/A').replace(/"/g, '""')}"`,
        r.payment_status || 'N/A',
        r.agreed_to_terms ? 'Yes' : 'No',
        r.signature_date ? new Date(r.signature_date).toLocaleDateString() : 'N/A',
        `"${(r.signature || '').replace(/"/g, '""')}"`
      ]);
      
      // Medical info
      if (r.medical_info && r.medical_info.trim().length > 0) {
          csvContentRows.push(['MEDICAL INFO', `"${r.medical_info.replace(/"/g, '""')}"`]);
      }
      
      // 2. Player Roster Headers
      csvContentRows.push([' ', 'PLAYER ROSTER', 'First Name', 'Last Name', 'Is Captain', 'Email', 'Phone', 'Instagram']);
      
      if (Array.isArray(r.players) && r.players.length > 0) {
        r.players.forEach((p, idx) => {
          csvContentRows.push([
            ' ',
            `Player ${idx + 1}`,
            `"${(p.firstName || '').replace(/"/g, '""')}"`,
            `"${(p.lastName || '').replace(/"/g, '""')}"`,
            p.isCaptain ? 'YES (CAPTAIN)' : 'No',
            `"${(p.email || '').replace(/"/g, '""')}"`,
            `"${(p.phone || '').replace(/"/g, '""')}"`,
            `"${(p.instagram || '').replace(/"/g, '""')}"`
          ]);
        });
      } else {
        csvContentRows.push([' ', 'No players recorded']);
      }
      
      csvContentRows.push([]);
      csvContentRows.push([]);
    });
    
    const c = "data:text/csv;charset=utf-8," + csvContentRows.map(r => r.join(',')).join('\n');
    const l = document.createElement('a'); 
    l.setAttribute('href', encodeURI(c)); 
    l.setAttribute('download', `Tournament_Registrations_${new Date().toISOString().split('T')[0]}.csv`); 
    document.body.appendChild(l); 
    l.click(); 
    document.body.removeChild(l);
  };

  const downloadTournamentXLSX = () => {
    if (!tournamentRegistrations.length) return;

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Team Summary ─────────────────────────────────────────────────
    const summaryHeaders = ['Date', 'Tournament', 'Team Name', 'Team Type', 'Captain', 'Email', 'Phone', 'Players', 'Medical Info', 'Payment Status', 'Agreed Terms', 'Signature', 'Signature Date'];
    const summaryRows = tournamentRegistrations.map(r => {
      const captain = Array.isArray(r.players) ? r.players.find(p => p.isCaptain) : null;
      return [
        new Date(r.created_at).toLocaleDateString(),
        r.tournaments?.name || 'N/A',
        r.team_name || 'N/A',
        r.team_type || 'N/A',
        captain ? `${captain.firstName} ${captain.lastName}` : 'N/A',
        captain?.email || 'N/A',
        captain?.phone || 'N/A',
        Array.isArray(r.players) ? r.players.length : 0,
        r.medical_info || '',
        r.payment_status || 'N/A',
        r.agreed_to_terms ? 'Yes' : 'No',
        r.signature || '',
        r.signature_date ? new Date(r.signature_date).toLocaleDateString() : 'N/A',
      ];
    });
    const summarySheet = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    // Column widths
    summarySheet['!cols'] = [10,30,20,12,22,28,16,8,40,14,12,24,14].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Team Summary');

    // ── Sheet 2: Full Roster ──────────────────────────────────────────────────
    const rosterHeaders = ['Tournament', 'Team Name', 'Team Type', 'Payment Status', 'Player #', 'First Name', 'Last Name', 'Role', 'Email', 'Phone', 'Instagram'];
    const rosterRows = [];
    tournamentRegistrations.forEach(r => {
      if (Array.isArray(r.players)) {
        r.players.forEach((p, idx) => {
          rosterRows.push([
            r.tournaments?.name || 'N/A',
            r.team_name || 'N/A',
            r.team_type || 'N/A',
            r.payment_status || 'N/A',
            idx + 1,
            p.firstName || '',
            p.lastName || '',
            p.isCaptain ? 'Captain' : 'Player',
            p.email || '',
            p.phone || '',
            p.instagram || '',
          ]);
        });
      }
    });
    const rosterSheet = XLSX.utils.aoa_to_sheet([rosterHeaders, ...rosterRows]);
    rosterSheet['!cols'] = [30,20,12,14,8,14,14,8,28,16,16].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, rosterSheet, 'Full Roster');

    XLSX.writeFile(wb, `Tournament_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleGallerySubmit = async () => {
    if (!selectedTournamentId || !selectedFiles.length) { setUploadMessage({ type: 'error', text: 'Select a tournament and files.' }); return; }
    setUploading(true); setUploadMessage({ type: '', text: '' });
    const results = await Promise.all(selectedFiles.map(f => MediaItem.upload(f, selectedTournamentId)));
    const failed = results.filter(r => r.error);
    if (failed.length) { setUploadMessage({ type: 'error', text: `${failed.length}/${selectedFiles.length} failed.` }); }
    else { setUploadMessage({ type: 'success', text: 'All uploaded!' }); setSelectedFiles([]); if (document.getElementById('file-upload')) document.getElementById('file-upload').value = ''; setTimeout(() => setUploadMessage({ type: '', text: '' }), 5000); }
    setUploading(false);
  };
  const handleAddReel = async () => {
    if (!newReelEmbedCode.trim()) { setReelMessage({ type: 'error', text: 'Paste an embed code.' }); return; }
    setSubmittingReel(true); setReelMessage({ type: '', text: '' });
    const { error } = await FeaturedReel.create({ embed_html: newReelEmbedCode });
    if (error) { setReelMessage({ type: 'error', text: error.message }); } else { setReelMessage({ type: 'success', text: 'Reel added!' }); setNewReelEmbedCode(''); await loadData(); setTimeout(() => setReelMessage({ type: '', text: '' }), 5000); }
    setSubmittingReel(false);
  };
  const handleDeleteParkleaRegistration = async id => { if (window.confirm('Delete this registration?')) { const { error } = await supabase.from('parklea_registrations').delete().eq('id', id); if (error) alert(error.message); else await loadData(); } };
  const handleDeleteHolidayRegistration = async id => { if (window.confirm('Delete this registration?')) { const { error } = await supabase.from('holiday_program_registrations').delete().eq('id', id); if (error) alert(error.message); else await loadData(); } };
  const handleDeleteAIARegistration = async id => { if (window.confirm('Delete this registration?')) { const { error } = await supabase.from('aia_program_registrations').delete().eq('id', id); if (error) alert(error.message); else await loadData(); } };
  const handleDeleteTournamentRegistration = async id => { if (window.confirm('Delete this registration? This cannot be undone.')) { const { error } = await supabase.from('tournament_registrations').delete().eq('id', id); if (error) alert(error.message); else await loadData(); } };
  const handleDeleteReel = async id => { if (window.confirm('Delete?')) { const { error } = await FeaturedReel.deleteById(id); if (error) setReelMessage({ type: 'error', text: error.message }); else { setReelMessage({ type: 'success', text: 'Deleted.' }); await loadData(); } } };
  const handleAddTeam = async () => { if (!selectedScoreTournamentId || !newTeamName.trim()) { alert('Enter a team name.'); return; } setIsAddingTeam(true); await Team.create({ name: newTeamName.trim(), tournament_id: selectedScoreTournamentId, logo_url: '' }); setTeams(await Team.filter({ tournament_id: selectedScoreTournamentId })); setNewTeamName(''); setIsAddingTeam(false); };
  const handleDeleteTeam = async (id, name) => { if (!window.confirm(`Remove "${name}" from this tournament?`)) return; const { error } = await supabase.from('teams').delete().eq('id', id); if (error) { alert(error.message); return; } setTeams(teams.filter(t => t.id !== id)); };
  
  const handleAddField = async () => { if (!selectedScoreTournamentId || !newFieldName.trim()) { alert('Enter a field name.'); return; } setIsAddingField(true); const { error } = await Field.create({ name: newFieldName.trim(), tournament_id: selectedScoreTournamentId }); if (error) { alert('Error: ' + error.message + '\n\nMake sure you ran the SQL script in Supabase to create the fields table!'); setIsAddingField(false); return; } setFields(await Field.filter({ tournament_id: selectedScoreTournamentId })); setNewFieldName(''); setIsAddingField(false); };
  const handleDeleteField = async (id, name) => { if (!window.confirm(`Delete field "${name}"?`)) return; const { error } = await Field.delete(id); if (error) { alert(error.message); return; } setFields(fields.filter(f => f.id !== id)); };
  
  const handleCreateGame = async () => { if (!selectedScoreTournamentId || !teamAId || !teamBId || teamAId === teamBId) { alert('Select a tournament and two different teams.'); return; } setIsCreatingGame(true); await Game.create({ tournament_id: selectedScoreTournamentId, team_a_id: teamAId, team_b_id: teamBId, status: 'SCHEDULED', label: newGameLabel.trim() || null, field_id: gameFieldId === 'UNASSIGNED' ? null : gameFieldId, start_time: new Date().toISOString() }); setGames(await Game.filter({ tournament_id: selectedScoreTournamentId })); setTeamAId(''); setTeamBId(''); setNewGameLabel(''); setGameFieldId('UNASSIGNED'); setIsCreatingGame(false); };
  const handleDeleteGame = (gameId) => { setTimeout(async () => { if (!window.confirm('Delete this game? This cannot be undone.')) return; const { error } = await supabase.from('games').delete().eq('id', gameId); if (error) { alert(error.message); return; } setGames(current => current.filter(g => g.id !== gameId)); }, 10); };
  const handleScoreChange = async (gameId, field, inc) => { const game = games.find(g => g.id === gameId); if (!game) return; const { data: updated } = await Game.update(gameId, { [field]: Math.max(0, (game[field] || 0) + (inc ? 1 : -1)) }); if (updated) setGames(games.map(g => g.id === gameId ? updated : g)); };
  const handleStatusChange = async (gameId, cur) => { const isStarting = cur === 'SCHEDULED'; const updates = { status: isStarting ? 'LIVE' : 'FINAL' }; if (isStarting) updates.start_time = new Date().toISOString(); const { data: updated } = await Game.update(gameId, updates); if (updated) setGames(games.map(g => g.id === gameId ? updated : g).sort((a, b) => new Date(a.start_time || 0) - new Date(b.start_time || 0))); };
  const getTeamName = id => teams.find(t => t.id === id)?.name || 'Unknown';

  const ActionMenu = ({ reg }) => {
    const [open, setOpen] = useState(false);
    const copy = () => { navigator.clipboard.writeText(`Name: ${reg.participant_name}\nTeam: ${reg.team||'N/A'}\nAge: ${reg.age_turning_2026}\nParent: ${reg.parent_name}\nEmail: ${reg.parent_email}\nPhone: ${reg.parent_phone}\nSize: Jersey(${reg.jersey_size}) Shorts(${reg.shorts_size}) Socks(${reg.socks_size})\nMedical: ${reg.has_medical_condition==='yes'?reg.medical_description:'None'}\nStatus: ${reg.payment_status}`); setOpen(false); alert('Copied!'); };
    return <div className="relative"><button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-white p-1.5 rounded hover:bg-white/5"><MoreVertical className="w-4 h-4" /></button>{open && (<><div className="fixed inset-0 z-10" onClick={() => setOpen(false)} /><div className="absolute right-0 mt-1 w-44 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden"><button onClick={copy} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"><Copy className="w-3.5 h-3.5" />Copy</button><button onClick={() => { setOpen(false); handleDeleteParkleaRegistration(reg.id); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5"><Trash2 className="w-3.5 h-3.5" />Delete</button></div></>)}</div>;
  };
  const ActionMenuHoliday = ({ reg }) => {
    const [open, setOpen] = useState(false);
    const copy = () => { navigator.clipboard.writeText(`Name: ${reg.participant_name}\nAge: ${reg.age_turning_2026}\nParent: ${reg.parent_name}\nEmail: ${reg.parent_email}\nPhone: ${reg.parent_phone}\nDays: ${reg.selected_days}\nPackage: ${reg.package_type}\nTotal: $${reg.total_amount||0}\nMedical: ${reg.has_medical_condition==='yes'?reg.medical_description:'None'}\nStatus: ${reg.payment_status}`); setOpen(false); alert('Copied!'); };
    return <div className="relative"><button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-white p-1.5 rounded hover:bg-white/5"><MoreVertical className="w-4 h-4" /></button>{open && (<><div className="fixed inset-0 z-10" onClick={() => setOpen(false)} /><div className="absolute right-0 mt-1 w-44 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden"><button onClick={copy} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"><Copy className="w-3.5 h-3.5" />Copy</button><button onClick={() => { setOpen(false); handleDeleteHolidayRegistration(reg.id); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5"><Trash2 className="w-3.5 h-3.5" />Delete</button></div></>)}</div>;
  };
  const ActionMenuAIA = ({ reg }) => {
    const [open, setOpen] = useState(false);
    const copy = () => { navigator.clipboard.writeText(`Name: ${reg.participant_first_name} ${reg.participant_last_name}\\nYear Group: ${(reg.year_group||'').replace('-',' ')}\\nDOB: ${reg.dob}\\nParent: ${reg.parent_first_name} ${reg.parent_last_name}\\nEmail: ${reg.parent_email}\\nPhone: ${reg.parent_phone}\\nAddress: ${reg.street_address}, ${reg.city} ${reg.state} ${reg.postal_code}\\nAllergies: ${reg.allergies}\\nStatus: ${reg.payment_status}`); setOpen(false); alert('Copied!'); };
    return <div className="relative"><button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-white p-1.5 rounded hover:bg-white/5"><MoreVertical className="w-4 h-4" /></button>{open && (<><div className="fixed inset-0 z-10" onClick={() => setOpen(false)} /><div className="absolute right-0 mt-1 w-44 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden"><button onClick={copy} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"><Copy className="w-3.5 h-3.5" />Copy</button><button onClick={() => { setOpen(false); handleDeleteAIARegistration(reg.id); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5"><Trash2 className="w-3.5 h-3.5" />Delete</button></div></>)}</div>;
  };
  const ActionMenuTournament = ({ reg }) => {
    const [open, setOpen] = useState(false);
    const copy = () => { navigator.clipboard.writeText(`Team: ${reg.team_name||'N/A'}\\nContact: ${reg.contact_person}\\nEmail: ${reg.email}\\nPhone: ${reg.phone}\\nStatus: ${reg.payment_status}`); setOpen(false); alert('Copied!'); };
    return <div className="relative"><button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-white p-1.5 rounded hover:bg-white/5"><MoreVertical className="w-4 h-4" /></button>{open && (<><div className="fixed inset-0 z-10" onClick={() => setOpen(false)} /><div className="absolute right-0 mt-1 w-44 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden"><button onClick={copy} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"><Copy className="w-3.5 h-3.5" />Copy</button><button onClick={() => { setOpen(false); handleDeleteTournamentRegistration(reg.id); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5"><Trash2 className="w-3.5 h-3.5" />Delete</button></div></>)}</div>;
  };

  const getFilteredGames = () => {
    if (selectedFieldFilter === 'ALL') return games;
    if (selectedFieldFilter === 'UNASSIGNED') return games.filter(g => !g.field_id);
    return games.filter(g => String(g.field_id) === String(selectedFieldFilter));
  };
  const filteredGames = getFilteredGames();
  const liveGames = filteredGames.filter(g => g.status === 'LIVE');
  const scheduledGames = filteredGames.filter(g => g.status === 'SCHEDULED');
  const finalGames = filteredGames.filter(g => g.status === 'FINAL');

  const paidCount = (arr) => arr.filter(r => ['paid', 'successful', 'completed'].includes(r.payment_status?.toLowerCase())).length;
  const pendingCount = (arr) => arr.filter(r => !['paid', 'successful', 'completed'].includes(r.payment_status?.toLowerCase())).length;

  const navGroups = [
    { label: 'Dashboard', items: [{ key: 'overview', label: 'Overview', icon: LayoutDashboard }] },
    { label: 'Registrations', items: [
      { key: 'parklea', label: 'Parklea Program', icon: ClipboardList, count: parkleaRegistrations.length },
      { key: 'holiday', label: 'Holiday Program', icon: ClipboardList, count: holidayRegistrations.length },
      { key: 'aia', label: 'AIA After School', icon: ClipboardList, count: aiaRegistrations.length },
      { key: 'tournaments', label: 'Tournaments', icon: Users, count: tournamentRegistrations.length },
    ]},
    { label: 'Management', items: [
      { key: 'scores', label: 'Score Control', icon: Trophy },
      { key: 'gallery', label: 'Gallery', icon: Upload },
      { key: 'reels', label: 'Featured Reels', icon: Film, count: reels.length },
    ]},
  ];

  const sectionTitle = { overview: 'Overview', parklea: 'Parklea Program', holiday: 'Holiday Program', aia: 'AIA After School', tournaments: 'Tournament Registrations', scores: 'Score Control', gallery: 'Gallery', reels: 'Featured Reels' };

  const SectionHeader = ({ title, count, action }) => (
    <div className="flex items-start justify-between mb-6">
      <div><h2 className="headline-font text-3xl text-white">{title}</h2>{count !== undefined && <p className="text-gray-600 text-sm mt-0.5">{count} records</p>}</div>
      {action}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div><h2 className="headline-font text-3xl text-white mb-1">Welcome back</h2><p className="text-gray-500 text-sm">Here's what's happening across all programs.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard title="Parklea Program" icon={ClipboardList} total={parkleaRegistrations.length} paid={paidCount(parkleaRegistrations)} pending={pendingCount(parkleaRegistrations)} onClick={() => setActiveSection('parklea')} delay={0} />
              <StatCard title="Holiday Program" icon={ClipboardList} total={holidayRegistrations.length} paid={paidCount(holidayRegistrations)} pending={pendingCount(holidayRegistrations)} onClick={() => setActiveSection('holiday')} delay={0.08} />
              <StatCard title="AIA After School" icon={ClipboardList} total={aiaRegistrations.length} paid={paidCount(aiaRegistrations)} pending={pendingCount(aiaRegistrations)} onClick={() => setActiveSection('aia')} delay={0.16} />
              <StatCard title="Tournament Regs" icon={Users} total={tournamentRegistrations.length} paid={paidCount(tournamentRegistrations)} pending={pendingCount(tournamentRegistrations)} onClick={() => setActiveSection('tournaments')} delay={0.24} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[{key:'scores',label:'Score Control',icon:Trophy,desc:'Manage live game scores'},{key:'gallery',label:'Gallery',icon:Upload,desc:'Upload tournament media'},{key:'reels',label:'Featured Reels',icon:Film,desc:`${reels.length} reels published`}].map(({ key, label, icon: Icon, desc }) => (
                <button key={key} onClick={() => setActiveSection(key)} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 text-left hover:border-[#FF6B00]/40 transition-all group">
                  <Icon className="w-6 h-6 text-[#FF6B00] mb-3" />
                  <p className="text-white font-semibold headline-font">{label}</p>
                  <p className="text-gray-500 text-sm mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'parklea':
        return (
          <div>
            <SectionHeader title="Parklea Program" count={parkleaRegistrations.length} action={<Button onClick={downloadParkleaCSV} disabled={!parkleaRegistrations.length} className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 headline-font"><Download className="w-4 h-4 mr-2" />Export CSV</Button>} />
            {!parkleaRegistrations.length ? <p className="text-center text-gray-600 py-16">No registrations yet.</p> : (
              <T headers={['Date','Package','Participant','Age','Team','Parent','Email','Phone','Status','Actions']}>
                {parkleaRegistrations.map(r => <TR key={r.id}><TD>{new Date(r.created_at).toLocaleDateString()}</TD><TD className="capitalize text-gray-400">{r.package_type||'standard'}</TD><TD className="font-semibold text-white">{r.participant_name}</TD><TD>{r.age_turning_2026}</TD><TD>{r.team||'N/A'}</TD><TD>{r.parent_name}</TD><TD><a href={`mailto:${r.parent_email}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email</a></TD><TD><a href={`tel:${r.parent_phone}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Call</a></TD><TD>{getStatusBadge(r.payment_status)}</TD><TD><ActionMenu reg={r} /></TD></TR>)}
              </T>
            )}
          </div>
        );

      case 'holiday':
        return (
          <div>
            <SectionHeader title="Holiday Program" count={holidayRegistrations.length} action={<Button onClick={downloadHolCSV} disabled={!holidayRegistrations.length} className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 headline-font"><Download className="w-4 h-4 mr-2" />Export CSV</Button>} />
            {!holidayRegistrations.length ? <p className="text-center text-gray-600 py-16">No registrations yet.</p> : (
              <T headers={['Date','Package','Total','Days','Participant','Age','Parent','Email','Phone','Status','Actions']}>
                {holidayRegistrations.map(r => <TR key={r.id}><TD>{new Date(r.created_at).toLocaleDateString()}</TD><TD className="capitalize text-gray-400">{r.package_type||'Custom'}</TD><TD>${r.total_amount||0}</TD><TD>{(r.selected_days||'').split(',').length} days</TD><TD className="font-semibold text-white">{r.participant_name}</TD><TD>{r.age_turning_2026}</TD><TD>{r.parent_name}</TD><TD><a href={`mailto:${r.parent_email}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email</a></TD><TD><a href={`tel:${r.parent_phone}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Call</a></TD><TD>{getStatusBadge(r.payment_status)}</TD><TD><ActionMenuHoliday reg={r} /></TD></TR>)}
              </T>
            )}
          </div>
        );

      case 'aia':
        return (
          <div>
            <SectionHeader title="AIA After School Program" count={aiaRegistrations.length} action={<Button onClick={downloadAIACSV} disabled={!aiaRegistrations.length} className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 headline-font"><Download className="w-4 h-4 mr-2" />Export CSV</Button>} />
            {!aiaRegistrations.length ? <p className="text-center text-gray-600 py-16">No registrations yet.</p> : (
              <T headers={['Date','Year Group','Participant','DOB','Parent','Email','Phone','Status','Actions']}>
                {aiaRegistrations.map(r => <TR key={r.id}><TD>{new Date(r.created_at).toLocaleDateString()}</TD><TD className="capitalize text-gray-400">{(r.year_group||'').replace('-',' ')}</TD><TD className="font-semibold text-white">{r.participant_first_name} {r.participant_last_name}</TD><TD>{r.dob}</TD><TD>{r.parent_first_name} {r.parent_last_name}</TD><TD><a href={`mailto:${r.parent_email}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email</a></TD><TD><a href={`tel:${r.parent_phone}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Call</a></TD><TD>{getStatusBadge(r.payment_status)}</TD><TD><ActionMenuAIA reg={r} /></TD></TR>)}
              </T>
            )}
          </div>
        );

      case 'tournaments':
        return (
          <div>
            <SectionHeader
              title="Tournament Registrations"
              count={tournamentRegistrations.length}
              action={
                <div className="flex gap-2">
                  <Button onClick={downloadTournamentCSV} disabled={!tournamentRegistrations.length} className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 headline-font">
                    <Download className="w-4 h-4 mr-2" />CSV
                  </Button>
                  <Button onClick={downloadTournamentXLSX} disabled={!tournamentRegistrations.length} className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 headline-font">
                    <Download className="w-4 h-4 mr-2" />Excel
                  </Button>
                </div>
              }
            />
            {!tournamentRegistrations.length ? <p className="text-center text-gray-600 py-16">No registrations yet.</p> : (
              <T headers={['Date','Team Name','Tournament','Type','Captain','Email','Phone','Players','Status','Actions']}>
                {tournamentRegistrations.map(r => {
                  const captain = Array.isArray(r.players) ? r.players.find(p => p.isCaptain) : null;
                  return (
                    <TR key={r.id}>
                      <TD>{new Date(r.created_at).toLocaleDateString()}</TD>
                      <TD className="font-semibold text-white">{r.team_name||'N/A'}</TD>
                      <TD>{r.tournaments?.name||'N/A'}</TD>
                      <TD>{getTeamTypeBadge(r.team_type)}</TD>
                      <TD>{captain ? `${captain.firstName} ${captain.lastName}` : 'N/A'}</TD>
                      <TD>{captain?.email ? <a href={`mailto:${captain.email}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email</a> : 'N/A'}</TD>
                      <TD>{captain?.phone ? <a href={`tel:${captain.phone}`} className="text-[#FF6B00] hover:underline flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Call</a> : 'N/A'}</TD>
                      <TD>{Array.isArray(r.players) ? r.players.length : 0} players</TD>
                      <TD>{getStatusBadge(r.payment_status)}</TD>
                      <TD><ActionMenuTournament reg={r} /></TD>
                    </TR>
                  );
                })}
              </T>
            )}
          </div>
        );

      case 'scores':
        return (
          <div className="space-y-6">
            <SectionHeader title="Score Control" />
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
              <label className="block text-white mb-2 headline-font text-sm">SELECT ONGOING TOURNAMENT</label>
              <Select value={selectedScoreTournamentId} onValueChange={setSelectedScoreTournamentId}>
                <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white h-12"><SelectValue placeholder="Choose a tournament" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">{!ongoingTournaments.length ? <div className="p-4 text-gray-500 text-center text-sm">No ongoing tournaments</div> : ongoingTournaments.map(t => <SelectItem key={t.id} value={String(t.id)} className="text-white">{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {selectedScoreTournamentId && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                  <h3 className="headline-font text-lg text-white mb-4">ADD TEAM</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3"><Input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Enter team name" className="bg-[#0a0a0a] border-white/10 text-white h-11" onKeyDown={e => e.key === 'Enter' && handleAddTeam()} /></div>
                    <Button onClick={handleAddTeam} disabled={isAddingTeam || !newTeamName.trim()} className="bg-[#FF6B00] text-white headline-font h-11">{isAddingTeam ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" />Add Team</>}</Button>
                  </div>
                  {teams.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{teams.map(t => <span key={t.id} className="bg-[#0a0a0a] border border-white/10 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">{t.name}<button onClick={() => handleDeleteTeam(t.id, t.name)} className="text-gray-500 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button></span>)}</div>}
                </div>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                  <h3 className="headline-font text-lg text-white mb-4">MANAGE FIELDS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3"><Input value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder="Enter field name (e.g. Field 1, Court 2)" className="bg-[#0a0a0a] border-white/10 text-white h-11" onKeyDown={e => e.key === 'Enter' && handleAddField()} /></div>
                    <Button onClick={handleAddField} disabled={isAddingField || !newFieldName.trim()} className="bg-[#FF6B00] text-white headline-font h-11">{isAddingField ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" />Add Field</>}</Button>
                  </div>
                  {fields.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{fields.map(f => <span key={f.id} className="bg-[#0a0a0a] border border-white/10 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">{f.name}<button onClick={() => handleDeleteField(f.id, f.name)} className="text-gray-500 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button></span>)}</div>}
                </div>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                  <h3 className="headline-font text-lg text-white mb-4">CREATE NEW GAME</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <Select value={teamAId} onValueChange={setTeamAId}><SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white h-11"><SelectValue placeholder="Team A" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10">{teams.map(t => <SelectItem key={t.id} value={String(t.id)} className="text-white">{t.name}</SelectItem>)}</SelectContent></Select>
                    <Select value={teamBId} onValueChange={setTeamBId}><SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white h-11"><SelectValue placeholder="Team B" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10">{teams.map(t => <SelectItem key={t.id} value={String(t.id)} className="text-white">{t.name}</SelectItem>)}</SelectContent></Select>
                    <Select value={gameFieldId} onValueChange={setGameFieldId}><SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white h-11"><SelectValue placeholder="Assign to Field" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10"><SelectItem value="UNASSIGNED" className="text-white">Unassigned (None)</SelectItem>{fields.map(f => <SelectItem key={f.id} value={String(f.id)} className="text-white">{f.name}</SelectItem>)}</SelectContent></Select>
                    <Input value={newGameLabel} onChange={e => setNewGameLabel(e.target.value)} placeholder='Label (e.g. Round 1)' className="bg-[#0a0a0a] border-white/10 text-white h-11" />
                  </div>
                  <Button onClick={handleCreateGame} disabled={isCreatingGame} className="bg-[#FF6B00] text-white headline-font h-11 w-full md:w-auto">{isCreatingGame ? 'Creating...' : 'Create Game'}</Button>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 mb-4 border-t border-white/10 pt-8">
                  <h2 className="headline-font text-2xl text-white">GAMES LIST</h2>
                  <Select value={selectedFieldFilter} onValueChange={setSelectedFieldFilter}>
                    <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white w-full md:w-64 h-11"><SelectValue placeholder="Filter by Field" /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      <SelectItem value="ALL" className="text-white">All Fields / Games</SelectItem>
                      <SelectItem value="UNASSIGNED" className="text-white">Unassigned Games</SelectItem>
                      {fields.map(f => <SelectItem key={f.id} value={String(f.id)} className="text-white">{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {liveGames.length > 0 && (<div><h3 className="headline-font text-xl text-white mb-4 flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />LIVE ({liveGames.length})</h3><div className="space-y-4">{liveGames.map(g => (<div key={g.id} className="bg-[#1a1a1a] border-2 border-red-500/30 rounded-xl p-4 md:p-6">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4"><div className="flex items-center gap-2 flex-wrap"><span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs headline-font">LIVE</span>{g.label && <span className="text-[#FF6B00] text-sm headline-font">{g.label}</span>}</div><Button onClick={() => handleStatusChange(g.id, g.status)} className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 headline-font text-xs md:text-sm">End Game</Button></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                      <p className="headline-font text-base md:text-lg text-white">{getTeamName(g.team_a_id)}</p>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Button onClick={() => handleScoreChange(g.id,'team_a_score',false)} size="icon" variant="outline" className="border-white/10 text-white h-8 w-8 md:h-9 md:w-9"><Minus className="w-3.5 h-3.5" /></Button>
                        <span className="text-3xl md:text-4xl headline-font text-[#FF6B00] w-8 md:w-10 text-center">{g.team_a_score||0}</span>
                        <Button onClick={() => handleScoreChange(g.id,'team_a_score',true)} size="icon" className="bg-[#FF6B00] text-white h-8 w-8 md:h-9 md:w-9"><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                    <div className="text-center text-xl md:text-2xl text-gray-600 hidden md:block">VS</div>
                    <div className="flex items-center justify-between md:flex-col md:items-start gap-2">
                      <p className="headline-font text-base md:text-lg text-white">{getTeamName(g.team_b_id)}</p>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Button onClick={() => handleScoreChange(g.id,'team_b_score',false)} size="icon" variant="outline" className="border-white/10 text-white h-8 w-8 md:h-9 md:w-9"><Minus className="w-3.5 h-3.5" /></Button>
                        <span className="text-3xl md:text-4xl headline-font text-[#FF6B00] w-8 md:w-10 text-center">{g.team_b_score||0}</span>
                        <Button onClick={() => handleScoreChange(g.id,'team_b_score',true)} size="icon" className="bg-[#FF6B00] text-white h-8 w-8 md:h-9 md:w-9"><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                </div>))}</div></div>)}
                {scheduledGames.length > 0 && (<div><h3 className="headline-font text-xl text-white mb-4">SCHEDULED ({scheduledGames.length})</h3><div className="space-y-3">{scheduledGames.map(g => (<div key={g.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 md:p-5"><div className="flex items-center justify-between gap-2"><div className="flex-1 flex flex-col md:grid md:grid-cols-3 gap-1 md:gap-4 items-center"><p className="headline-font text-white text-sm md:text-base md:text-right">{getTeamName(g.team_a_id)}</p><div className="text-center"><span className="text-gray-600 text-xs md:text-base">VS</span>{g.label && <p className="text-[#FF6B00] text-xs headline-font">{g.label}</p>}</div><p className="headline-font text-white text-sm md:text-base">{getTeamName(g.team_b_id)}</p></div><div className="flex items-center gap-1.5 md:gap-2 ml-2 md:ml-4 flex-shrink-0"><Button onClick={() => handleStatusChange(g.id, g.status)} className="bg-[#FF6B00] text-white headline-font text-xs md:text-sm px-3 md:px-4">Start</Button><button onClick={() => handleDeleteGame(g.id)} className="text-gray-500 hover:text-red-400 p-1.5 md:p-2 transition-colors"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button></div></div></div>))}</div></div>)}
                {finalGames.length > 0 && (<div><h3 className="headline-font text-xl text-white mb-4">FINAL ({finalGames.length})</h3><div className="space-y-3">{finalGames.map(g => (<div key={g.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 md:p-5 opacity-60 hover:opacity-100 transition-opacity"><div className="flex items-center justify-between mb-3">{g.label && <span className="text-gray-500 text-xs headline-font">{g.label}</span>}<button onClick={() => handleDeleteGame(g.id)} className="text-gray-600 hover:text-red-400 p-1 transition-colors ml-auto"><Trash2 className="w-4 h-4" /></button></div><div className="grid grid-cols-3 gap-2 md:gap-4 items-center"><div className="text-right"><p className="headline-font text-white text-sm md:text-base">{getTeamName(g.team_a_id)}</p><p className="headline-font text-2xl md:text-3xl text-white">{g.team_a_score||0}</p></div><p className="text-center text-gray-600 text-sm">FINAL</p><div><p className="headline-font text-white text-sm md:text-base">{getTeamName(g.team_b_id)}</p><p className="headline-font text-2xl md:text-3xl text-white">{g.team_b_score||0}</p></div></div></div>))}</div></div>)}
              </div>
            )}
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-6">
            <SectionHeader title="Manage Gallery" />
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-6">
              <div>
                <label className="block text-white mb-2 headline-font text-sm">1. SELECT TOURNAMENT</label>
                <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}><SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white h-12"><SelectValue placeholder="Choose a completed tournament" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-white/10">{!completedTournaments.length ? <div className="p-4 text-gray-500 text-center text-sm">No completed tournaments</div> : completedTournaments.map(t => <SelectItem key={t.id} value={String(t.id)} className="text-white">{t.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div>
                <label className="block text-white mb-2 headline-font text-sm">2. UPLOAD FILES</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-[#FF6B00]/40 transition-colors">
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer"><div className="flex gap-4 justify-center mb-4"><div className="bg-[#FF6B00]/10 rounded-xl p-3"><ImageIcon className="w-6 h-6 text-[#FF6B00]" /></div><div className="bg-[#FF6B00]/10 rounded-xl p-3"><Video className="w-6 h-6 text-[#FF6B00]" /></div></div><p className="text-white font-medium">Click to upload or drag and drop</p><p className="text-gray-500 text-sm mt-1">Images and videos accepted (max 20MB each)</p></label>
                </div>
                {selectedFiles.length > 0 && <p className="text-gray-400 text-sm mt-3">{selectedFiles.length} file(s) selected</p>}
              </div>
              {uploadMessage.text && <p className={`text-sm ${uploadMessage.type==='success'?'text-green-400':'text-red-400'}`}>{uploadMessage.text}</p>}
              <SBtn onClick={handleGallerySubmit} disabled={uploading}>{uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload Media</>}</SBtn>
            </div>
          </div>
        );

      case 'reels':
        return (
          <div className="space-y-6">
            <SectionHeader title="Featured Reels" count={reels.length} />
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-4">
              <p className="text-gray-400 text-sm">On Instagram, tap ··· on a Reel → Embed → Copy embed code and paste below.</p>
              <STa value={newReelEmbedCode} onChange={e => setNewReelEmbedCode(e.target.value)} placeholder='<blockquote class="instagram-media"...></blockquote>' />
              {reelMessage.text && <p className={`text-sm ${reelMessage.type==='success'?'text-green-400':'text-red-400'}`}>{reelMessage.text}</p>}
              <SBtn onClick={handleAddReel} disabled={submittingReel}>{submittingReel ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : <><Film className="w-4 h-4 mr-2" />Add Reel</>}</SBtn>
            </div>
            {reels.length > 0 && (
              <T headers={['Embed Code Preview','Added On','Actions']}>
                {reels.map(r => <TR key={r.id}><TD className="font-mono text-xs max-w-sm truncate text-gray-400">{r.embed_html}</TD><TD>{format(new Date(r.created_at),'MMM d, yyyy')}</TD><TD><button onClick={() => handleDeleteReel(r.id)} className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4" /></button></TD></TR>)}
              </T>
            )}
          </div>
        );

      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#FF6B00] animate-spin" /></div>;

  const handleNavClick = (key) => { setActiveSection(key); setSidebarOpen(false); };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`w-64 fixed top-0 left-0 h-screen bg-[#111111] border-r border-white/10 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_3g32263g32263g32-Photoroom.svg" alt="KOTP" className="w-8 h-8" />
            <div>
              <p className="headline-font text-white text-base leading-tight">KOTP</p>
              <p className="text-gray-600 text-xs">Admin Portal</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-gray-600 text-xs uppercase tracking-widest font-medium px-3 mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button key={item.key} onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === item.key ? 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && <span className={`text-xs rounded-full px-2 py-0.5 ${activeSection === item.key ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'bg-white/10 text-gray-500'}`}>{item.count}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-4 border-t border-white/10 pt-4">
          <div className="hidden md:block bg-gradient-to-br from-[#FF6B00]/15 to-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-xl p-4 mb-3 text-center">
            <Trophy className="w-6 h-6 text-[#FF6B00] mx-auto mb-2" />
            <p className="text-white text-xs font-semibold">KOTP Dashboard</p>
            <p className="text-gray-600 text-xs mt-0.5">Season 2025–26</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen w-full">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10 px-4 md:px-8 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white p-1.5 -ml-1"><Menu className="w-5 h-5" /></button>
            <h1 className="headline-font text-lg md:text-xl text-white">{sectionTitle[activeSection]}</h1>
          </div>
          <p className="text-gray-600 text-xs md:text-sm hidden sm:block">{format(new Date(), 'EEEE, MMM d yyyy')}</p>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}