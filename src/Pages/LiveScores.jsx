// src/Pages/LiveScores.jsx (FINAL - COMPLETE AND UNABBREVIATED)

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, CheckCircle, Zap, Loader2 } from "lucide-react";
import { Tournament, Game, Team } from "@/Entities/all";
import { supabase } from "@/supabaseClient";

const ScoreDisplay = ({ score }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={score} initial={{ scale: 1.5, color: "#FF6B00" }} animate={{ scale: 1, color: "#FFFFFF" }} transition={{ duration: 0.5 }} className="text-6xl md:text-8xl headline-font">
        {score || 0}
      </motion.div>
    </AnimatePresence>
  );
};

const LiveGameCard = ({ game, teams }) => {
  const getTeamName = (teamId) => teams.find(t => String(t.id) === String(teamId))?.name || "Team";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-red-500 rounded-lg p-6 md:p-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"></div>
      <div className="absolute top-4 right-4 z-10 flex flex-col md:flex-row items-end md:items-center gap-2">
        {game.label && <span className="bg-[#FF6B00]/20 text-[#FF6B00] px-3 py-1.5 md:py-2 rounded-full headline-font text-xs">{game.label}</span>}
        <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
          <span className="headline-font text-xs md:text-sm">LIVE</span>
        </div>
      </div>
      <div className="relative z-10 mt-10 md:mt-0">
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 items-center">
          <div className="text-center md:text-right w-full">
            <h3 className="headline-font text-2xl md:text-4xl text-white mb-2 md:mb-4 leading-tight">{getTeamName(game.team_a_id)}</h3>
            <ScoreDisplay score={game.team_a_score} />
          </div>
          <div className="text-center w-full flex flex-col items-center">
            <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Screenshot%202025-12-09%20at%203.34.34%20pm-Photoroom.svg" alt="VS" className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 animate-spin" style={{ animationDuration: '8s' }} />
            <p className="text-2xl md:text-4xl headline-font text-gray-500">VS</p>
          </div>
          <div className="text-center md:text-left w-full">
            <h3 className="headline-font text-2xl md:text-4xl text-white mb-2 md:mb-4 leading-tight">{getTeamName(game.team_b_id)}</h3>
            <ScoreDisplay score={game.team_b_score} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UpcomingGameCard = ({ game, teams }) => {
  const getTeamName = (teamId) => teams.find(t => String(t.id) === String(teamId))?.name || "Team";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Clock className="w-4 h-4 md:w-5 md:h-5 text-[#FF6B00]" /><span className="text-gray-400 text-xs md:text-sm headline-font">UPCOMING</span></div>
        {game.label && <span className="text-[#FF6B00] text-xs md:text-sm headline-font">{game.label}</span>}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
        <div className="text-center flex-1 w-full"><p className="headline-font text-lg md:text-xl text-white leading-tight">{getTeamName(game.team_a_id)}</p></div>
        <div className="px-4"><span className="text-lg md:text-xl text-gray-500">VS</span></div>
        <div className="text-center flex-1 w-full"><p className="headline-font text-lg md:text-xl text-white leading-tight">{getTeamName(game.team_b_id)}</p></div>
      </div>
    </motion.div>
  );
};

const FinalGameCard = ({ game, teams }) => {
  const getTeamName = (teamId) => teams.find(t => String(t.id) === String(teamId))?.name || "Team";
  const teamAWon = (game.team_a_score || 0) > (game.team_b_score || 0);
  const teamBWon = (game.team_b_score || 0) > (game.team_a_score || 0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-gray-500" /><span className="text-gray-500 text-xs md:text-sm headline-font">FINAL</span></div>
        {game.label && <span className="text-gray-500 text-xs md:text-sm headline-font">{game.label}</span>}
      </div>
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 items-center">
        <div className="text-center w-full"><p className={`headline-font text-lg md:text-xl mb-1 md:mb-2 leading-tight ${teamAWon ? 'text-[#FF6B00]' : 'text-white'}`}>{getTeamName(game.team_a_id)}</p><p className="text-3xl headline-font text-white">{game.team_a_score || 0}</p></div>
        <div className="text-center hidden md:block"><span className="text-xl text-gray-500">-</span></div>
        <div className="text-center w-full"><p className={`headline-font text-lg md:text-xl mb-1 md:mb-2 leading-tight ${teamBWon ? 'text-[#FF6B00]' : 'text-white'}`}>{getTeamName(game.team_b_id)}</p><p className="text-3xl headline-font text-white">{game.team_b_score || 0}</p></div>
      </div>
    </motion.div>
  );
};

