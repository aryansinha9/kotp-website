// PASTE THIS CODE INTO: src/Pages/Gallery.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { MediaItem } from '@/Entities/all';
import { Loader2, ArrowLeft } from 'lucide-react';

// Helper to get the public URL (same as on Moments page)
const getMediaUrl = (path) => {
    const { data } = supabase.storage.from('tournament-gallery').getPublicUrl(path);
    return data.publicUrl;
};

export default function Gallery() {
  const { tournamentId } = useParams(); // Get the ID from the URL
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGallery = async () => {
      try {
        setLoading(true);
        const data = await MediaItem.getGalleryByTournamentId(tournamentId);
        if (data) {
          setGallery(data);
        } else {
          setError('Gallery not found.');
        }
      } catch (err) {
        setError('Failed to load gallery.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, [tournamentId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-amber-500" /></div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/moments" className="inline-flex items-center text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Moments
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{gallery.name}</h1>
          <p className="text-xl text-slate-500">Photo & Video Gallery</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.media_items.map(item => (
            <a href={getMediaUrl(item.storage_path)} target="_blank" rel="noopener noreferrer" className="aspect-square block" key={item.id}>
              <img src={getMediaUrl(item.storage_path)} alt={`Gallery item for ${gallery.name}`} className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}