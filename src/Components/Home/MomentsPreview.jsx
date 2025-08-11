import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Camera, Heart, ArrowRight } from "lucide-react";

export default function MomentsPreview({ moments, loading }) {
  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Tournament Moments
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Relive the excitement, passion, and incredible skills from our tournaments
          </p>
        </div>

        {moments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {moments.slice(0, 3).map((moment, index) => (
                <div key={moment.id} className={`${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} group cursor-pointer`}>
                  <div className="relative overflow-hidden rounded-2xl shadow-xl card-hover">
                    <img
                      src={moment.thumbnail || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                      alt={moment.title}
                      className={`w-full object-cover ${index === 0 ? 'h-80 md:h-full' : 'h-48'}`}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300"></div>
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        {moment.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} className="bg-emerald-500 text-white text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className={`font-bold ${index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'} mb-2`}>
                        {moment.title}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {moment.description}
                      </p>
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
              ))}
            </div>

            <div className="text-center">
              <Link to={createPageUrl("Moments")}>
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold px-8">
                  <Camera className="w-4 h-4 mr-2" />
                  View All Moments
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No featured moments available yet.</p>
            <p className="text-slate-400">Check back after our next tournament!</p>
          </div>
        )}
      </div>
    </section>
  );
}