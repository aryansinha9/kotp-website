import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Users,
  Upload,
  Film,
  Mail,
  Phone,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Trophy,
  Plus,
  Minus
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { format } from "date-fns";

const Section = ({ icon: Icon, title, count, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="bg-[#FF6B00]/10 rounded-lg p-3">
            <Icon className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <div className="text-left">
            <h2 className="headline-font text-2xl text-white">
              {title} {count !== undefined && `(${count})`}
            </h2>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-6 h-6 text-gray-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-white/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Gallery upload state
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadMessage, setUploadMessage] = useState({ type: "", text: "" });

  // Reel state
  const [embedCode, setEmbedCode] = useState("");
  const [reelMessage, setReelMessage] = useState({ type: "", text: "" });

  // Score control state
  const [selectedTournamentForScores, setSelectedTournamentForScores] = useState("");
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [scoreMessage, setScoreMessage] = useState({ type: "", text: "" });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          // Redirect to login with AdminDashboard as next page
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }

        const currentUser = await base44.auth.me();
        if (currentUser.role !== "admin") {
          // Not an admin, redirect to home
          window.location.href = "/";
          return;
        }
        setUser(currentUser);
      } catch (error) {
        // Error or not authenticated, redirect to login
        base44.auth.redirectToLogin(window.location.pathname);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch registrations
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ["registrations"],
    queryFn: () => base44.entities.Registration.list("-created_date"),
  });

  // Fetch tournaments
  const { data: tournaments = [] } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => base44.entities.Tournament.list(),
  });

  // Fetch featured reels
  const { data: reels = [], isLoading: reelsLoading } = useQuery({
    queryKey: ["reels"],
    queryFn: () => base44.entities.FeaturedReel.list("-created_date"),
  });

  // Fetch teams for selected tournament
  const { data: teams = [] } = useQuery({
    queryKey: ["teams", selectedTournamentForScores],
    queryFn: () => selectedTournamentForScores ? base44.entities.Team.filter({ tournament_id: selectedTournamentForScores }) : [],
    enabled: !!selectedTournamentForScores,
  });

  // Fetch games for selected tournament
  const { data: games = [] } = useQuery({
    queryKey: ["games", selectedTournamentForScores],
    queryFn: () => selectedTournamentForScores ? base44.entities.Game.filter({ tournament_id: selectedTournamentForScores }, "-created_date") : [],
    enabled: !!selectedTournamentForScores,
    refetchInterval: 3000,
  });

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: async ({ tournament_id, team_a_id, team_b_id }) => {
      return await base44.entities.Game.create({
        tournament_id,
        team_a_id,
        team_b_id,
        team_a_score: 0,
        team_b_score: 0,
        status: "SCHEDULED",
        start_time: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      setScoreMessage({ type: "success", text: "Game created successfully!" });
      setTeamAId("");
      setTeamBId("");
      setTimeout(() => setScoreMessage({ type: "", text: "" }), 3000);
    },
    onError: () => {
      setScoreMessage({ type: "error", text: "Failed to create game." });
    },
  });

  // Update score mutation
  const updateScoreMutation = useMutation({
    mutationFn: async ({ gameId, field, increment }) => {
      const game = games.find(g => g.id === gameId);
      const currentScore = game[field] || 0;
      const newScore = Math.max(0, currentScore + (increment ? 1 : -1));

      return await base44.entities.Game.update(gameId, {
        [field]: newScore
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });

  // Update game status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ gameId, newStatus }) => {
      return await base44.entities.Game.update(gameId, {
        status: newStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      setScoreMessage({ type: "success", text: "Game status updated!" });
      setTimeout(() => setScoreMessage({ type: "", text: "" }), 3000);
    },
    onError: () => {
      setScoreMessage({ type: "error", text: "Failed to update game status." });
    }
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async ({ tournamentId, files }) => {
      const uploadedMedia = [];

      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const fileType = file.type.startsWith("image/") ? "image" : "video";
        uploadedMedia.push({
          url: file_url,
          type: fileType,
          uploaded_date: new Date().toISOString()
        });
      }

      const tournament = tournaments.find(t => t.id === tournamentId);
      const existingMedia = tournament.gallery_media || [];

      await base44.entities.Tournament.update(tournamentId, {
        gallery_media: [...existingMedia, ...uploadedMedia]
      });

      return uploadedMedia;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setUploadMessage({ type: "success", text: "All files uploaded successfully!" });
      setSelectedFiles([]);
      setSelectedTournament("");
      setTimeout(() => setUploadMessage({ type: "", text: "" }), 5000);
    },
    onError: (error) => {
      setUploadMessage({ type: "error", text: "Failed to upload files. Please try again." });
    },
  });

  // Add reel mutation
  const addReelMutation = useMutation({
    mutationFn: async (embedCode) => {
      // Extract URL from embed code if possible
      const urlMatch = embedCode.match(/src="([^"]+)"/);
      const previewUrl = urlMatch ? urlMatch[1] : "";

      return await base44.entities.FeaturedReel.create({
        embed_code: embedCode,
        preview_url: previewUrl,
        added_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      setReelMessage({ type: "success", text: "Reel added successfully!" });
      setEmbedCode("");
      setTimeout(() => setReelMessage({ type: "", text: "" }), 5000);
    },
    onError: () => {
      setReelMessage({ type: "error", text: "Failed to add reel. Please try again." });
    },
  });

  // Delete reel mutation
  const deleteReelMutation = useMutation({
    mutationFn: (reelId) => base44.entities.FeaturedReel.delete(reelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      setReelMessage({ type: "success", text: "Reel deleted successfully!" });
      setTimeout(() => setReelMessage({ type: "", text: "" }), 3000);
    },
  });

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setUploadMessage({ type: "", text: "" });
  };

  const handleUploadMedia = () => {
    if (!selectedTournament || selectedFiles.length === 0) {
      setUploadMessage({ type: "error", text: "Please select a tournament and at least one file." });
      return;
    }
    uploadMediaMutation.mutate({ tournamentId: selectedTournament, files: selectedFiles });
  };

  const handleAddReel = () => {
    if (!embedCode.trim()) {
      setReelMessage({ type: "error", text: "Please paste an embed code." });
      return;
    }
    addReelMutation.mutate(embedCode);
  };

  const handleDeleteReel = (reelId) => {
    if (window.confirm("Are you sure you want to delete this reel?")) {
      deleteReelMutation.mutate(reelId);
    }
  };

  const handleCreateGame = () => {
    if (!selectedTournamentForScores || !teamAId || !teamBId) {
      setScoreMessage({ type: "error", text: "Please select a tournament and both teams." });
      return;
    }
    if (teamAId === teamBId) {
      setScoreMessage({ type: "error", text: "Teams must be different." });
      return;
    }
    createGameMutation.mutate({
      tournament_id: selectedTournamentForScores,
      team_a_id: teamAId,
      team_b_id: teamBId
    });
  };

  const handleScoreChange = (gameId, field, increment) => {
    updateScoreMutation.mutate({ gameId, field, increment });
  };

  const handleStatusChange = (gameId, currentStatus) => {
    const newStatus = currentStatus === "SCHEDULED" ? "LIVE" : "FINAL";
    updateStatusMutation.mutate({ gameId, newStatus });
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  const completedTournaments = tournaments.filter(t => t.status === "completed");
  const ongoingTournaments = tournaments.filter(t => t.status === "ongoing");

  const liveGames = games.filter(g => g.status === "LIVE");
  const scheduledGames = games.filter(g => g.status === "SCHEDULED");
  const finalGames = games.filter(g => g.status === "FINAL");

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="headline-font text-5xl md:text-6xl text-white mb-2">
              ADMIN DASHBOARD
            </h1>
            <p className="text-gray-400">Manage your tournaments and content</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 px-6 py-3 rounded-md headline-font tracking-wider flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            LOGOUT
          </button>
        </div>

        <div className="space-y-6">
          {/* Section 1: Registrations */}
          <Section
            icon={Users}
            title="REGISTRATIONS"
            count={registrations.length}
            defaultOpen={true}
          >
            {registrationsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No registrations yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400">Team Name</TableHead>
                      <TableHead className="text-gray-400">Tournament</TableHead>
                      <TableHead className="text-gray-400">Contact Person</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Phone</TableHead>
                      <TableHead className="text-gray-400">Division</TableHead>
                      <TableHead className="text-gray-400">Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white font-medium">
                          {reg.team_name || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-300">{reg.tournament}</TableCell>
                        <TableCell className="text-gray-300">{reg.contact_person}</TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${reg.email}`}
                            className="text-[#FF6B00] hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-4 h-4" />
                            {reg.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`tel:${reg.phone}`}
                            className="text-[#FF6B00] hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-4 h-4" />
                            {reg.phone}
                          </a>
                        </TableCell>
                        <TableCell className="text-gray-300">{reg.division}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              reg.payment_status === "paid"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            }
                          >
                            {reg.payment_status === "paid" ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Section>

          {/* NEW: Section - Score Control Panel */}
          <Section icon={Trophy} title="SCORE CONTROL PANEL">
            <div className="space-y-6">
              {/* Tournament Selector */}
              <div>
                <label className="block text-white mb-2 headline-font text-sm">
                  SELECT AN ONGOING TOURNAMENT
                </label>
                <Select value={selectedTournamentForScores} onValueChange={setSelectedTournamentForScores}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]">
                    <SelectValue placeholder="Choose an ongoing tournament" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {ongoingTournaments.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">
                        No ongoing tournaments available
                      </div>
                    ) : (
                      ongoingTournaments.map((tournament) => (
                        <SelectItem
                          key={tournament.id}
                          value={tournament.id}
                          className="text-white hover:bg-white/5"
                        >
                          {tournament.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedTournamentForScores && (
                <>
                  {/* Game Creation Form */}
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                    <h3 className="headline-font text-xl text-white mb-4">CREATE NEW GAME</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select value={teamAId} onValueChange={setTeamAId}>
                        <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                          <SelectValue placeholder="Select Team A" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id} className="text-white hover:bg-white/5">
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={teamBId} onValueChange={setTeamBId}>
                        <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                          <SelectValue placeholder="Select Team B" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id} className="text-white hover:bg-white/5">
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={handleCreateGame}
                        disabled={createGameMutation.isPending}
                        className="kotp-button bg-[#FF6B00] text-white headline-font"
                      >
                        {createGameMutation.isPending ? "CREATING..." : "CREATE GAME"}
                      </Button>
                    </div>
                  </div>

                  {scoreMessage.text && (
                    <Alert className={scoreMessage.type === "success" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}>
                      {scoreMessage.type === "success" ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                      <AlertDescription className={scoreMessage.type === "success" ? "text-green-400" : "text-red-400"}>
                        {scoreMessage.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Live Games */}
                  {liveGames.length > 0 && (
                    <div>
                      <h3 className="headline-font text-2xl text-white mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE GAMES ({liveGames.length})
                      </h3>
                      <div className="space-y-4">
                        {liveGames.map((game) => (
                          <div key={game.id} className="bg-[#0a0a0a] border-2 border-red-500/30 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs headline-font">LIVE</span>
                              <Button
                                onClick={() => handleStatusChange(game.id, game.status)}
                                className="bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/5 headline-font"
                              >
                                END GAME
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="text-right">
                                <p className="headline-font text-xl text-white mb-2">{getTeamName(game.team_a_id)}</p>
                                <div className="flex items-center justify-end gap-2">
                                  <Button onClick={() => handleScoreChange(game.id, "team_a_score", false)} size="icon" variant="outline" className="border-white/10 text-white">
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="text-4xl headline-font text-[#FF6B00]">{game.team_a_score || 0}</span>
                                  <Button onClick={() => handleScoreChange(game.id, "team_a_score", true)} size="icon" className="bg-[#FF6B00] text-white">
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="text-center">
                                <span className="text-3xl text-gray-500">VS</span>
                              </div>

                              <div className="text-left">
                                <p className="headline-font text-xl text-white mb-2">{getTeamName(game.team_b_id)}</p>
                                <div className="flex items-center gap-2">
                                  <Button onClick={() => handleScoreChange(game.id, "team_b_score", false)} size="icon" variant="outline" className="border-white/10 text-white">
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="text-4xl headline-font text-[#FF6B00]">{game.team_b_score || 0}</span>
                                  <Button onClick={() => handleScoreChange(game.id, "team_b_score", true)} size="icon" className="bg-[#FF6B00] text-white">
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduled Games */}
                  {scheduledGames.length > 0 && (
                    <div>
                      <h3 className="headline-font text-2xl text-white mb-4">SCHEDULED GAMES ({scheduledGames.length})</h3>
                      <div className="space-y-4">
                        {scheduledGames.map((game) => (
                          <div key={game.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                                <div className="text-right">
                                  <p className="headline-font text-lg text-white">{getTeamName(game.team_a_id)}</p>
                                  <span className="text-2xl headline-font text-gray-500">{game.team_a_score || 0}</span>
                                </div>
                                <div className="text-center">
                                  <span className="text-xl text-gray-500">VS</span>
                                </div>
                                <div className="text-left">
                                  <p className="headline-font text-lg text-white">{getTeamName(game.team_b_id)}</p>
                                  <span className="text-2xl headline-font text-gray-500">{game.team_b_score || 0}</span>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleStatusChange(game.id, game.status)}
                                className="bg-[#FF6B00] text-white headline-font ml-4"
                              >
                                START GAME
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final Games */}
                  {finalGames.length > 0 && (
                    <div>
                      <h3 className="headline-font text-2xl text-white mb-4">FINAL SCORES ({finalGames.length})</h3>
                      <div className="space-y-4">
                        {finalGames.map((game) => (
                          <div key={game.id} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 opacity-75">
                            <div className="flex items-center justify-between mb-2">
                              <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs headline-font">FINAL</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="text-right">
                                <p className="headline-font text-lg text-white">{getTeamName(game.team_a_id)}</p>
                                <span className="text-3xl headline-font text-white">{game.team_a_score || 0}</span>
                              </div>
                              <div className="text-center">
                                <span className="text-xl text-gray-500">VS</span>
                              </div>
                              <div className="text-left">
                                <p className="headline-font text-lg text-white">{getTeamName(game.team_b_id)}</p>
                                <span className="text-3xl headline-font text-white">{game.team_b_score || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Section>

          {/* Section 2: Manage Tournament Gallery */}
          <Section icon={Upload} title="MANAGE TOURNAMENT GALLERY">
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 headline-font text-sm">
                  SELECT A TOURNAMENT
                </label>
                <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00]">
                    <SelectValue placeholder="Choose a completed tournament" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {completedTournaments.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">
                        No completed tournaments available
                      </div>
                    ) : (
                      completedTournaments.map((tournament) => (
                        <SelectItem
                          key={tournament.id}
                          value={tournament.id}
                          className="text-white hover:bg-white/5"
                        >
                          {tournament.name} - {format(new Date(tournament.date), "MMM d, yyyy")}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white mb-2 headline-font text-sm">
                  UPLOAD FILES
                </label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-[#FF6B00]/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex gap-4">
                        <div className="bg-[#FF6B00]/10 rounded-lg p-4">
                          <ImageIcon className="w-8 h-8 text-[#FF6B00]" />
                        </div>
                        <div className="bg-[#FF6B00]/10 rounded-lg p-4">
                          <Video className="w-8 h-8 text-[#FF6B00]" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-gray-400 text-sm">
                          Images and videos accepted (Multiple files supported)
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
                    <p className="text-white font-semibold mb-2">
                      Selected {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}:
                    </p>
                    <ul className="text-gray-400 text-sm space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {uploadMessage.text && (
                <Alert
                  className={
                    uploadMessage.type === "success"
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }
                >
                  {uploadMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription
                    className={
                      uploadMessage.type === "success" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {uploadMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleUploadMedia}
                disabled={uploadMediaMutation.isPending}
                className="w-full kotp-button bg-[#FF6B00] text-white py-6 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {uploadMediaMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    UPLOADING...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    UPLOAD MEDIA
                  </>
                )}
              </Button>
            </div>
          </Section>

          {/* Section 3: Manage Featured Reels */}
          <Section icon={Film} title="MANAGE FEATURED REELS" count={reels.length}>
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 headline-font text-sm">
                  ADD NEW REEL
                </label>
                <p className="text-gray-400 text-sm mb-3">
                  On Instagram, click the three dots on a Reel → Embed → Copy the embed code and paste it below
                </p>
                <Textarea
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  placeholder='<iframe src="https://www.instagram.com/reel/..." width="400" height="480" frameborder="0"></iframe>'
                  className="bg-[#0a0a0a] border-white/10 text-white focus:border-[#FF6B00] min-h-[120px] font-mono text-sm"
                />
              </div>

              {reelMessage.text && (
                <Alert
                  className={
                    reelMessage.type === "success"
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }
                >
                  {reelMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription
                    className={
                      reelMessage.type === "success" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {reelMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleAddReel}
                disabled={addReelMutation.isPending}
                className="w-full kotp-button bg-[#FF6B00] text-white py-4 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {addReelMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ADDING...
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5 mr-2" />
                    ADD REEL
                  </>
                )}
              </Button>

              {/* Reels Table */}
              {reelsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
                </div>
              ) : reels.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No featured reels yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-gray-400">Preview</TableHead>
                        <TableHead className="text-gray-400">Added On</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reels.map((reel) => (
                        <TableRow key={reel.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-gray-300 font-mono text-xs max-w-md truncate">
                            {reel.preview_url || reel.embed_code.substring(0, 60) + "..."}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {format(new Date(reel.added_date || reel.created_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleDeleteReel(reel.id)}
                              disabled={deleteReelMutation.isPending}
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}