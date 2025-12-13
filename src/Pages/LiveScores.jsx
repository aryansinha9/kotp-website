import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, CheckCircle, Zap, Loader2 } from "lucide-react";

const ScoreDisplay = ({ score, isAnimating }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={score}
        initial={{ scale: 1.5, color: "#FF6B00" }}
        animate={{ scale: 1, color: "#FFFFFF" }}
        transition={{ duration: 0.5 }}
        className="text-6xl md:text-8xl headline-font"
      >
        {score || 0}
      </motion.div>
    </AnimatePresence>
  );
};

const LiveGameCard = ({ game, teams }) => {
  const [prevScoreA, setPrevScoreA] = useState(game.team_a_score);
  const [prevScoreB, setPrevScoreB] = useState(game.team_b_score);
  const [animatingA, setAnimatingA] = useState(false);
  const [animatingB, setAnimatingB] = useState(false);

  useEffect(() => {
    if (game.team_a_score !== prevScoreA) {
      setAnimatingA(true);
      setPrevScoreA(game.team_a_score);
      setTimeout(() => setAnimatingA(false), 500);
    }
    if (game.team_b_score !== prevScoreB) {
      setAnimatingB(true);
      setPrevScoreB(game.team_b_score);
      setTimeout(() => setAnimatingB(false), 500);
    }
  }, [game.team_a_score, game.team_b_score, prevScoreA, prevScoreB]);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Team";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-red-500 rounded-lg p-8 md:p-12 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"></div>

      {/* Live Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-white rounded-full"
          />
          <span className="headline-font text-sm">LIVE</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-3 gap-8 items-center">
          {/* Team A */}
          <div className="text-center md:text-right">
            <motion.h3
              className="headline-font text-3xl md:text-4xl text-white mb-4"
              animate={animatingA ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {getTeamName(game.team_a_id)}
            </motion.h3>
            <ScoreDisplay score={game.team_a_score} isAnimating={animatingA} />
          </div>

          {/* VS */}
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <img
                src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Screenshot%202025-12-09%20at%203.34.34%20pm-Photoroom.svg"
                alt="VS"
                className="w-12 h-12"
              />
            </motion.div>
            <p className="text-4xl headline-font text-gray-500">VS</p>
          </div>

          {/* Team B */}
          <div className="text-center md:text-left">
            <motion.h3
              className="headline-font text-3xl md:text-4xl text-white mb-4"
              animate={animatingB ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {getTeamName(game.team_b_id)}
            </motion.h3>
            <ScoreDisplay score={game.team_b_score} isAnimating={animatingB} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UpcomingGameCard = ({ game, teams }) => {
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Team";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[#FF6B00]" />
        <span className="text-gray-400 text-sm headline-font">UPCOMING</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="headline-font text-xl text-white">{getTeamName(game.team_a_id)}</p>
        </div>
        <div className="px-4">
          <span className="text-xl text-gray-500">VS</span>
        </div>
        <div className="text-center flex-1">
          <p className="headline-font text-xl text-white">{getTeamName(game.team_b_id)}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FinalGameCard = ({ game, teams }) => {
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Team";
  };

  const teamAWon = (game.team_a_score || 0) > (game.team_b_score || 0);
  const teamBWon = (game.team_b_score || 0) > (game.team_a_score || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-gray-500" />
        <span className="text-gray-500 text-sm headline-font">FINAL</span>
      </div>
      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="text-center">
          <p className={`headline-font text-xl mb-2 ${teamAWon ? 'text-[#FF6B00]' : 'text-white'}`}>
            {getTeamName(game.team_a_id)}
          </p>
          <p className="text-3xl headline-font text-white">{game.team_a_score || 0}</p>
        </div>
        <div className="text-center">
          <span className="text-xl text-gray-500">-</span>
        </div>
        <div className="text-center">
          <p className={`headline-font text-xl mb-2 ${teamBWon ? 'text-[#FF6B00]' : 'text-white'}`}>
            {getTeamName(game.team_b_id)}
          </p>
          <p className="text-3xl headline-font text-white">{game.team_b_score || 0}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function LiveScores() {
  const [selectedTournament, setSelectedTournament] = useState(null);

  // Fetch ongoing tournaments
  const { data: tournaments = [] } = useQuery({
    queryKey: ["tournaments-ongoing"],
    queryFn: () => base44.entities.Tournament.filter({ status: "ongoing" }),
  });

  // Auto-select first tournament
  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(tournaments[0].id);
    }
  }, [tournaments, selectedTournament]);

  // Fetch games with aggressive polling for real-time effect
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["games-live", selectedTournament],
    queryFn: () => selectedTournament ? base44.entities.Game.filter({ tournament_id: selectedTournament }, "-created_date") : [],
    enabled: !!selectedTournament,
    refetchInterval: 2000,
  });

  // Fetch teams
  const { data: teams = [] } = useQuery({
    queryKey: ["teams-live", selectedTournament],
    queryFn: () => selectedTournament ? base44.entities.Team.filter({ tournament_id: selectedTournament }) : [],
    enabled: !!selectedTournament,
  });

  const liveGames = games.filter(g => g.status === "LIVE");
  const upcomingGames = games.filter(g => g.status === "SCHEDULED");
  const finalGames = games.filter(g => g.status === "FINAL");

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      {/* Hero */}
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_2q2yk2q2yk2q2yk2-Photoroom.svg" alt="Trophy" className="w-40 h-40 mx-auto mb-6" />
          <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">
            LIVE SCORES
          </h1>
          <p className="text-gray-400 text-xl">
            Follow the action in real-time
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto">
        {tournaments.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-xl">No ongoing tournaments at the moment</p>
          </div>
        ) : gamesLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" />
          </div>
        ) : (
          <div className="space-y-16">
            {/* Live Games Section */}
            {liveGames.length > 0 && (
              <section>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-4 h-4 bg-red-500 rounded-full"
                    />
                    <h2 className="headline-font text-4xl md:text-5xl text-white">
                      LIVE NOW
                    </h2>
                  </div>
                  <div className="w-32 h-1 bg-red-500"></div>
                </motion.div>

                <div className="space-y-6">
                  {liveGames.map((game) => (
                    <LiveGameCard key={game.id} game={game} teams={teams} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Games */}
            {upcomingGames.length > 0 && (
              <section>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-8"
                >
                  <h2 className="headline-font text-4xl md:text-5xl text-white mb-4">
                    UPCOMING
                  </h2>
                  <div className="w-32 h-1 bg-[#FF6B00]"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingGames.map((game) => (
                    <UpcomingGameCard key={game.id} game={game} teams={teams} />
                  ))}
                </div>
              </section>
            )}

            {/* Final Scores */}
            {finalGames.length > 0 && (
              <section>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-8"
                >
                  <h2 className="headline-font text-4xl md:text-5xl text-white mb-4">
                    FINAL SCORES
                  </h2>
                  <div className="w-32 h-1 bg-gray-500"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {finalGames.map((game) => (
                    <FinalGameCard key={game.id} game={game} teams={teams} />
                  ))}
                </div>
              </section>
            )}

            {liveGames.length === 0 && upcomingGames.length === 0 && finalGames.length === 0 && (
              <div className="text-center py-24">
                <p className="text-gray-500 text-xl">No games scheduled yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}