export default function LiveScores() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load list of ongoing tournaments on mount
  useEffect(() => {
    const loadTournaments = async () => {
      setLoading(true);
      const ongoingTournaments = await Tournament.filter({ status: "ongoing" });
      setTournaments(ongoingTournaments);
      if (ongoingTournaments.length > 0) {
        setSelectedTournament(ongoingTournaments[0].id);
      }
      setLoading(false);
    };
    loadTournaments();
  }, []);

  // Load games + teams whenever selectedTournament changes
  useEffect(() => {
    if (!selectedTournament) return;
    const loadGamesAndTeams = async () => {
      const [gamesData, teamsData] = await Promise.all([
        Game.filter({ tournament_id: selectedTournament }),
        Team.filter({ tournament_id: selectedTournament }),
      ]);
      setGames(gamesData);
      setTeams(teamsData);
    };
    loadGamesAndTeams();
  }, [selectedTournament]);

  // Realtime subscription for live score updates
  useEffect(() => {
    if (!selectedTournament) return;
    const channel = supabase
      .channel(`games-live-feed-${selectedTournament}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `tournament_id=eq.${selectedTournament}` },
        (payload) => {
          console.log('Realtime update received!', payload);
          if (payload.eventType === 'INSERT') {
            setGames(current => [...current, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setGames(current => current.map(game => game.id === payload.new.id ? payload.new : game));
          } else if (payload.eventType === 'DELETE') {
            setGames(current => current.filter(game => game.id !== payload.old.id));
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedTournament]);

  const handleTournamentSwitch = (tournamentId) => {
    setSelectedTournament(tournamentId);
    setGames([]);
    setTeams([]);
  };

  const selectedTournamentName = tournaments.find(t => t.id === selectedTournament)?.name;
  const liveGames = games.filter(g => g.status === "LIVE");
  const upcomingGames = games.filter(g => g.status === "SCHEDULED");
  const finalGames = games.filter(g => g.status === "FINAL");

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">LIVE SCORES</h1>
          <p className="text-gray-400 text-xl">Follow the action in real-time</p>
        </motion.div>

        {/* Tournament selector — shown when multiple ongoing tournaments exist */}
        {tournaments.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {tournaments.map(t => (
              <button
                key={t.id}
                onClick={() => handleTournamentSwitch(t.id)}
                className={`px-6 py-3 rounded-full headline-font text-sm tracking-wider transition-all duration-300 ${
                  selectedTournament === t.id
                    ? 'bg-[#FF6B00] text-white glow-orange'
                    : 'bg-[#1a1a1a] text-gray-400 border border-white/10 hover:border-[#FF6B00]/50 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Show current tournament name */}
        {selectedTournamentName && (
          <p className="text-center text-[#FF6B00] headline-font text-2xl mt-6">{selectedTournamentName}</p>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? <div className="flex justify-center py-24"><Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" /></div> :
          tournaments.length === 0 ? <div className="text-center py-24"><p className="text-gray-500 text-xl">No ongoing tournaments at the moment</p></div> :
            games.length === 0 && !loading ? <div className="text-center py-24"><p className="text-gray-500 text-xl">No games scheduled yet for this tournament</p></div> : (
              <div className="space-y-16">
                {liveGames.length > 0 && (
                  <section><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8"><div className="flex items-center gap-3 mb-4"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 bg-red-500 rounded-full" /><h2 className="headline-font text-4xl md:text-5xl text-white">LIVE NOW</h2></div><div className="w-32 h-1 bg-red-500"></div></motion.div><div className="space-y-6">{liveGames.map((game) => (<LiveGameCard key={game.id} game={game} teams={teams} />))}</div></section>
                )}
                {upcomingGames.length > 0 && (
                  <section><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8"><h2 className="headline-font text-4xl md:text-5xl text-white mb-4">UPCOMING</h2><div className="w-32 h-1 bg-[#FF6B00]"></div></motion.div><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{upcomingGames.map((game) => (<UpcomingGameCard key={game.id} game={game} teams={teams} />))}</div></section>
                )}
                {finalGames.length > 0 && (
                  <section><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8"><h2 className="headline-font text-4xl md:text-5xl text-white mb-4">FINAL SCORES</h2><div className="w-32 h-1 bg-gray-500"></div></motion.div><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{finalGames.map((game) => (<FinalGameCard key={game.id} game={game} teams={teams} />))}</div></section>
                )}
              </div>
            )}
      </div>
    </div>
  );
}