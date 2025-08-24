// PASTE THIS CODE INTO: src/Pages/Sponsors.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sponsor } from "@/Entities/all";
import { Button } from "@/Components/ui/button";
import { Handshake } from "lucide-react";

export default function Sponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A function to load all sponsors from the database
    const loadSponsors = async () => {
      try {
        setLoading(true);
        // We will create a `list` function in our Sponsor entity
        const data = await Sponsor.list();
        setSponsors(data);
      } catch (error) {
        console.error("Error loading sponsors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSponsors();
  }, []);

  // A placeholder skeleton loader to show while data is fetching
  const SkeletonLoader = () => (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
      <div className="w-24 h-16 mx-auto bg-slate-200 rounded-lg animate-pulse"></div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 uppercase tracking-wider">
            Our Valued Partners
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We are proud to be supported by these amazing organizations who believe in the power of youth sports.
          </p>
        </div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center mb-20">
          {loading ? (
            // If loading, show 10 skeleton loaders
            Array.from({ length: 10 }).map((_, i) => <SkeletonLoader key={i} />)
          ) : (
            // Otherwise, show the real sponsors
            sponsors.map((sponsor) => (
              <div key={sponsor.id} className="group text-center">
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                >
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="w-28 h-20 object-contain mx-auto filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </a>
                <p className="mt-4 text-sm font-semibold text-slate-700">{sponsor.name}</p>
                <p className="text-xs text-slate-500 capitalize">{sponsor.tier} Partner</p>
              </div>
            ))
          )}
        </div>

        {/* Call to Action Section */}
        <div className="text-center bg-slate-50 p-12 rounded-2xl">
            <Handshake className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Become a Partner</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8">
                Interested in supporting the next generation of football talent? Partner with us to gain brand visibility and make a positive impact in the community.
            </p>
            <Link to="/contact">
                <Button className="btn-accent font-semibold px-8 py-3 text-lg">Contact Us</Button>
            </Link>
        </div>
      </div>
    </div>
  );
}