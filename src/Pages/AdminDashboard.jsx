// REPLACE THE CONTENTS OF: src/Pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { Registration } from '@/Entities/all';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Import Badge for styling the status
import { format } from 'date-fns';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        setLoading(true);
        const data = await Registration.list();
        setRegistrations(data);
      } catch (error) {
        console.error("Failed to load registrations", error);
      } finally {
        setLoading(false);
      }
    };
    loadRegistrations();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };
  
  // A helper to style the payment status badge
  const getStatusBadgeVariant = (status) => {
      switch (status) {
          case 'paid': return 'bg-green-100 text-green-800';
          case 'pending': return 'bg-amber-100 text-amber-800';
          default: return 'bg-slate-100 text-slate-800';
      }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          onClick={handleLogout} 
          variant="destructive" 
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </Button>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Registrations ({registrations.length})</h2>
        {loading ? (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        ) : (
            <div className="border rounded-lg overflow-x-auto"> {/* Added overflow for smaller screens */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Tournament</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Age Group</TableHead>
                            <TableHead>Division</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Special Requests</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {registrations.map((reg) => (
                            <TableRow key={reg.id}>
                                <TableCell className="font-medium">{reg.team_name}</TableCell>
                                <TableCell>{reg.tournaments ? reg.tournaments.name : 'N/A'}</TableCell>
                                <TableCell>{reg.contact_person}</TableCell>
                                <TableCell>{reg.email}</TableCell>
                                <TableCell>{reg.phone}</TableCell>
                                <TableCell>{reg.age_group}</TableCell>
                                <TableCell>{reg.division || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge className={`capitalize ${getStatusBadgeVariant(reg.payment_status)}`}>
                                        {reg.payment_status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{reg.special_requirements || 'None'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}
      </div>
    </div>
  );
}