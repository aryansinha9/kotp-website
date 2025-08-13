// REPLACE THE ENTIRE CONTENTS OF: src/Pages/Moments.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { supabase } from '@/supabaseClient';
import { MediaItem, FeaturedReel } from '@/Entities/all';
import { Loader2, Camera } from 'lucide-react';

// Helper component to get the public URL (unchanged)
const getMediaUrl = (path) => {
    const { data } = supabase.storage.from('tournament-gallery').getPublicUrl(path);
    return data.publicUrl;
};

// ReelEmbed component (unchanged)
const ReelEmbed = ({ htmlContent }) => {
  useEffect(() => {
    if (window.instgrm) { window.instgrm.Embeds.process(); }
  }, [htmlContent]);
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default function Moments() {
  const [galleries, setGalleries] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllMedia = async () => {
      try {
        setLoading(true);
        const [galleryData, reelData] = await Promise.all([
          MediaItem.getGalleries(),
          FeaturedReel.getActive(),
        ]);
        setGalleries(galleryData);
        setReels(reelData);
      } catch (error) { console.error("Error loading moments page:", error); } 
      finally { setLoading(false); }
    };
    loadAllMedia();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 uppercase tracking-wider">Moments & Gallery</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Relive the action. Explore photos, videos, and social highlights from our events.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-12 h-12 animate-spin text-amber-500" /></div>
        ) : (
          <div className="space-y-20">
            
            {/* --- SECTION 1: Tournament Gallery Albums --- */}
            {galleries.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Tournament Galleries</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {galleries.map(album => (
                            <Link to={`/gallery/${album.id}`} key={album.id} className="group relative aspect-square block cursor-pointer overflow-hidden rounded-xl shadow-lg">
                                {/* Use the first media item as the cover photo */}
                                {album.media_items.length > 0 && (
                                    <img 
                                        src={getMediaUrl(album.media_items[0].storage_path)} 
                                        alt={`Cover for ${album.name} gallery`} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                )}
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                {/* Album Title */}
                                <div className="absolute bottom-0 left-0 p-4">
                                    <h3 className="text-white text-lg font-bold group-hover:text-amber-300 transition-colors">{album.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* --- SECTION 2: Instagram Reels --- */}
            {reels.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Featured Reels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                  {reels.map(reel => (
                    <ReelEmbed key={reel.id} htmlContent={reel.embed_html} />
                  ))}
                </div>
              </section>
            )}

            {/* Fallback if no content exists */}
            {!loading && galleries.length === 0 && reels.length === 0 && (
              <div className="text-center text-slate-500 py-12">
                <Camera className="mx-auto mb-4 w-10 h-10 opacity-60" />
                <p>No moments or galleries available yet. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}