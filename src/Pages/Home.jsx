// src/Pages/Home.jsx (with updated data processing)

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tournament, MediaItem, Sponsor } from "@/Entities/all";
import { Button } from "@/Components/ui/button";
import { Trophy, Star, ArrowRight, CreditCard, Zap, Users, Handshake } from "lucide-react";

import HeroSection from "../Components/Home/HeroSection";
import TournamentCard from "../Components/Home/TournamentCard";
import MomentsPreview from "../Components/Home/MomentsPreview";
import SponsorsCarousel from "../Components/Home/SponsorsCarousel";
import StatsSection from "../Components/Home/StatsSection";

export default function Home() {
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [featuredTournament, setFeaturedTournament] = useState(null);
  const [featuredMedia, setFeaturedMedia] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tournamentsData, galleriesData, sponsorsData] = await Promise.all([
          Tournament.filter({ status: "upcoming" }, "start_date", 3),
          MediaItem.getGalleries(),
          Sponsor.filter({ active: true }, "tier", 8)
        ]);
        
        setUpcomingTournaments(tournamentsData);
        setSponsors(sponsorsData);
        
        if (tournamentsData && tournamentsData.length > 0) {
            setFeaturedTournament(tournamentsData[0]);
        }

        // Process galleriesData to get a flat list of media items
        if (galleriesData && galleriesData.length > 0) {
          // 1. Flatten the nested media_items from all tournaments into one array
          const allMediaItems = galleriesData.flatMap(gallery => gallery.media_items || []);
          // 2. Filter to get only the videos
          const allVideos = allMediaItems.filter(item => item.type === 'video');
          // 3. Set this as our featured media
          setFeaturedMedia(allVideos);
        }

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection tournament={featuredTournament} loading={loading} />

      {/* Upcoming Tournaments */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Upcoming Tournaments</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Join the most competitive youth football tournaments in the region. Limited spots available.</p>
          </div>

          {!loading && upcomingTournaments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
             !loading && <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No upcoming tournaments at the moment.</p>
              <p className="text-slate-400">Check back soon for new announcements!</p>
            </div>
          )}

          <div className="text-center">
            <Link to="/tournaments">
              <Button variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50 font-semibold">
                View All Tournaments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
                  <p className="text-xl text-slate-600">Get your team registered in just three simple steps</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{[{step: "01", title: "Sign Up", description: "Register your team and provide player details through our streamlined online form.", icon: Users, color: "bg-slate-800"}, {step: "02", title: "Pay", description: "Secure your spot with our easy online payment system. Early bird discounts available.", icon: CreditCard, color: "bg-slate-800"}, {step: "03", title: "Play", description: "Show up ready to compete at world-class venues with professional officiating.", icon: Zap, color: "bg-slate-800"}].map((item) => (<div key={item.step} className="text-center group"><div className={`w-20 h-20 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}><item.icon className="w-10 h-10 text-amber-400" /></div><div className="text-sm font-bold text-slate-500 mb-2">STEP {item.step}</div><h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3><p className="text-slate-600 text-lg leading-relaxed">{item.description}</p></div>))}</div>
          </div>
      </section>

      <MomentsPreview moments={featuredMedia} loading={loading} />
      <StatsSection />
      
      {/* Sponsors Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Ventures</h2><p className="text-xl text-slate-600 max-w-3xl mx-auto">We're proud to collaborate with leading brands to bring the best youth football experience.</p></div>
              {!loading && sponsors.length > 0 ? (<><SponsorsCarousel sponsors={sponsors} loading={loading} /><div className="text-center mt-12"><Link to="/sponsors"><Button variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50 font-semibold px-8"><Handshake className="w-4 h-4 mr-2" />Become a Partner<ArrowRight className="w-4 h-4 ml-2" /></Button></Link></div></>) : (!loading && <div className="text-center py-12"><Star className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500 text-lg">No partners listed at the moment.</p><p className="text-slate-400">Interested in supporting youth sports?</p><Link to="/sponsors" className="inline-block mt-4"><Button className="bg-amber-500 text-white hover:bg-amber-600">Partner With Us</Button></Link></div>)}
          </div>
      </section>
      
      {/* Newsletter CTA */}
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"><h2 className="text-3xl md:text-4xl font-bold mb-6">Never Miss a Tournament</h2><p className="text-xl mb-8 text-emerald-100">Get notified about new tournaments, early bird pricing, and exclusive updates.</p><div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"><input type="email" placeholder="Enter your email" className="flex-1 px-6 py-3 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-white/20" /><Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 py-3">Subscribe</Button></div><p className="text-sm text-emerald-200 mt-4">No spam, unsubscribe at any time.</p></div>
      </section>
    </div>
  );
}