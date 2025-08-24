// REPLACE THE ENTIRE CONTENTS OF: src/Components/home/TournamentCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { CalendarDays, MapPin, Users, DollarSign, Clock, AlertCircle } from "lucide-react";
import { format, differenceInDays, isSameDay } from "date-fns"; // Import isSameDay helper

export default function TournamentCard({ tournament }) {
  // --- WHAT WE ADDED: A check to see if the tournament is completed ---
  const isCompleted = tournament.status === 'completed';

  // Existing logic
  const daysUntil = differenceInDays(new Date(tournament.start_date), new Date());
  const spotsLeft = tournament.max_teams - tournament.registered_teams;
  const isAlmostFull = spotsLeft <= 5;
  const isEarlyBird = tournament.early_bird_deadline && new Date(tournament.early_bird_deadline) > new Date();

  // --- NEW, SMARTER DATE FORMATTING ---
  const formatDateRange = () => {
    const startDate = new Date(tournament.start_date);
    // If end_date is null or invalid, default it to the start date
    const endDate = tournament.end_date ? new Date(tournament.end_date) : startDate;

    if (isSameDay(startDate, endDate)) {
      // If it's a single-day event, show only one date.
      return format(startDate, "MMM d, yyyy");
    } else {
      // For multi-day events
      return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
    }
  };

  return (
    <Card className="flex flex-col h-full border-0 shadow-xl overflow-hidden bg-white/70 backdrop-blur-sm">
      <div className="relative">
        <img src={tournament.hero_image || "https://gjeepzarenavlrnpvyee.supabase.co/storage/v1/object/public/tournament-gallery/site-assets/DSC09562.jpg"} alt={tournament.name} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Only show these badges if the tournament is NOT completed */}
        {!isCompleted && (
          <>
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isEarlyBird && (<Badge className="bg-amber-500 text-white shadow-lg"><Clock className="w-3 h-3 mr-1" />Early Bird</Badge>)}
              {isAlmostFull && (<Badge className="bg-red-500 text-white shadow-lg animate-pulse"><AlertCircle className="w-3 h-3 mr-1" />Almost Full</Badge>)}
            </div>
            <div className="absolute top-4 right-4"><Badge className="bg-slate-900 text-white shadow-lg border-white/20">{daysUntil} days to go</Badge></div>
          </>
        )}
      </div>

      <CardHeader className="pb-4">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{tournament.name}</h3>
        <p className="text-slate-600 leading-relaxed line-clamp-2 flex-grow">{tournament.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-slate-600">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            <span className="font-medium">{formatDateRange()}</span> {/* <-- USE OUR NEW FUNCTION */}
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <MapPin className="w-5 h-5 text-amber-600" />
            <span className="font-medium">{tournament.venue}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Users className="w-5 h-5 text-amber-600" />
            <span className="font-medium">{tournament.age_groups?.join(", ") || "All Ages"}</span>
          </div>
          
          {/* --- WHAT WE CHANGED: Conditionally render the price/spots info --- */}
          {/* This whole block will now only show if the tournament is NOT completed */}
          {!isCompleted && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-slate-600">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <div>
                  {isEarlyBird && tournament.early_bird_fee ? (
                    <div>
                      <span className="font-bold text-slate-800">${tournament.early_bird_fee}</span>
                      <span className="text-sm text-slate-500 line-through ml-2">${tournament.entry_fee}</span>
                    </div>
                  ) : (
                    <span className="font-bold">${tournament.entry_fee}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Spots left</div>
                <div className={`font-bold ${isAlmostFull ? 'text-red-600' : 'text-slate-700'}`}>{spotsLeft}</div>
              </div>
            </div>
          )}
        </div>

        {/* --- WHAT WE CHANGED: Conditionally render the buttons --- */}
        {/* The Register/Details buttons now only show if the tournament is NOT completed */}
        {!isCompleted ? (
          <div className="flex gap-3">
            <Link to={`/register/${tournament.id}`} className="flex-1">
              <Button className="w-full btn-accent font-semibold shadow-md">Register Now</Button>
            </Link>
            <Link to={`/tournament-details?id=${tournament.id}`}>
              <Button variant="outline" className="border-slate-300 text-slate-700">Details</Button>
            </Link>
          </div>
        ) : (
          // For completed tournaments, we can show a link to the gallery instead
          <Link to={`/gallery/${tournament.id}`}>
            <Button variant="outline" className="w-full border-slate-300 text-slate-700">View Gallery</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}