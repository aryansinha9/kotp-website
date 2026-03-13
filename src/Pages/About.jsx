// src/Pages/About.jsx (New Redesigned Version - COMPLETE)

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom"; // <-- ADDED for the CTA button
import { Target, Zap, Award, Users, Heart, TrendingUp } from "lucide-react";

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
      <div className="relative overflow-hidden rounded-lg bg-[#1a1a1a] h-64 border border-white/5 flex flex-col justify-end p-6 group-hover:border-[#FF6B00]/50 transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-300">
          <h3 className="headline-font text-2xl text-white mb-1">{member.name}</h3>
          <p className="text-[#FF6B00]">{member.role}</p>
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
    { name: "ASH", role: "Founder & Director" },
    { name: "ANTONY", role: "Co-Director" },
    { name: "ARYAN", role: "Head of Digital Operations" },
    { name: "ADRIANO", role: "Tournament Operations Manager" },
    { name: "BISHOY", role: "Fixtures & Competition Manager" },
    { name: "ALI", role: "Head of Media & Social strategy" }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/ABOUTPAGE.jpeg" alt="Team" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-6 text-glow">BUILT FROM THE STREETS.</h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">We're not just a football organization. We're a movement that transforms raw talent into greatness, giving Sydney's athletes the platform they deserve.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-16">
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">OUR MISSION</h2>
            <div className="w-32 h-1 bg-[#FF6B00] mb-8"></div>
            <p className="text-gray-300 text-xl leading-relaxed max-w-4xl">At King of the Pitch, our mission is to elevate grassroots football by creating elite opportunities and experiences for the next generation of players. We are committed to building a strong football culture that connects athletes and communities while providing a platform where talent is seen, celebrated, and developed. Through high-energy events and media exposure, we empower players to grow in confidence, character, and skill — redefining what is possible at the grassroots level.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (<ValueCard key={index} {...value} delay={index * 0.2} />))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (<TeamMember key={index} member={member} index={index} />))}
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