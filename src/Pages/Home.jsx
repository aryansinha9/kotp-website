// src/Pages/Home.jsx (New Redesigned Version with Live Data - COMPLETE)

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Trophy, Users, Camera, ArrowRight, Star } from "lucide-react";
import { Tournament } from "@/Entities/all"; // Only Tournament needed for this page

const ServiceCard = ({ title, description, image, size, icon: Icon, delay, linkTo }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <Link to={linkTo}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, delay }}
        className={`relative group overflow-hidden rounded-lg ${ size === "large" ? "col-span-full lg:col-span-2 lg:row-span-2" : "col-span-full lg:col-span-1" }`}
      >
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
    <div className="flex-shrink-0 w-80 md:w-96">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 h-full hover:border-[#FF6B00]/50 transition-all duration-300">
        <Star className="w-8 h-8 text-[#FF6B00] mb-4" />
        <p className="text-gray-300 text-lg mb-6 italic">"{quote}"</p>
        <div>
          <p className="headline-font text-xl text-white">{name}</p>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [featuredTournament, setFeaturedTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetches only the single, soonest upcoming tournament for the hero
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
    { quote: "From the streets to the spotlight. KOTP is the real deal.", name: "ALEX R.", role: "U18 Division Winner" }
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

        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
            {loading ? (
              <div className="h-24 w-full max-w-4xl bg-white/10 rounded-lg mx-auto animate-pulse"></div>
            ) : featuredTournament ? (
              <>
                <h1 className="headline-font text-6xl md:text-8xl lg:text-9xl text-white mb-6 text-glow">
                  {featuredTournament.name}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {featuredTournament.description}
                </p>
                <Link to={`/register/${featuredTournament.id}`}>
                  <button className="kotp-button bg-[#FF6B00] text-white px-10 py-4 rounded-md headline-font text-xl tracking-wider pulse-glow hover:scale-105 transition-transform duration-300">
                    REGISTER YOUR TEAM
                  </button>
                </Link>
              </>
            ) : (
              <>
                <h1 className="headline-font text-6xl md:text-8xl lg:text-9xl text-white mb-6 text-glow">
                  THIS IS OUR KINGDOM.
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Western Sydney's Premier Street Football Experience
                </p>
                <Link to="/tournaments">
                  <button className="kotp-button bg-[#FF6B00] text-white px-10 py-4 rounded-md headline-font text-xl tracking-wider pulse-glow hover:scale-105 transition-transform duration-300">
                    FIND YOUR TOURNAMENT
                  </button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
        
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </motion.div>
      </motion.section>

      <section className="relative py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-4">RULE THE PITCH.</h2>
            <div className="w-24 h-1 bg-[#FF6B00] mx-auto"></div>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ServiceCard title="TOURNAMENTS" description="Compete against the best. Show your skills. Claim your crown." image="https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2000" size="large" icon={Trophy} delay={0.2} linkTo="/tournaments" />
            <ServiceCard title="ABOUT US" description="Learn about our mission and the team behind KOTP." image="https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2000" size="small" icon={Users} delay={0.4} linkTo="/about" />
            <ServiceCard title="MOMENTS" description="Epic plays. Legendary celebrations. Captured forever." image="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000" size="small" icon={Camera} delay={0.6} linkTo="/moments" />
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="headline-font text-[20rem] text-white">KOTP</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-4">THE HYPE IS REAL.</h2>
            <p className="text-gray-400 text-xl">Hear from our champions</p>
          </motion.div>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-4 bg-[#0a0a0a]">
        <div className="absolute inset-0 opacity-10">
          <div className="headline-font text-[15rem] text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">KOTP</div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="headline-font text-6xl md:text-8xl text-white mb-8">READY TO BE KING?</h2>
            <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">Join the most competitive street football community in Western Sydney.</p>
            <Link to="/tournaments">
              <button className="kotp-button bg-[#FF6B00] text-white px-12 py-5 rounded-md headline-font text-2xl tracking-wider pulse-glow hover:scale-105 transition-transform duration-300">
                REGISTER NOW
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}