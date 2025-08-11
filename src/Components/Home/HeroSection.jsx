// REPLACE THE CONTENTS OF: src/Components/home/HeroSection.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock, Star } from "lucide-react";

export default function HeroSection() {
    // Timer logic remains the same
    const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 16, minutes: 32, seconds: 45 });
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Video/Image */}
            <div className="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80" alt="Football tournament action" className="w-full h-full object-cover" />
                <div className="absolute inset-0 hero-gradient opacity-90"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <div className="mb-6">
                    <Badge className="bg-white/10 text-amber-300 border-amber-300/30 px-4 py-2 text-sm font-semibold shadow-lg">
                        <Star className="w-4 h-4 mr-2 text-amber-300" fill="currentColor" />
                        KING OF THE PITCH TOURNAMENT SERIES
                    </Badge>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-8 uppercase">
                    King of the Pitch
                    <span className="block text-2xl md:text-3xl lg:text-4xl font-semibold text-amber-300 mt-2 normal-case">Sydney Summer Cup • Sept 14–16</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
                    The ultimate stage for youth football. Compete with the best, showcase your talent, and become a champion.
                </p>

                {/* Quick Facts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                        <CalendarDays className="w-6 h-6 text-amber-400" /><div className="text-left"><p className="font-semibold">Sept 14-16</p><p className="text-sm text-white/70">3 Days of Action</p></div>
                    </div>
                    <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                        <MapPin className="w-6 h-6 text-amber-400" /><div className="text-left"><p className="font-semibold">Olympic Park</p><p className="text-sm text-white/70">Sydney, NSW</p></div>
                    </div>
                    <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                        <Users className="w-6 h-6 text-amber-400" /><div className="text-left"><p className="font-semibold">U12 - U18</p><p className="text-sm text-white/70">Age Groups</p></div>
                    </div>
                </div>

                {/* Countdown Timer */}
                <div className="mb-12">
                    <p className="text-lg text-emerald-200 mb-4 font-medium">Registration Closes In:</p>
                    <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
                        {[{ label: 'Days', value: timeLeft.days }, { label: 'Hours', value: timeLeft.hours }, { label: 'Minutes', value: timeLeft.minutes }, { label: 'Seconds', value: timeLeft.seconds }].map((item) => (
                            <div key={item.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                                <div className="text-3xl font-bold">{item.value.toString().padStart(2, '0')}</div>
                                <div className="text-sm text-white/70">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register">
                        <Button className="btn-accent font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            Register Your Team
                        </Button>
                    </Link>
                    <Link to="/moments">
                        <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 font-bold text-lg px-8 py-4 rounded-xl">
                            Watch Highlights
                        </Button>
                    </Link>
                </div>

                {/* Urgency Badge */}
                <div className="mt-8">
                    <Badge className="bg-amber-500 text-white border-amber-400 px-4 py-2 animate-pulse">
                        <Clock className="w-4 h-4 mr-2" />
                        Only 12 spots remaining!
                    </Badge>
                </div>
            </div>
        </section>
    );
}