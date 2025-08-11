
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, MapPin, Users, DollarSign, Clock, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function TournamentCard({ tournament }) {
  const daysUntil = differenceInDays(new Date(tournament.start_date), new Date());
  const spotsLeft = tournament.max_teams - tournament.registered_teams;
  const isAlmostFull = spotsLeft <= 5;
  const isEarlyBird = tournament.early_bird_deadline && 
    new Date(tournament.early_bird_deadline) > new Date();

  return (
    <Card className="card-hover border-0 shadow-xl overflow-hidden bg-white/70 backdrop-blur-sm">
      <div className="relative">
        <img
          src={tournament.hero_image || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
          alt={tournament.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isEarlyBird && (
            <Badge className="bg-amber-500 text-white border-amber-400 shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              Early Bird
            </Badge>
          )}
          {isAlmostFull && (
            <Badge className="bg-red-500 text-white border-red-400 shadow-lg animate-pulse">
              <AlertCircle className="w-3 h-3 mr-1" />
              Almost Full
            </Badge>
          )}
        </div>

        {/* Days Until */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-slate-900 text-white shadow-lg border-white/20">
            {daysUntil} days to go
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-4">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{tournament.name}</h3>
        <p className="text-slate-600 leading-relaxed line-clamp-2">{tournament.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-slate-600">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            <span className="font-medium">
              {format(new Date(tournament.start_date), "MMM d")} - {format(new Date(tournament.end_date), "MMM d, yyyy")}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-600">
            <MapPin className="w-5 h-5 text-amber-600" />
            <span className="font-medium">{tournament.venue}</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-600">
            <Users className="w-5 h-5 text-amber-600" />
            <span className="font-medium">
              {tournament.age_groups?.join(", ") || "Multiple age groups"}
            </span>
          </div>

          <div className="flex items-center justify-between">
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
              <div className={`font-bold ${isAlmostFull ? 'text-red-600' : 'text-slate-700'}`}>
                {spotsLeft}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to={createPageUrl("Register")} className="flex-1">
            <Button className="w-full btn-accent font-semibold hover:opacity-90 transition-opacity shadow-md hover:shadow-lg">
              Register Now
            </Button>
          </Link>
          <Link to={createPageUrl(`TournamentDetails?id=${tournament.id}`)}>
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
