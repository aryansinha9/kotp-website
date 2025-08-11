
import React, { useState, useEffect } from "react";
import { Tournament } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Calendar, MapPin, Users, Trophy } from "lucide-react";

import TournamentCard from "../Components/Home/TournamentCard";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageGroupFilter, setAgeGroupFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await Tournament.list("-start_date");
      setTournaments(data);
    } catch (error) {
      console.error("Error loading tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter;
    
    const matchesAgeGroup = ageGroupFilter === "all" || 
                           tournament.age_groups?.includes(ageGroupFilter);
    
    const matchesTab = activeTab === "all" || tournament.status === activeTab;
    
    return matchesSearch && matchesStatus && matchesAgeGroup && matchesTab;
  });

  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming");
  const ongoingTournaments = tournaments.filter(t => t.status === "ongoing");
  const completedTournaments = tournaments.filter(t => t.status === "completed");

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 uppercase tracking-wider">
            KOTP Tournaments
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Find your next challenge. Browse our upcoming, live, and past tournaments.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filter Tournaments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tournaments or venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Age Groups</SelectItem>
                  <SelectItem value="U12">U12</SelectItem>
                  <SelectItem value="U14">U14</SelectItem>
                  <SelectItem value="U16">U16</SelectItem>
                  <SelectItem value="U18">U18</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 data-[state=active]:shadow-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming ({upcomingTournaments.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 data-[state=active]:shadow-sm">
              <Trophy className="w-4 h-4 mr-2" />
              Live ({ongoingTournaments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 data-[state=active]:shadow-sm">
              <Badge className="w-4 h-4 mr-2" />
              Completed ({completedTournaments.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 data-[state=active]:shadow-sm">
              All ({tournaments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                    <CardContent className="p-6 space-y-4">
                      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTournaments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-slate-600 mb-2">
                  No tournaments found
                </h3>
                <p className="text-slate-500 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setAgeGroupFilter("all");
                    setActiveTab("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
