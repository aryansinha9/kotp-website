// FINAL VERSION of src/Pages/Moments.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { MediaItem, FeaturedReel, YouTubeVideo } from '@/Entities/all'; // <-- Import YouTubeVideo
import { Loader2, Camera } from 'lucide-react';

// Helper component to get the public URL for a storage item
const getMediaUrl = (path) => {
  const { data } = supabase.storage.from('tournament-gallery').getPublicUrl(path);
  return data.publicUrl;
};

// Helper component to safely render the Instagram embed HTML
const ReelEmbed = ({ htmlContent }) => {
  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [htmlContent]);
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

// --- NEW HELPER COMPONENT FOR YOUTUBE VIDEOS ---
const YouTubeEmbed = ({ video }) => {
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(video.youtube_url);
  if (!videoId) return <p>Invalid YouTube URL</p>;

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="aspect-video w-full">
      <iframe
        src={embedUrl}
        title={video.title || "Featured YouTube Video"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-xl shadow-lg"
      ></iframe>
    </div>
  );
};

export default function Moments() {
  const [galleries, setGalleries] = useState([]);
  const [reels, setReels] = useState([]);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllMedia = async () => {
      try {
        setLoading(true);
        const [galleryData, reelData, videoData] = await Promise.all([
          MediaItem.getGalleries(),
          FeaturedReel.getActive(),
          YouTubeVideo.getFeatured(),
        ]);

        setGalleries(galleryData);
        setReels(reelData);
        setFeaturedVideo(videoData);
      } catch (error) {
        console.error("Error loading moments page:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllMedia();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 uppercase tracking-wider">
            Moments & Gallery
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Relive the action. Explore photos, videos, and social highlights from our events.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="space-y-20">
            {/* --- SECTION 1: Tournament Galleries --- */}
            {galleries.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                  Tournament Galleries
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleries.map((album) => (
                    <Link
                      to={`/gallery/${album.id}`}
                      key={album.id}
                      className="group relative aspect-square block cursor-pointer overflow-hidden rounded-xl shadow-lg"
                    >
                      {album.media_items.length > 0 ? (
                        <img
                          src={getMediaUrl(album.media_items[0].storage_path)}
                          alt={`Cover for ${album.name} gallery`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="text-white text-lg font-bold group-hover:text-amber-300 transition-colors">
                          {album.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* --- SECTION 2: Featured YouTube Video (moved above reels) --- */}
            {featuredVideo && (
              <section>
                <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                  Featured Youtube
                </h2>
                <div className="max-w-4xl mx-auto">
                  <YouTubeEmbed video={featuredVideo} />
                </div>
              </section>
            )}

            {/* --- SECTION 3: Instagram Reels --- */}
            {reels.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                  Featured Reels
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                  {reels.map((reel) => (
                    <ReelEmbed key={reel.id} htmlContent={reel.embed_html} />
                  ))}
                </div>
              </section>
            )}

            {/* --- FALLBACK MESSAGE --- */}
            {!loading && galleries.length === 0 && reels.length === 0 && !featuredVideo && (
              <div className="text-center py-16">
                <Camera className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-slate-600 mb-2">
                  No Moments to Show Yet
                </h3>
                <p className="text-slate-500">
                  Check back soon for highlights from our latest tournaments!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
