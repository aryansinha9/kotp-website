// REPLACE THE CONTENTS OF: src/Pages/Tournaments.jsx

import React, { useState, useEffect } from "react";
import { Tournament } from "@/Entities/all";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Search, Filter, Trophy, XCircle } from "lucide-react";
import TournamentCard from "../Components/Home/TournamentCard"; // Re-using the card from the home page

export default function Tournaments() {
  const [allTournaments, setAllTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        // This fetches all tournaments, not just upcoming ones
        const data = await Tournament.list("-start_date"); 
        setAllTournaments(data);
      } catch (error) {
        console.error("Error loading tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTournaments();
  }, []);

  // Effect to apply filters whenever the source data or filters change
  useEffect(() => {
    let result = allTournaments;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by active tab (status)
    if (activeTab !== 'all') {
      result = result.filter(t => t.status === activeTab);
    }
    
    setFilteredTournaments(result);
  }, [searchTerm, activeTab, allTournaments]);

  const upcomingTournaments = allTournaments.filter(t => t.status === 'upcoming');
  const ongoingTournaments = allTournaments.filter(t => t.status === 'ongoing');
  const completedTournaments = allTournaments.filter(t => t.status === 'completed');

  const clearFilters = () => {
      setSearchTerm("");
      setActiveTab("all");
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 uppercase tracking-wider">KOTP Tournaments</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Find your next challenge. Browse our upcoming, live, and past tournaments.</p>
        </div>

        {/* Filter Card */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Filter className="w-5 h-5" />Filter Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input placeholder="Search by name or venue..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={clearFilters} variant="outline"><XCircle className="w-4 h-4 mr-2" />Clear Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Status */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger value="upcoming">Upcoming ({upcomingTournaments.length})</TabsTrigger>
            <TabsTrigger value="ongoing">Live ({ongoingTournaments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
            <TabsTrigger value="all">All ({allTournaments.length})</TabsTrigger>
          </TabsList>

          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => <div key={i} className="h-96 bg-slate-200 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredTournaments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* THIS IS THE LINE I FIXED */}
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-slate-600 mb-2">No tournaments found</h3>
                <p className="text-slate-500">Try adjusting your search or clearing the filters.</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}