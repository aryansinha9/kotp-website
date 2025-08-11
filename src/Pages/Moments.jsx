// PASTE THIS CODE INTO: src/Pages/Moments.jsx

import React, { useState, useEffect } from 'react';
import { MediaItem } from '@/Entities/all';
import { Badge } from '@/components/ui/badge';
import { Play, Heart } from 'lucide-react';

// This is a reusable component for each individual moment card
const MomentCard = ({ moment }) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl shadow-xl card-hover">
        <img
          src={moment.thumbnail || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
          alt={moment.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300"></div>
        
        {/* Play Button for videos */}
        {moment.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
            </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            {moment.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} className="bg-emerald-500 text-white text-xs border-none">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="font-bold text-xl mb-2">{moment.title}</h3>
          <p className="text-white/90 text-sm line-clamp-2">{moment.description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Play className="w-4 h-4" />
              <span>{moment.view_count || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>248 likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// This is the main page component
export default function Moments() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMoments = async () => {
      try {
        setLoading(true);
        const data = await MediaItem.list();
        setMoments(data);
      } catch (error) {
        console.error("Error loading moments:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMoments();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 uppercase tracking-wider">
            Tournament Moments
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Relive the action. Explore photos and videos from all our events.
          </p>
        </div>

        {/* Moments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton loaders for when data is fetching
            Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))
          ) : (
            // Real moment cards
            moments.map((moment) => (
              <MomentCard key={moment.id} moment={moment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}