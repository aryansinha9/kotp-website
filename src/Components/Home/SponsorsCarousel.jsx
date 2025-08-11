// REPLACE THE CONTENTS OF: src/Components/home/SponsorsCarousel.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake, ArrowRight } from "lucide-react";

export default function SponsorsCarousel({ sponsors, loading }) {
  if (loading) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 animate-pulse">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="w-32 h-16 bg-slate-200 rounded-lg"></div>))}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Partners</h2>
          <p className="text-xl text-slate-600">Supported by leading brands and organizations</p>
        </div>

        {sponsors.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center mb-12">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="group">
                  <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <img src={sponsor.logo_url} alt={sponsor.name} className="w-24 h-16 object-contain mx-auto filter grayscale group-hover:grayscale-0 transition-all duration-300" />
                  </a>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/sponsors">
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold px-8">
                  <Handshake className="w-4 h-4 mr-2" />Become a Partner<ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Handshake className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Looking for amazing partners to join us!</p>
            <Link to="/sponsors" className="inline-block mt-4">
              <Button className="hero-gradient text-white">Partner With Us</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}