-- =============================================================================
-- ADD team_type COLUMN TO tournament_registrations
-- Run this in the Supabase SQL Editor
-- =============================================================================

ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS team_type TEXT CHECK (team_type IN ('Champion', 'Challenger'));
