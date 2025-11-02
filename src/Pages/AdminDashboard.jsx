// src/Pages/AdminDashboard.jsx (New Redesigned Version with Live Data)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Registration, FeaturedReel, Tournament, MediaItem } from '@/Entities/all';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, LogOut, Users, Upload, Film, Mail, Phone, Trash2, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Video } from "lucide-react";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";

// --- STYLED HELPER COMPONENTS ---
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
  // --- TRANSPLANTED: All state from our old, functional dashboard ---
  const [registrations, setRegistrations] = useState([]);
  const [reels, setReels] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newReelEmbedCode, setNewReelEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: "", text: "" });
  const [submittingReel, setSubmittingReel] = useState(false);
  const [reelMessage, setReelMessage] = useState({ type: "", text: "" });

  // --- TRANSPLANTED: All data fetching and handler functions ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [regData, reelData, tournamentData] = await Promise.all([
          Registration.list(), FeaturedReel.list(), Tournament.list('start_date'),
        ]);
        setRegistrations(regData);
        setReels(reelData);
        setTournaments(tournamentData.filter(t => t.status === 'completed'));
      } catch (error) { console.error("Failed to load dashboard data", error); } 
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/admin'); };
  const handleFileChange = (e) => { setSelectedFiles(Array.from(e.target.files)); setUploadMessage({ type: "", text: "" }); };
  const getStatusBadge = (status) => (status === 'paid' ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">Paid</span> : <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Unpaid</span>);
  
  const handleGallerySubmit = async () => {
    if (!selectedTournamentId || selectedFiles.length === 0) {
      setUploadMessage({ type: "error", text: "Please select a tournament and at least one file." }); return;
    }
    setUploading(true); setUploadMessage({ type: "", text: "" });
    const uploadPromises = selectedFiles.map(file => MediaItem.upload(file, selectedTournamentId));
    const results = await Promise.all(uploadPromises);
    const failedUploads = results.filter(result => result.error);
    if (failedUploads.length > 0) {
      setUploadMessage({ type: "error", text: `${failedUploads.length} out of ${selectedFiles.length} files failed to upload.` });
    } else {
      setUploadMessage({ type: "success", text: "All files uploaded successfully!" });
      setSelectedFiles([]); document.getElementById('file-upload').value = "";
      setTimeout(() => setUploadMessage({ type: "", text: "" }), 5000);
    }
    setUploading(false);
  };
  
  const handleAddReel = async () => {
    if (!newReelEmbedCode.trim()) {
      setReelMessage({ type: "error", text: "Please paste an embed code." }); return;
    }
    setSubmittingReel(true); setReelMessage({ type: "", text: "" });
    const { error } = await FeaturedReel.create({ embed_html: newReelEmbedCode });
    if (error) { setReelMessage({ type: "error", text: `Failed to add reel: ${error.message}` }); } 
    else {
      setReelMessage({ type: "success", text: "Reel added successfully!" });
      setNewReelEmbedCode(''); await loadData();
      setTimeout(() => setReelMessage({ type: "", text: "" }), 5000);
    }
    setSubmittingReel(false);
  };

  const handleDeleteReel = async (reelId) => {
    if (window.confirm("Are you sure you want to delete this reel?")) {
      const { error } = await FeaturedReel.deleteById(reelId);
      if (error) { setReelMessage({ type: "error", text: `Failed to delete reel: ${error.message}` }); }
      else { setReelMessage({ type: "success", text: "Reel deleted."}); await loadData(); setTimeout(() => setReelMessage({ type: "", text: "" }), 3000); }
    }
  };

  if (loading) { return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" /></div>; }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="headline-font text-5xl md:text-6xl text-white mb-2">ADMIN DASHBOARD</h1>
            <p className="text-gray-400">Manage your tournaments and content</p>
          </div>
          <button onClick={handleLogout} className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 px-6 py-3 rounded-md headline-font tracking-wider flex items-center gap-2 transition-colors">
            <LogOut className="w-5 h-5" />LOGOUT
          </button>
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

          <Section icon={Upload} title="MANAGE TOURNAMENT GALLERY">
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 headline-font text-sm">1. SELECT A TOURNAMENT</label>
                <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] h-12"><SelectValue placeholder="Choose a completed tournament" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {tournaments.length === 0 ? <div className="p-4 text-gray-500 text-center">No completed tournaments</div> : tournaments.map((t) => (<SelectItem key={t.id} value={String(t.id)} className="text-white hover:bg-white/5">{t.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-white mb-2 headline-font text-sm">2. UPLOAD FILES</label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-[#FF6B00]/50 transition-colors">
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer"><div className="flex flex-col items-center gap-4"><div className="flex gap-4"><div className="bg-[#FF6B00]/10 rounded-lg p-4"><ImageIcon className="w-8 h-8 text-[#FF6B00]" /></div><div className="bg-[#FF6B00]/10 rounded-lg p-4"><Video className="w-8 h-8 text-[#FF6B00]" /></div></div><div><p className="text-white font-semibold mb-1">Click to upload or drag and drop</p><p className="text-gray-400 text-sm">Images and videos accepted</p></div></div></label>
                </div>
                {selectedFiles.length > 0 && <div className="mt-4 text-gray-400 text-sm">Selected {selectedFiles.length} file(s).</div>}
              </div>
              {uploadMessage.text && <div className={`text-sm ${uploadMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>{uploadMessage.text}</div>}
              <StyledButton onClick={handleGallerySubmit} disabled={uploading}>
                {uploading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> UPLOADING...</> : <><Upload className="w-5 h-5 mr-2" /> UPLOAD MEDIA</>}
              </StyledButton>
            </div>
          </Section>

          <Section icon={Film} title="MANAGE FEATURED REELS" count={reels.length}>
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 headline-font text-sm">ADD NEW REEL</label>
                <p className="text-gray-400 text-sm mb-3">On Instagram, click the three dots on a Reel → Embed → Copy the embed code and paste it below</p>
                <StyledTextarea value={newReelEmbedCode} onChange={(e) => setNewReelEmbedCode(e.target.value)} placeholder='<blockquote class="instagram-media"...></blockquote>' />
              </div>
              {reelMessage.text && <div className={`text-sm ${reelMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>{reelMessage.text}</div>}
              <StyledButton onClick={handleAddReel} disabled={submittingReel}>
                {submittingReel ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> ADDING...</> : <><Film className="w-5 h-5 mr-2" /> ADD REEL</>}
              </StyledButton>
              {reels.length > 0 && (
                <StyledTable headers={["Preview", "Added On", "Actions"]}>
                  {reels.map((reel) => (
                    <StyledTableRow key={reel.id}>
                      <StyledTableCell className="font-mono text-xs max-w-md truncate">{reel.embed_html}</StyledTableCell>
                      <StyledTableCell>{format(new Date(reel.created_at), "MMM d, yyyy")}</StyledTableCell>
                      <StyledTableCell className="text-right">
                        <button onClick={() => handleDeleteReel(reel.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md"><Trash2 className="w-4 h-4" /></button>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </StyledTable>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}