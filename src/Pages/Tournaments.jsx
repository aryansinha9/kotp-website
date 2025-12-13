import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, useInView } from "framer-motion";
import { Calendar, MapPin, Users, Crown, Medal, Award } from "lucide-react";
import FuzzyText from "@/components/FuzzyText";

const TournamentCard = ({ tournament, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden hover:border-[#FF6B00] transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={tournament.image}
          alt={tournament.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        {tournament.featured && (
          <div className="absolute top-4 right-4 bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs headline-font">
            FEATURED
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="headline-font text-2xl text-white mb-4 group-hover:text-[#FF6B00] transition-colors">
          {tournament.name}
        </h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-400">
            <Calendar className="w-5 h-5 text-[#FF6B00]" />
            <span>{tournament.date}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <MapPin className="w-5 h-5 text-[#FF6B00]" />
            <span>{tournament.location}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <Users className="w-5 h-5 text-[#FF6B00]" />
            <span>{tournament.divisions}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[#FF6B00] headline-font text-xl">
            ${tournament.prize}
          </div>
          <Link to={createPageUrl("Register")}>
            <button className="kotp-button bg-[#FF6B00] text-white px-6 py-2 rounded-md headline-font text-sm tracking-wider hover:scale-105 transition-transform duration-300">
              REGISTER
            </button>
          </Link>
        </div>
      </div>

      {/* Glitch Effect Overlay */}
      <div className="absolute inset-0 bg-[#FF6B00] opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
    </motion.div>
  );
};

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
        <img
          src={winner.image}
          alt={winner.tournament}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        
        <div className="absolute top-4 left-4">
          <div className="bg-[#FF6B00] rounded-full p-3">
            <Crown className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-xs text-gray-400 mb-1">{winner.year}</div>
          <h3 className="headline-font text-2xl text-white mb-2">
            {winner.tournament}
          </h3>
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-[#FF6B00]" />
            <span className="text-gray-300">{winner.team}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Tournaments() {
  const [filter, setFilter] = useState("all");

  const upcomingTournaments = [
    {
      name: "THE WEST SYDNEY CROWN",
      date: "March 15-17, 2025",
      location: "Parramatta Park",
      divisions: "U16, U18, Open",
      prize: "5,000",
      image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2000",
      featured: true
    },
    {
      name: "STREET LEGENDS CUP",
      date: "April 8-9, 2025",
      location: "Blacktown International",
      divisions: "U18, Open, Women's",
      prize: "3,000",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000",
      featured: false
    },
    {
      name: "KOTP CHAMPIONSHIP",
      date: "May 20-22, 2025",
      location: "Sydney Olympic Park",
      divisions: "U16, U18, Open, Women's",
      prize: "10,000",
      image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2000",
      featured: true
    }
  ];

  const hallOfFame = [
    {
      tournament: "2024 Summer Crown",
      team: "Western Warriors",
      year: "2024",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000"
    },
    {
      tournament: "2024 Spring Classic",
      team: "Sydney Strikers",
      year: "2024",
      image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000"
    },
    {
      tournament: "2023 Championship",
      team: "Parramatta Kings",
      year: "2023",
      image: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2000"
    },
    {
      tournament: "2023 Winter Cup",
      team: "Blacktown Legends",
      year: "2023",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2000"
    }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000"
            alt="Tournament"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_2q2yk2q2yk2q2yk2-Photoroom.svg" alt="Trophy" className="w-52 h-52 mx-auto mb-6" />
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 flex items-baseline justify-center gap-2">
              <span className="text-glow">BECOME A</span>
              <div style={{ filter: 'drop-shadow(0 0 20px rgba(255, 107, 0, 0.5))' }}>
                <FuzzyText 
                  baseIntensity={0.2} 
                  hoverIntensity={0.5} 
                  enableHover={true}
                  fontSize="clamp(3rem, 7vw, 7rem)"
                  fontWeight={900}
                  fontFamily="'Bebas Neue', cursive"
                  color="#fff"
                >
                  LEGEND
                </FuzzyText>
              </div>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Compete in Western Sydney's most prestigious street football tournaments
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-4">
              UPCOMING TOURNAMENTS
            </h2>
            <div className="w-32 h-1 bg-[#FF6B00]"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingTournaments.map((tournament, index) => (
              <TournamentCard key={index} tournament={tournament} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Hall of Fame */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Award className="w-16 h-16 text-[#FF6B00] mx-auto mb-6" />
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-4">
              HALL OF FAME
            </h2>
            <p className="text-gray-400 text-xl">Celebrating our champions</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hallOfFame.map((winner, index) => (
              <HallOfFameCard key={index} winner={winner} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-6">
              YOUR TIME IS NOW
            </h2>
            <p className="text-gray-400 text-xl mb-8">
              Don't miss your chance to compete against the best
            </p>
            <Link to={createPageUrl("Register")}>
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
