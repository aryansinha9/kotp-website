-- Fix 3: Remove the overly permissive public INSERT policy
-- The Edge Functions use SERVICE_ROLE_KEY which bypasses RLS, so public INSERT is not needed.
-- Run this SQL in your Supabase Dashboard > SQL Editor

DROP POLICY IF EXISTS "Allow public inserts" ON public.parklea_registrations;

-- Verify: After running this, only authenticated users can SELECT, 
-- and only the service_role (Edge Functions) can INSERT.
-- The anon key can no longer insert directly into this table.
