import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Registration, FeaturedReel, Tournament, MediaItem, YouTubeVideo } from '@/Entities/all';
import { Loader2, Trash2, UploadCloud, Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/ui/accordion";
import { format } from 'date-fns';

export default function AdminDashboard() {
  const navigate = useNavigate();
  // State variables
  const [registrations, setRegistrations] = useState([]);
  const [reels, setReels] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [newReelEmbedCode, setNewReelEmbedCode] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [submittingReel, setSubmittingReel] = useState(false);
  const [reelError, setReelError] = useState('');
  const [submittingVideo, setSubmittingVideo] = useState(false);
  const [videoError, setVideoError] = useState('');

  // Data Loading
  const loadData = async () => {
    try {
      setLoading(true);
      const [regData, reelData, tournamentData, videoData] = await Promise.all([
        Registration.list(),
        FeaturedReel.list(),
        Tournament.list('start_date'),
        YouTubeVideo.list(),
      ]);
      setRegistrations(regData);
      setReels(reelData);
      setTournaments(tournamentData.filter(t => t.status === 'completed'));
      setYoutubeVideos(videoData);
    } catch (error) { 
      console.error("Failed to load dashboard data", error);
    } 
    finally { 
      setLoading(false); 
    }
  };
  useEffect(() => { loadData(); }, []);

  // Handler Functions
  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/admin'); };
  const handleFileSelect = (e) => { setFilesToUpload(Array.from(e.target.files)); };
  const getStatusBadgeVariant = (status) => (status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800');

  const handleAddReel = async (e) => {
    e.preventDefault();
    if (!newReelEmbedCode) return;
    setSubmittingReel(true);
    setReelError('');
    const urlRegex = /https:\/\/www\.instagram\.com\/reel\/[a-zA-Z0-9_-]+\/?/;
    const foundUrl = newReelEmbedCode.match(urlRegex);
    const reelData = { embed_html: newReelEmbedCode, instagram_url: foundUrl ? foundUrl[0] : null };
    const { error } = await FeaturedReel.create(reelData);
    if (error) { setReelError(`Failed to add reel: ${error.message}`); } 
    else { setNewReelEmbedCode(''); await loadData(); }
    setSubmittingReel(false);
  };

  const handleDeleteReel = async (reelId) => {
    if (window.confirm('Are you sure you want to delete this moment?')) {
        const { error } = await FeaturedReel.deleteById(reelId);
        if (error) { setReelError(`Failed to delete reel: ${error.message}`); } 
        else { await loadData(); }
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (filesToUpload.length === 0 || !selectedTournamentId) {
        setGalleryError('Please select a tournament and at least one file.');
        return;
    }
    setUploading(true);
    setGalleryError('');
    const uploadPromises = filesToUpload.map(file => MediaItem.upload(file, selectedTournamentId));
    const results = await Promise.all(uploadPromises);
    const failedUploads = results.filter(result => result.error);
    if (failedUploads.length > 0) {
        setGalleryError(`${failedUploads.length} out of ${filesToUpload.length} files failed to upload.`);
    } else {
        alert('All files uploaded successfully!');
        setFilesToUpload([]);
        document.getElementById('file-upload').value = ""; 
    }
    setUploading(false);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newVideoUrl) return;
    setSubmittingVideo(true);
    setVideoError('');
    const { error } = await YouTubeVideo.create({ youtube_url: newVideoUrl });
    if (error) { setVideoError(`Failed to add video: ${error.message}`); } 
    else { setNewVideoUrl(''); await loadData(); }
    setSubmittingVideo(false);
  };

  const handleSetFeatured = async (videoId) => {
    const { error } = await YouTubeVideo.setFeatured(videoId);
    if (error) { setVideoError(`Failed to set featured: ${error.message}`); }
    else { await loadData(); }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      const { error } = await YouTubeVideo.deleteById(videoId);
      if (error) { setVideoError(`Failed to delete video: ${error.message}`); }
      else { await loadData(); }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="destructive" className="bg-red-600 text-white hover:bg-red-700">Logout</Button>
      </div>

      <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-4">
        <AccordionItem value="item-1" className="bg-white rounded-2xl shadow-lg border-none">
          <AccordionTrigger className="text-2xl font-semibold p-6">Registrations ({registrations.length})</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            {loading ? (<div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>) : (<div className="border rounded-lg overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Team Name</TableHead><TableHead>Tournament</TableHead><TableHead>Contact Person</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Age Group</TableHead><TableHead>Division</TableHead><TableHead>Payment</TableHead><TableHead>Special Requests</TableHead></TableRow></TableHeader><TableBody>{registrations.map((reg) => (<TableRow key={reg.id}><TableCell className="font-medium">{reg.team_name}</TableCell><TableCell>{reg.tournaments ? reg.tournaments.name : 'N/A'}</TableCell><TableCell>{reg.contact_person}</TableCell><TableCell>{reg.email}</TableCell><TableCell>{reg.phone}</TableCell><TableCell>{reg.age_group || 'N/A'}</TableCell><TableCell>{reg.division || 'N/A'}</TableCell><TableCell><Badge className={`capitalize ${getStatusBadgeVariant(reg.payment_status)}`}>{reg.payment_status}</Badge></TableCell><TableCell>{reg.special_requirements || 'None'}</TableCell></TableRow>))}</TableBody></Table></div>)}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="bg-white rounded-2xl shadow-lg border-none">
          <AccordionTrigger className="text-2xl font-semibold p-6">Manage Tournament Gallery</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <form onSubmit={handleGallerySubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">1. Select a Tournament</label>
                    <Select onValueChange={setSelectedTournamentId} value={selectedTournamentId}>
                        <SelectTrigger><SelectValue placeholder="Choose a completed tournament..." /></SelectTrigger>
                        <SelectContent>
                            {tournaments.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">2. Choose Photos/Videos</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                            <div className="flex text-sm text-slate-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500"><span>Upload files</span><input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileSelect} /></label><p className="pl-1">or drag and drop</p></div>
                            <p className="text-xs text-slate-500">Images and Videos</p>
                        </div>
                    </div>
                </div>
                {filesToUpload.length > 0 && (<div className="text-sm text-slate-600">Selected {filesToUpload.length} file(s): {filesToUpload.map(f => f.name).join(', ')}</div>)}
                {galleryError && <p className="text-red-500 text-sm">{galleryError}</p>}
                <div className="text-right"><Button type="submit" disabled={uploading}>{uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Upload Media</Button></div>
            </form>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="bg-white rounded-2xl shadow-lg border-none">
          <AccordionTrigger className="text-2xl font-semibold p-6">Manage Moments (Instagram Reels)</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <p className="text-sm text-slate-500 mb-4">Go to an Instagram Reel, click `...`, choose "Embed", and paste the code here.</p>
            <form onSubmit={handleAddReel} className="flex flex-col gap-4 mb-6">
              <Textarea placeholder="<blockquote class=&#34;instagram-media&#34;..." value={newReelEmbedCode} onChange={(e) => setNewReelEmbedCode(e.target.value)} className="font-mono text-xs" rows={5} />
              <Button type="submit" disabled={submittingReel} className="self-end">{submittingReel && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Moment</Button>
            </form>
            {reelError && <p className="text-red-600 text-sm mb-4">{reelError}</p>}
            <h3 className="text-lg font-semibold mb-2">Current Moments</h3>
            <div className="border rounded-lg"><Table><TableHeader><TableRow><TableHead>Preview</TableHead><TableHead>Status</TableHead><TableHead>Added On</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{loading ? (<TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" /></TableCell></TableRow>) : (reels.map((reel) => (<TableRow key={reel.id}><TableCell className="font-mono text-xs truncate max-w-sm">{reel.embed_html || reel.instagram_url || 'No Content'}</TableCell><TableCell>{reel.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell><TableCell>{format(new Date(reel.created_at), 'MMM d, yyyy')}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteReel(reel.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell></TableRow>)))}</TableBody></Table></div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4" className="bg-white rounded-2xl shadow-lg border-none">
          <AccordionTrigger className="text-2xl font-semibold p-6">Manage YouTube Videos</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <form onSubmit={handleAddVideo} className="flex flex-col md:flex-row gap-4 mb-6">
              <Input type="url" placeholder="Paste YouTube video URL here..." value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} className="flex-grow" />
              <Button type="submit" disabled={submittingVideo}>{submittingVideo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Video</Button>
            </form>
            {videoError && <p className="text-red-600 text-sm mb-4">{videoError}</p>}
            <div className="border rounded-lg"><Table>
              <TableHeader><TableRow><TableHead>Video URL</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? (<TableRow><TableCell colSpan={3} className="text-center"><Loader2 /></TableCell></TableRow>) : youtubeVideos.length === 0 ? (<TableRow><TableCell colSpan={3} className="text-center text-slate-500 py-4">No YouTube videos added yet</TableCell></TableRow>) : (
                  youtubeVideos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell className="font-mono text-xs"><a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{video.youtube_url}</a></TableCell>
                      <TableCell>{video.is_featured && <Badge className="bg-amber-400">Featured</Badge>}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleSetFeatured(video.id)} disabled={video.is_featured} className="flex items-center"><Star className="h-4 w-4 mr-2" />Set as Featured</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteVideo(video.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table></div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}