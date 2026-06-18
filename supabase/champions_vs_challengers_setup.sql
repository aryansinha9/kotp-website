-- =============================================================================
-- CHAMPIONS VS CHALLENGERS TOURNAMENT SETUP
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================================

-- STEP 1: Add min_players and max_players columns to the tournaments table
-- These columns allow each tournament to define its own roster size limits.
-- They default to the existing World Cup values (7 min, 10 max) so all existing
-- tournaments are unaffected.

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS min_players INT NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS max_players INT NOT NULL DEFAULT 10;

-- STEP 2: Insert the new tournament
-- Note: hero_image_path is omitted because the column may not exist in your schema.
-- The frontend already shows a fallback image when no hero image is set.
-- You can add the image URL directly in the Supabase dashboard if needed.

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
  'KOTP and Ultimate Soccer Present: Champions vs Challengers',
  '2026-07-26',
  '2026-07-26',
  'Ultimate Soccer',
  300,
  ARRAY['Open'],
  'upcoming',
  5,
  10
);

-- STEP 3: Verify the insert was successful
SELECT id, name, start_date, entry_fee, status, min_players, max_players
FROM public.tournaments
WHERE name = 'KOTP and Ultimate Soccer Present: Champions vs Challengers';
