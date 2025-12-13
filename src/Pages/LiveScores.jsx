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
  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || "Team";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-red-500 rounded-lg p-8 md:p-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"></div>
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-white rounded-full" />
          <span className="headline-font text-sm">LIVE</span>
        </div>
      </div>
      <div className="relative z-10">
        <div className="grid grid-cols-3 gap-8 items-center">
          <div className="text-center md:text-right">
            <h3 className="headline-font text-3xl md:text-4xl text-white mb-4">{getTeamName(game.team_a_id)}</h3>
            <ScoreDisplay score={game.team_a_score} />
          </div>
          <div className="text-center">
            <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Screenshot%202025-12-09%20at%203.34.34%20pm-Photoroom.svg" alt="VS" className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ animationDuration: '8s' }} />
            <p className="text-4xl headline-font text-gray-500">VS</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="headline-font text-3xl md:text-4xl text-white mb-4">{getTeamName(game.team_b_id)}</h3>
            <ScoreDisplay score={game.team_b_score} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UpcomingGameCard = ({ game, teams }) => {
  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || "Team";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-[#FF6B00]" /><span className="text-gray-400 text-sm headline-font">UPCOMING</span></div>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1"><p className="headline-font text-xl text-white">{getTeamName(game.team_a_id)}</p></div>
        <div className="px-4"><span className="text-xl text-gray-500">VS</span></div>
        <div className="text-center flex-1"><p className="headline-font text-xl text-white">{getTeamName(game.team_b_id)}</p></div>
      </div>
    </motion.div>
  );
};

const FinalGameCard = ({ game, teams }) => {
  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || "Team";
  const teamAWon = (game.team_a_score || 0) > (game.team_b_score || 0);
  const teamBWon = (game.team_b_score || 0) > (game.team_a_score || 0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-gray-500" /><span className="text-gray-500 text-sm headline-font">FINAL</span></div>
      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="text-center"><p className={`headline-font text-xl mb-2 ${teamAWon ? 'text-[#FF6B00]' : 'text-white'}`}>{getTeamName(game.team_a_id)}</p><p className="text-3xl headline-font text-white">{game.team_a_score || 0}</p></div>
        <div className="text-center"><span className="text-xl text-gray-500">-</span></div>
        <div className="text-center"><p className={`headline-font text-xl mb-2 ${teamBWon ? 'text-[#FF6B00]' : 'text-white'}`}>{getTeamName(game.team_b_id)}</p><p className="text-3xl headline-font text-white">{game.team_b_score || 0}</p></div>
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

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const ongoingTournaments = await Tournament.filter({ status: "ongoing" });
      setTournaments(ongoingTournaments);
      if (ongoingTournaments.length > 0) {
        const defaultTournamentId = ongoingTournaments[0].id;
        setSelectedTournament(defaultTournamentId);
        const [initialGames, initialTeams] = await Promise.all([
          Game.filter({ tournament_id: defaultTournamentId }),
          Team.filter({ tournament_id: defaultTournamentId }),
        ]);
        setGames(initialGames);
        setTeams(initialTeams);
      }
      setLoading(false);
    };
    loadInitialData();
  }, []);

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

  const liveGames = games.filter(g => g.status === "LIVE");
  const upcomingGames = games.filter(g => g.status === "SCHEDULED");
  const finalGames = games.filter(g => g.status === "FINAL");

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_2q2yk2q2yk2q2yk2-Photoroom.svg" alt="Trophy" className="w-40 h-40 mx-auto mb-6" />
          <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">LIVE SCORES</h1>
          <p className="text-gray-400 text-xl">Follow the action in real-time</p>
        </motion.div>
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