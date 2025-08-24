// src/Components/home/MomentsPreview.jsx (Final version with Frame Hover Effect)

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, ArrowRight, Video } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'tournament-gallery';
const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

export default function MomentsPreview({ moments, loading }) {
  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto"><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1, 2, 3].map((i) => (<div key={i} className="aspect-video bg-slate-200 rounded-2xl animate-pulse"></div>))}</div></div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tournament Moments</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Relive the excitement, passion, and incredible skills from our tournaments</p>
        </div>

        {moments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {moments.slice(0, 3).map((moment, index) => (
                <div key={moment.id} className={`${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} group`}>
                  {/* --- THE FIX: The hover effect is now on this parent div --- */}
                  <div className="relative overflow-hidden rounded-2xl shadow-xl h-full transition-transform duration-300 ease-in-out group-hover:scale-105">
                    {moment.type === 'video' ? (
                      <video
                        src={`${STORAGE_BASE_URL}${moment.storage_path}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        // The video/image no longer needs hover classes, it just fills the container
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={`${STORAGE_BASE_URL}${moment.storage_path}`} 
                        alt={moment.title || 'Tournament moment'} 
                        className={`w-full h-full object-cover`} 
                      />
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/60 to-transparent">
                      <h3 className={`font-bold ${index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'}`}>{moment.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/moments">
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold px-8">
                  <Camera className="w-4 h-4 mr-2" />View All Moments<ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No featured moments available yet.</p>
            <p className="text-slate-400">Check back after our next tournament!</p>
          </div>
        )}
      </div>
    </section>
  );
}