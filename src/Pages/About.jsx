// src/Pages/About.jsx (New Redesigned Version - COMPLETE)

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Heart, Zap, Award, Users, TrendingUp } from "lucide-react";

const ValueCard = ({ icon: Icon, title, description, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 hover:border-[#FF6B00]/50 transition-all duration-300"
    >
      <div className="bg-[#FF6B00]/10 rounded-lg w-16 h-16 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-[#FF6B00]" />
      </div>
      <h3 className="headline-font text-2xl text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const TeamMember = ({ member, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-lg">
        <img src={member.image} alt={member.name} className="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="headline-font text-2xl text-white mb-1">{member.name}</h3>
          <p className="text-[#FF6B00] mb-2">{member.role}</p>
          <p className="text-gray-300 text-sm">{member.bio}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function About() {
  const values = [
    { icon: Target, title: "DISCIPLINE", description: "We instill discipline through structured training, respect for the game, and commitment to excellence both on and off the pitch." },
    { icon: Zap, title: "FLAIR", description: "We celebrate creativity, individual expression, and the street-style artistry that makes football beautiful and unpredictable." },
    { icon: Award, title: "GREATNESS", description: "We push every player to reach their full potential, creating champions who dominate on the pitch and inspire in the community." }
  ];

  const team = [
    { name: "MARCUS JOHNSON", role: "Founder & Head Coach", bio: "Built KOTP from the streets of Western Sydney", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000" },
    { name: "SARAH WILLIAMS", role: "Academy Director", bio: "Former professional player, developing next gen talent", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2000" },
    { name: "DAVID NGUYEN", role: "Tournament Director", bio: "Creating unforgettable competitive experiences", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2000" },
    { name: "EMILY PATEL", role: "Youth Development Coach", bio: "Nurturing talent from grassroots to glory", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2000" }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000" alt="Team" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-6 text-glow">BUILT FROM THE STREETS.</h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">We're not just a football organization. We're a movement that transforms raw talent into greatness, giving Western Sydney's athletes the platform they deserve.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-16">
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">OUR MISSION</h2>
            <div className="w-32 h-1 bg-[#FF6B00] mb-8"></div>
            <p className="text-gray-300 text-xl leading-relaxed max-w-4xl">King of the Pitch exists to provide a world-class platform for Western Sydney's football talent. We combine the raw energy of street football with professional-level competition, creating an environment where discipline, flair, and greatness aren't just values—they're a way of life. From our elite academy to our legendary tournaments, we're building the next generation of football champions.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => ( <ValueCard key={index} {...value} delay={index * 0.2} /> ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <Users className="w-16 h-16 text-[#FF6B00] mb-6" />
              <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">THE ACADEMY</h2>
              <div className="w-24 h-1 bg-[#FF6B00] mb-8"></div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">Our academy isn't about making everyone play the same way. It's about taking each player's natural style and making it sharper, faster, more effective. We teach decision-making under pressure, technical mastery, and the mental toughness required to dominate at any level.</p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-6 h-6 text-[#FF6B00] mt-1 flex-shrink-0" />
                  <div><h3 className="headline-font text-xl text-white mb-2">ELITE COACHING</h3><p className="text-gray-400">Former professional players and certified coaches</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Heart className="w-6 h-6 text-[#FF6B00] mt-1 flex-shrink-0" />
                  <div><h3 className="headline-font text-xl text-white mb-2">SMALL GROUPS</h3><p className="text-gray-400">Maximum 12 players per session for personalized attention</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-[#FF6B00] mt-1 flex-shrink-0" />
                  <div><h3 className="headline-font text-xl text-white mb-2">REAL COMPETITION</h3><p className="text-gray-400">Regular exposure to tournament-level pressure situations</p></div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative h-[600px] rounded-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2000" alt="Training" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">MEET THE TEAM</h2>
            <div className="w-32 h-1 bg-[#FF6B00] mx-auto mb-6"></div>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto">Led by passionate individuals who live and breathe football</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => ( <TeamMember key={index} member={member} index={index} /> ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-6">JOIN THE MOVEMENT</h2>
            <p className="text-gray-400 text-xl mb-8">Whether you want to compete, train, or support—there's a place for you in the kingdom</p>
            <Link to="/tournaments">
              <button className="kotp-button bg-[#FF6B00] text-white px-12 py-4 rounded-md headline-font text-xl tracking-wider pulse-glow hover:scale-105 transition-transform duration-300">
                GET STARTED
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}