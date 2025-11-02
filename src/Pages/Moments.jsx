// src/Pages/Moments.jsx (New Redesigned Version with Live Data - COMPLETE)

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Camera, Play, Filter, X } from "lucide-react";
import { MediaItem } from "@/Entities/all"; // <-- IMPORT our MediaItem entity

// --- Helper to build the full public URL for an image/video ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'tournament-gallery';
const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

// --- This is the new MasonryItem component from your redesign ---
const MasonryItem = ({ item, index, onClick }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onClick={() => onClick(item)}
      className="group relative overflow-hidden rounded-lg cursor-pointer"
      style={{ gridRowEnd: `span ${item.span}` }}
    >
      <div className="relative w-full h-full">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        
        {item.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#FF6B00] rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg">{item.tournamentName}</h3>
        </div>
      </div>
    </motion.div>
  );
};

export default function Moments() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState(null);

  // --- TRANSPLANTED LOGIC: Fetching live gallery data ---
  useEffect(() => {
    const loadMedia = async () => {
      setLoading(true);
      try {
        const galleries = await MediaItem.getGalleries();
        // Flatten the data and adapt it for the masonry layout
        const allItems = galleries.flatMap(gallery => 
          (gallery.media_items || []).map(item => ({
            ...item,
            tournamentName: gallery.name, // Add tournament name for context
            imageUrl: `${STORAGE_BASE_URL}${item.storage_path}`, // Create full URL
            // Assign a semi-random span for the masonry effect
            span: item.type === 'video' ? 20 : (item.id % 5) + 15 
          }))
        );
        setMediaItems(allItems);
      } catch (error) {
        console.error("Error fetching media items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMedia();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000" alt="Moments" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Camera className="w-20 h-20 text-[#FF6B00] mx-auto mb-6" />
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">CULTURE & VIBE</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Capturing the energy, passion, and greatness of KOTP</p>
          </motion.div>
        </div>
      </section>

      {/* --- INTEGRATED: This grid now displays live data from Supabase --- */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
             <p className="text-center text-gray-400">Loading moments...</p>
          ) : mediaItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridAutoRows: "10px" }}>
              {mediaItems.map((item, index) => (
                <MasonryItem key={item.id} item={item} index={index} onClick={setLightboxItem} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No moments found.</p>
          )}
        </div>
      </section>

      {/* --- INTEGRATED: Lightbox now uses live data --- */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button onClick={() => setLightboxItem(null)} className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition-colors">
                <X className="w-8 h-8" />
              </button>
              <div className="max-w-5xl w-full max-h-[90vh] flex flex-col">
                <img src={lightboxItem.imageUrl} alt={lightboxItem.title} className="w-full h-auto object-contain rounded-lg" />
                <div className="mt-4 text-center">
                  <h2 className="headline-font text-2xl text-white">{lightboxItem.tournamentName}</h2>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-6">BE PART OF THE STORY</h2>
            <p className="text-gray-400 text-xl mb-8">Create your own legendary moments</p>
            <Link to="/tournaments">
              <button className="kotp-button bg-[#FF6B00] text-white px-12 py-4 rounded-md headline-font text-xl tracking-wider pulse-glow hover:scale-105 transition-transform duration-300">
                JOIN A TOURNAMENT
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}