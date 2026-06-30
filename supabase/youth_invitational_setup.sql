-- =============================================================================
-- KOTP YOUTH INVITATIONAL TOURNAMENT SETUP
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================================

-- STEP 1: Add division column to tournament_registrations (if not exists)
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS division TEXT;

-- STEP 2: Insert the new tournament
INSERT INTO public.tournaments (
  name,
  start_date,
  end_date,
  venue,
  entry_fee,
  age_groups,
  status,
  min_players,
  max_players
) VALUES (
  'KOTP Youth Invitational',
  '2026-08-09',
  '2026-08-09',
  'Ultimate Soccer',
  300,
  ARRAY['U12-14', 'U9-11'],
  'upcoming',
  5,
  10
);

-- STEP 3: Verify
SELECT id, name, start_date, entry_fee, status, min_players, max_players
FROM public.tournaments
WHERE name = 'KOTP Youth Invitational';
