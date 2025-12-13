// src/Pages/Home.jsx (New Redesigned Version with Live Data - COMPLETE AND UNABBREVIATED)

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Users, ArrowRight, Star } from "lucide-react";
import { Tournament } from "@/Entities/all";
import CircularText from "@/Components/CircularText";
import { InfiniteMovingCards } from "@/Components/ui/infinite-moving-cards";

const ServiceCard = ({ title, description, image, size, icon: Icon, delay, linkTo }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <Link to={linkTo}>
      <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.6, delay }} className={`relative group overflow-hidden rounded-lg ${size === "large" ? "col-span-full lg:col-span-2 lg:row-span-2" : "col-span-full lg:col-span-1"}`}>
        <div className="relative h-full min-h-[300px] lg:min-h-[400px]">
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="transform transition-transform duration-300 group-hover:translate-y-[-10px]">
              <Icon className="w-12 h-12 text-[#FF6B00] mb-4" />
              <h3 className="headline-font text-4xl md:text-5xl text-white mb-3">{title}</h3>
              <p className="text-gray-300 text-lg mb-4 max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">{description}</p>
              <div className="flex items-center gap-2 text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="headline-font text-lg">LEARN MORE</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const TestimonialCard = ({ quote, name, role }) => {
  return (
    <li className="w-80 md:w-96">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 h-full hover:border-[#FF6B00]/50 transition-all duration-300">
        <Star className="w-8 h-8 text-[#FF6B00] mb-4" />
        <p className="text-gray-300 text-lg mb-6 italic">"{quote}"</p>
        <div>
          <p className="headline-font text-xl text-white">{name}</p>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
    </li>
  );
};

export default function Home() {
  const [featuredTournament, setFeaturedTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const tournamentsData = await Tournament.filter({ status: "upcoming" }, "start_date", 1);
        if (tournamentsData && tournamentsData.length > 0) {
          setFeaturedTournament(tournamentsData[0]);
        }
      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  const testimonials = [
    { quote: "KOTP gave me the platform to showcase my skills. Now I'm playing at the next level.", name: "MARCUS T.", role: "2024 Tournament Champion" },
    { quote: "The energy here is unmatched. This is where champions are made.", name: "SARAH K.", role: "Academy Graduate" },
    { quote: "From the streets to the spotlight. KOTP is the real deal.", name: "ALEX R.", role: "U18 Division Winner" },
    { quote: "An experience like no other. The competition is fierce and the community is real.", name: "JESSICA L.", role: "Spectator & Parent" },
  ];

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const BUCKET_NAME = 'tournament-gallery';
  const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

  const heroImageUrl = featuredTournament?.hero_image_path
    ? `${STORAGE_BASE_URL}${featuredTournament.hero_image_path}`
    : "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000";

  return (
    <div className="relative">
      <motion.section style={{ opacity: heroOpacity }} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img src={heroImageUrl} alt="Football Action" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </motion.div>
        <div className="relative z-10 px-4 max-w-7xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="text-left">
            {loading ? (
              <div className="h-48 w-full max-w-2xl bg-white/10 rounded-lg animate-pulse"></div>
            ) : featuredTournament ? (
              <>
                <div className="inline-flex items-center gap-2 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-full px-4 py-2 mb-6">
                  <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></div>
                  <span className="text-[#FF6B00] text-sm font-semibold tracking-wider">NEXT EVENT: {featuredTournament.name}</span>
                </div>
                <h1 className="headline-font text-6xl md:text-8xl lg:text-9xl mb-6"><span className="text-white">RULE THE</span><br /><span className="text-[#FF6B00]">PITCH</span></h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">{featuredTournament.description}</p>
                <div className="flex flex-wrap gap-4">
                  <Link to={`/register/${featuredTournament.id}`}>
                    <button className="kotp-button bg-[#FF6B00] text-white px-8 py-4 rounded-md headline-font text-lg tracking-wider hover:bg-[#FF6B00]/90 transition-all duration-300">REGISTER TEAM</button>
                  </Link>
                  <Link to="/live-scores">
                    <button className="kotp-button bg-transparent border-2 border-white/20 text-white px-8 py-4 rounded-md headline-font text-lg tracking-wider hover:bg-white/10 transition-all duration-300">LIVE SCORES</button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="headline-font text-6xl md:text-8xl lg:text-9xl mb-6"><span className="text-white">RULE THE</span><br /><span className="text-[#FF6B00]">PITCH</span></h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">The ultimate street football league. No upcoming events scheduled. Check back soon.</p>
                <Link to="/tournaments"><button className="kotp-button bg-transparent border-2 border-white/20 text-white px-8 py-4 rounded-md headline-font text-lg tracking-wider hover:bg-white/10 transition-all duration-300">VIEW TOURNAMENTS</button></Link>
              </>
            )}
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <CircularText text="KING*OF*THE*PITCH*" onHover="speedUp" spinDuration={20} className="circular-text-home" />
        </div>
      </motion.section>

      <section className="relative py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-4">RULE THE PITCH.</h2>
            <div className="w-24 h-1 bg-[#FF6B00] mx-auto"></div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard title="TOURNAMENTS" description="Compete against the best. Show your skills. Claim your crown." image="https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2000" size="small" icon={() => <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_2q2yk2q2yk2q2yk2-Photoroom.svg" alt="Trophy" className="w-16 h-16" />} delay={0.2} linkTo="/tournaments" />
            <ServiceCard title="ACADEMY" description="Train with the best. Develop your game. Become unstoppable." image="https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2000" size="small" icon={() => <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_61vkm061vkm061vk-Photoroom.svg" alt="Academy" className="w-16 h-16" />} delay={0.4} linkTo="/academy" />
            <ServiceCard title="MOMENTS" description="Epic plays. Legendary celebrations. Captured forever." image="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000" size="small" icon={() => <img src="https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/Gemini_Generated_Image_ps4ibups4ibups4i-Photoroom.svg" alt="Camera" className="w-16 h-16" />} delay={0.6} linkTo="/moments" />
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-4">THE HYPE IS REAL.</h2>
            <p className="text-gray-400 text-xl">Hear from our champions</p>
          </motion.div>
          <InfiniteMovingCards items={testimonials.map(t => <TestimonialCard {...t} />)} direction="right" speed="slow" />
        </div>
      </section>

      <section className="relative py-32 px-4 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6906f278f7a7157d0cc591bf/42359241e_KOTPfavicon.png" alt="" className="w-[500px] md:w-[700px] opacity-[0.08]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="headline-font text-6xl md:text-8xl text-white mb-8">READY TO BE KING?</h2>
            <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">Join the most competitive street football community in Western Sydney.</p>
            <Link to="/register">
              <button className="kotp-button bg-[#FF6B00] text-white px-12 py-5 rounded-md headline-font text-2xl tracking-wider pulse-glow hover:scale-105 transition-transform duration-300">REGISTER NOW</button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}