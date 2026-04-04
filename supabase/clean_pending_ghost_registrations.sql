-- Purpose: Clean out failed/abandoned pending registrations
-- that were created during the system offline period earlier today

DELETE FROM public.registrations
WHERE payment_status = 'pending';

DELETE FROM public.tournament_registrations
WHERE payment_status = 'pending';
