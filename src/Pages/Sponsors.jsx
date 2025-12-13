// src/Pages/Sponsors.jsx (New Redesigned Version with Live Data - COMPLETE)

import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Heart, Star, Send, Building2, Trophy, Users } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Sponsor } from "@/Entities/all"; // <-- IMPORT our Sponsor entity
import { supabase } from "@/supabaseClient"; // <-- IMPORT supabase for the contact form

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'tournament-gallery';
const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

// --- These are the beautiful sub-components from your new design. They remain unchanged. ---
const ValueCard = ({ icon: Icon, title, description, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="bg-[#FF6B00]/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#FF6B00]/20 transition-colors">
        <Icon className="w-10 h-10 text-[#FF6B00]" />
      </div>
      <h3 className="headline-font text-2xl text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const SponsorTier = ({ tier, sponsors, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="mb-12"
    >
      <div className="text-center mb-8">
        <h3 className="headline-font text-3xl md:text-4xl text-white mb-2">{tier}</h3>
        <div className="w-24 h-1 bg-[#FF6B00] mx-auto"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 flex items-center justify-center hover:border-[#FF6B00]/50 transition-all duration-300 group h-32"
          >
            <img
              src={`${STORAGE_BASE_URL}${sponsor.logo_url}`}
              alt={sponsor.name}
              className="max-w-full max-h-16 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
            />
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default function Sponsors() {
  // --- TRANSPLANTED LOGIC: State for the contact form ---
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // --- TRANSPLANTED LOGIC: State for live sponsor data ---
  const [sponsorTiers, setSponsorTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- TRANSPLANTED LOGIC: Fetching and processing live sponsor data ---
  useEffect(() => {
    const loadSponsors = async () => {
      setLoading(true);
      try {
        const data = await Sponsor.getAll(); // Using a generic getAll for simplicity

        // Group sponsors by tier
        const tiers = {
          1: { name: 'TITLE PARTNERS', sponsors: [] },
          2: { name: 'PLATINUM PARTNERS', sponsors: [] },
          3: { name: 'COMMUNITY PARTNERS', sponsors: [] },
        };

        data.forEach(sponsor => {
          if (tiers[sponsor.tier]) {
            tiers[sponsor.tier].sponsors.push(sponsor);
          }
        });

        setSponsorTiers(Object.values(tiers).filter(t => t.sponsors.length > 0));

      } catch (err) {
        console.error("Error fetching sponsors:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSponsors();
  }, []);

  // --- TRANSPLANTED LOGIC: The working contact form handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...formData, subject: "New Sponsorship Inquiry" };

    const { error: invokeError } = await supabase.functions.invoke('contact-form-handler', {
      body: JSON.stringify(payload),
    });

    if (invokeError) {
      setError('Message could not be sent. Please try again later.');
    } else {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000); // Reset after 5 seconds
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const partnershipValues = [
    {
      icon: Eye,
      title: "UNMATCHED VISIBILITY",
      description: "Your brand showcased across all our tournaments, academy sessions, and digital platforms reaching thousands of engaged athletes and families."
    },
    {
      icon: Heart,
      title: "AUTHENTIC CONNECTION",
      description: "Associate with a movement that's genuinely transforming Western Sydney's youth through sport, discipline, and opportunity."
    },
    {
      icon: Star,
      title: "ASSOCIATE WITH GREATNESS",
      description: "Align your brand with excellence, competition, and the champions of tomorrow in Australia's fastest-growing street football scene."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000" alt="Partnership" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_2q2yk2q2yk2q2yk2-Photoroom.svg" alt="Trophy" className="w-20 h-20 mx-auto mb-6" />
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">JOIN THE KINGDOM.</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Partner with Western Sydney's most dynamic football movement</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">WHY PARTNER WITH US?</h2>
            <div className="w-32 h-1 bg-[#FF6B00] mx-auto"></div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {partnershipValues.map((value, index) => (<ValueCard key={index} {...value} delay={index * 0.2} />))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        {/* Impact Stats */}
      </section>

      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">OUR PARTNERS</h2>
            <div className="w-32 h-1 bg-[#FF6B00] mx-auto mb-6"></div>
            <p className="text-gray-400 text-xl">Thank you to our valued partners who support the kingdom</p>
          </motion.div>
          {loading ? (
            <p className="text-center text-gray-400">Loading partners...</p>
          ) : sponsorTiers.length > 0 ? (
            sponsorTiers.map((tier, index) => (
              <SponsorTier key={tier.name} tier={tier.name} sponsors={tier.sponsors} index={index} />
            ))
          ) : (
            <p className="text-center text-gray-400">No partners to display yet.</p>
          )}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="text-center mb-12">
              <h2 className="headline-font text-5xl md:text-6xl text-white mb-6">GET IN TOUCH</h2>
              <div className="w-32 h-1 bg-[#FF6B00] mx-auto mb-6"></div>
              <p className="text-gray-400 text-xl">Ready to join the kingdom? Let's discuss how we can create greatness together.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 headline-font text-sm">YOUR NAME *</label>
                  <Input name="name" value={formData.name} onChange={handleChange} required className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00]" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-white mb-2 headline-font text-sm">EMAIL *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} required className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00]" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-white mb-2 headline-font text-sm">MESSAGE *</label>
                <Textarea name="message" value={formData.message} onChange={handleChange} required className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#FF6B00] min-h-[150px]" placeholder="Tell us about your partnership goals..." />
              </div>
              <Button type="submit" className="w-full kotp-button bg-[#FF6B00] text-white py-6 rounded-md headline-font text-lg tracking-wider hover:scale-105 transition-transform duration-300">
                {submitted ? "MESSAGE SENT!" : <><Send className="w-5 h-5 mr-2" /> SEND MESSAGE</>}
              </Button>
              {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}