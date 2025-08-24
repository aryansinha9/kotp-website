// src/Components/home/HeroSection.jsx (Restored to state before dynamic image)

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock, Star, Loader2 } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";

const HeroSkeleton = () => (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white animate-pulse">
        <div className="h-9 w-96 bg-white/10 rounded-md mx-auto mb-6"></div>
        <div className="h-24 w-full max-w-4xl bg-white/10 rounded-lg mx-auto mb-8"></div>
        <div className="h-8 w-full max-w-3xl bg-white/10 rounded-md mx-auto mb-12"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="h-16 bg-white/10 rounded-2xl"></div>
            <div className="h-16 bg-white/10 rounded-2xl"></div>
            <div className="h-16 bg-white/10 rounded-2xl"></div>
        </div>
    </div>
);


export default function HeroSection({ tournament, loading }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // This is the version with the detailed logging to debug the countdown.
    console.clear();
    console.log("--- Starting Countdown Calculation ---");
    
    if (!tournament?.registration_deadline) {
      console.log("Calculation stopped: No registration deadline found on the tournament object.");
      return;
    }
    
    console.log("1. Raw deadline string from Supabase:", tournament.registration_deadline);

    const calculateTimeLeft = () => {
      const deadline = new Date(tournament.registration_deadline);
      const now = new Date();

      if (isNaN(deadline.getTime())) {
        console.error("2. ERROR: The deadline string could not be parsed into a valid date.");
        return;
      }
      
      console.log("2. Deadline object (in your browser's timezone):", deadline.toString());
      console.log("3. 'Now' object (your computer's current time):", now.toString());
      
      const diff = differenceInSeconds(deadline, now);
      console.log("4. Difference in seconds (deadline - now):", diff);
      
      if (diff <= 0) {
        console.log("5. Result: Difference is zero or negative. Setting countdown to 0.");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = Math.floor(diff % 60);

      console.log(`5. Result: Setting countdown to ${days}d, ${hours}h, ${minutes}m, ${seconds}s.`);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    
    const timer = setInterval(calculateTimeLeft, 5000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [tournament]);

  const spotsLeft = tournament ? tournament.max_teams - tournament.registered_teams : 0;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {/* This uses the original, hardcoded Unsplash URL */}
        <img src={"https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/IMG_7059.jpg"} alt="Football tournament action" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
      </div>
      
      {loading && <HeroSkeleton />}

      {!loading && tournament && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pb-16">
          <div className="mb-6">
            <Badge className="bg-white/10 text-amber-300 border-amber-300/30 px-4 py-2 text-sm font-semibold shadow-lg">
              <Star className="w-4 h-4 mr-2 text-amber-300" fill="currentColor" />
              FEATURED UPCOMING EVENT
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-8 uppercase">
            {tournament.name}
            <span className="block text-2xl md:text-3xl lg:text-4xl font-semibold text-amber-300 mt-2 normal-case">
              {format(new Date(tournament.start_date), "MMMM d")}
              {
                format(new Date(tournament.start_date), 'd') !== format(new Date(tournament.end_date), 'd') &&
                ` – ${format(new Date(tournament.end_date), "d")}`
              }
              {`, ${format(new Date(tournament.end_date), "yyyy")}`}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
            {tournament.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <CalendarDays className="w-6 h-6 text-amber-400" />
              <div className="text-left"><p className="font-semibold">
                {format(new Date(tournament.start_date), "MMM d")}
                {format(new Date(tournament.start_date), 'd') !== format(new Date(tournament.end_date), 'd') && ` - ${format(new Date(tournament.end_date), "d")}`}
            </p><p className="text-sm text-white/70">Full day of action</p></div>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <MapPin className="w-6 h-6 text-amber-400" />
              <div className="text-left"><p className="font-semibold">{tournament.venue}</p><p className="text-sm text-white/70">Sydney, NSW</p></div>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Users className="w-6 h-6 text-amber-400" />
              <div className="text-left"><p className="font-semibold">{tournament.age_groups?.join(', ')}</p><p className="text-sm text-white/70">Age Groups</p></div>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-lg text-slate-300 mb-4 font-medium">Registration Closes In:</p>
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
              {[{ label: 'Days', value: timeLeft.days }, { label: 'Hours', value: timeLeft.hours }, { label: 'Minutes', value: timeLeft.minutes }, { label: 'Seconds', value: timeLeft.seconds }].map((item) => (
                <div key={item.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-3xl font-bold">{String(item.value).padStart(2, '0')}</div><div className="text-sm text-white/70">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/register/${tournament.id}`}>
              <Button className="btn-accent font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">Register Your Team</Button>
            </Link>
            <Link to="/moments">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 font-bold text-lg px-8 py-4 rounded-xl">Watch Highlights</Button>
            </Link>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2"> 
            <Badge className="bg-amber-500 text-white border-amber-400 px-4 py-2 animate-pulse inline-flex">
              <Clock className="w-4 h-4 mr-2" />
              Only {spotsLeft} spots remaining!
            </Badge>
          </div>
        </div>
      )}

      {!loading && !tournament && (
           <div className="relative z-10 text-center text-white">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 uppercase">King of the Pitch</h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12">The ultimate stage for youth football. No upcoming tournaments scheduled. Check back soon!</p>
                <Link to="/tournaments"><Button size="lg" className="btn-accent">View Past Tournaments</Button></Link>
           </div>
      )}
    </section>
  );
}