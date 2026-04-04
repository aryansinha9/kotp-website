-- Run this SQL in the Supabase SQL Editor

CREATE TABLE public.tournament_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    players JSONB NOT NULL,
    medical_info TEXT,
    agreed_to_terms BOOLEAN NOT NULL,
    signature TEXT NOT NULL,
    signature_date DATE NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anon users (for public registration forms)
CREATE POLICY "Allow public inserts" ON public.tournament_registrations
    FOR INSERT WITH CHECK (true);

-- Allow admins to view all registrations
CREATE POLICY "Allow authenticated full access" ON public.tournament_registrations
    FOR SELECT USING (auth.role() = 'authenticated');
    
-- Allow admins to update status/sessions
CREATE POLICY "Allow authenticated update access" ON public.tournament_registrations
    FOR UPDATE USING (auth.role() = 'authenticated');
