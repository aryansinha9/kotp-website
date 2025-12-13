// src/Pages/Tournaments.jsx (New Redesigned Version with Live Data - COMPLETE)

import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Calendar, MapPin, Users, Crown, Medal, Award, Loader2 } from "lucide-react";
import { Tournament } from "@/Entities/all"; // <-- IMPORT our Tournament entity
import { format } from "date-fns"; // <-- IMPORT date-fns for formatting dates
import FuzzyText from "@/Components/FuzzyText";

// --- Construct the base URL for your Supabase storage ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'tournament-gallery';
const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

// --- This is the new TournamentCard component from your redesign ---
// I've modified it to accept live data and link correctly.
const TournamentCard = ({ tournament, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // --- Data Transformation: Map Supabase data to the card's expected props ---
  const cardData = {
    name: tournament.name,
    // Format the date range nicely
    date: `${format(new Date(tournament.start_date), "MMMM d")} - ${format(new Date(tournament.end_date), "d, yyyy")}`,
    location: tournament.venue,
    // Join the array of age groups into a string
    divisions: tournament.age_groups.join(', '),
    // The design uses "prize", we'll display the entry fee here.
    prize: tournament.entry_fee,
    // Construct the full image URL from the path in the database
    image: tournament.hero_image_path
      ? `${STORAGE_BASE_URL}${tournament.hero_image_path}`
      : "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2000", // Fallback image
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden hover:border-[#FF6B00] transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={cardData.image} alt={cardData.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="headline-font text-2xl text-white mb-4 group-hover:text-[#FF6B00] transition-colors">
          {cardData.name}
        </h3>
        <div className="space-y-3 mb-6 flex-grow">
          <div className="flex items-center gap-3 text-gray-400"><Calendar className="w-5 h-5 text-[#FF6B00]" /><span>{cardData.date}</span></div>
          <div className="flex items-center gap-3 text-gray-400"><MapPin className="w-5 h-5 text-[#FF6B00]" /><span>{cardData.location}</span></div>
          <div className="flex items-center gap-3 text-gray-400"><Users className="w-5 h-5 text-[#FF6B00]" /><span>{cardData.divisions}</span></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[#FF6B00] headline-font text-xl">${cardData.prize}</div>
          {/* --- FUNCTIONALITY: This button now links to the correct registration page --- */}
          <Link to={`/register/${tournament.id}`}>
            <button className="kotp-button bg-[#FF6B00] text-white px-6 py-2 rounded-md headline-font text-sm tracking-wider hover:scale-105 transition-transform duration-300">
              REGISTER
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- Hall of Fame component remains static for now, as we don't have this data in Supabase yet ---
const HallOfFameCard = ({ winner, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden hover:shadow-xl hover:shadow-[#FF6B00]/20 transition-all duration-300"
    >
      <div className="relative h-80 overflow-hidden">
        <img src={winner.image} alt={winner.tournament} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute top-4 left-4"><div className="bg-[#FF6B00] rounded-full p-3"><Crown className="w-6 h-6 text-white" /></div></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-xs text-gray-400 mb-1">{winner.year}</div>
          <h3 className="headline-font text-2xl text-white mb-2">{winner.tournament}</h3>
          <div className="flex items-center gap-2"><Medal className="w-5 h-5 text-[#FF6B00]" /><span className="text-gray-300">{winner.team}</span></div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Tournaments() {
  // --- TRANSPLANTED LOGIC: State for live data ---
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATIC DATA: This is from your new design, we'll keep it for now ---
  const hallOfFame = [
    { tournament: "2024 Summer Crown", team: "Western Warriors", year: "2024", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000" },
    { tournament: "2024 Spring Classic", team: "Sydney Strikers", year: "2024", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000" },
    { tournament: "2023 Championship", team: "Parramatta Kings", year: "2023", image: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2000" },
    { tournament: "2023 Winter Cup", team: "Blacktown Legends", year: "2023", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2000" }
  ];

  // --- TRANSPLANTED LOGIC: Fetching live tournament data ---
  useEffect(() => {
    const loadTournaments = async () => {
      setLoading(true);
      try {
        const data = await Tournament.filter({ status: 'upcoming' }, 'start_date');
        setUpcomingTournaments(data);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTournaments();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000" alt="Tournament" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/70"></div></div>
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Trophy className="w-20 h-20 text-[#FF6B00] mx-auto mb-6" />
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow flex items-center justify-center gap-4">
              <span>BECOME A</span>
              <FuzzyText fontSize="clamp(3rem, 8vw, 8rem)" fontFamily="'Bebas Neue', cursive" color="#FF6B00">LEGEND</FuzzyText>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Compete in Western Sydney's most prestigious street football tournaments</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-12">
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-4">UPCOMING TOURNAMENTS</h2>
            <div className="w-32 h-1 bg-[#FF6B00]"></div>
          </motion.div>

          {/* --- INTEGRATED: This grid now displays live data from Supabase --- */}
          {loading ? (
            <div className="flex justify-center"><Loader2 className="w-10 h-10 text-[#FF6B00] animate-spin" /></div>
          ) : upcomingTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingTournaments.map((tournament, index) => (
                <TournamentCard key={tournament.id} tournament={tournament} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center text-xl">No upcoming tournaments scheduled. Please check back soon!</p>
          )}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-12">
            <Award className="w-16 h-16 text-[#FF6B00] mx-auto mb-6" />
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-4">HALL OF FAME</h2>
            <p className="text-gray-400 text-xl">Celebrating our champions</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hallOfFame.map((winner, index) => (<HallOfFameCard key={index} winner={winner} index={index} />))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-6">YOUR TIME IS NOW</h2>
            <p className="text-gray-400 text-xl mb-8">Don't miss your chance to compete against the best</p>
            <Link to="/tournaments">
              <button className="kotp-button bg-[#FF6B00] text-white px-12 py-4 rounded-md headline-font text-xl tracking-wider pulse-glow hover:scale-105 transition-transform duration-300">
                REGISTER FOR NEXT TOURNAMENT
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
