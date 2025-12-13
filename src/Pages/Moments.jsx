import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, Play, Image as ImageIcon, Filter } from "lucide-react";

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
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

        {item.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#FF6B00] rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
          <p className="text-gray-300 text-sm">{item.category}</p>
        </div>

        {/* KOTP Star Logo on Hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-[#FF6B00] rounded-full p-2">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Moments() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lightboxItem, setLightboxItem] = useState(null);

  const categories = [
    { id: "all", name: "ALL" },
    { id: "highlights", name: "HIGHLIGHTS" },
    { id: "street-style", name: "STREET STYLE" },
    { id: "academy", name: "ACADEMY" },
    { id: "tournaments", name: "TOURNAMENTS" }
  ];

  const moments = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000",
      title: "Championship Winning Goal",
      category: "Highlights",
      type: "video",
      span: 20,
      filter: "highlights"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000",
      title: "Street Skills Showcase",
      category: "Street Style",
      type: "image",
      span: 15,
      filter: "street-style"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2000",
      title: "Academy Training Session",
      category: "Academy",
      type: "image",
      span: 18,
      filter: "academy"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2000",
      title: "Tournament Victory Dance",
      category: "Tournaments",
      type: "video",
      span: 16,
      filter: "tournaments"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000",
      title: "Epic Save",
      category: "Highlights",
      type: "video",
      span: 19,
      filter: "highlights"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2000",
      title: "Urban Pitch Vibes",
      category: "Street Style",
      type: "image",
      span: 14,
      filter: "street-style"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2000",
      title: "Youth Development",
      category: "Academy",
      type: "image",
      span: 17,
      filter: "academy"
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000",
      title: "Finals Intensity",
      category: "Tournaments",
      type: "image",
      span: 15,
      filter: "tournaments"
    },
    {
      id: 9,
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2000",
      title: "Freestyle Magic",
      category: "Street Style",
      type: "video",
      span: 18,
      filter: "street-style"
    }
  ];

  const filteredMoments = selectedCategory === "all"
    ? moments
    : moments.filter(m => m.filter === selectedCategory);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000"
            alt="Moments"
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
            <Camera className="w-20 h-20 text-[#FF6B00] mx-auto mb-6" />
            <h1 className="headline-font text-6xl md:text-8xl text-white mb-4 text-glow">
              CULTURE & VIBE
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Capturing the energy, passion, and greatness of KOTP
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="sticky top-20 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Filter className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`headline-font text-sm tracking-wider px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${selectedCategory === category.id
                    ? "bg-[#FF6B00] text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            style={{ gridAutoRows: "10px" }}
          >
            {filteredMoments.map((item, index) => (
              <MasonryItem
                key={item.id}
                item={item}
                index={index}
                onClick={setLightboxItem}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition-colors text-4xl"
          >
            ×
          </button>

          <div className="max-w-5xl w-full">
            <img
              src={lightboxItem.image}
              alt={lightboxItem.title}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-6 text-center">
              <h2 className="headline-font text-3xl text-white mb-2">
                {lightboxItem.title}
              </h2>
              <p className="text-gray-400">{lightboxItem.category}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="headline-font text-5xl md:text-7xl text-white mb-6">
              BE PART OF THE STORY
            </h2>
            <p className="text-gray-400 text-xl mb-8">
              Create your own legendary moments
            </p>
            <button className="kotp-button bg-[#FF6B00] text-white px-12 py-4 rounded-md headline-font text-xl tracking-wider pulse-glow hover:scale-105 transition-transform duration-300">
              JOIN A TOURNAMENT
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}