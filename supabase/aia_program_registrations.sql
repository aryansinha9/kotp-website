-- Run this in the Supabase SQL Editor to create the AIA program registrations table.

CREATE TABLE public.aia_program_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    payment_status TEXT DEFAULT 'pending_payment' NOT NULL,
    stripe_session_id TEXT,
    stripe_customer_id TEXT,

    -- Athlete Details
    participant_first_name TEXT NOT NULL,
    participant_last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    year_group TEXT NOT NULL,

    -- Parent/Guardian Details
    parent_first_name TEXT NOT NULL,
    parent_last_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT NOT NULL,

    -- Address
    street_address TEXT NOT NULL,
    street_address2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,

    -- Medical Info
    allergies TEXT NOT NULL,
    inhaler TEXT NOT NULL,

    -- Legal
    agreed_to_terms BOOLEAN NOT NULL,
    signature TEXT NOT NULL,
    signature_date DATE NOT NULL,

    -- Marketing / Referrals
    how_did_you_hear TEXT,
    interested_programs TEXT,
    referral_first_name TEXT,
    referral_last_name TEXT
);

-- Row Level Security
ALTER TABLE public.aia_program_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a registration (public form)
CREATE POLICY "Allow public inserts"
    ON public.aia_program_registrations
    FOR INSERT TO public
    WITH CHECK (true);

-- Allow authenticated users (admin) to read all registrations
CREATE POLICY "Allow authenticated reads"
    ON public.aia_program_registrations
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users (admin) to delete registrations
CREATE POLICY "Allow authenticated deletes"
    ON public.aia_program_registrations
    FOR DELETE TO authenticated
    USING (true);

-- Allow service role (Edge Functions) to update payment status
CREATE POLICY "Allow service role updates"
    ON public.aia_program_registrations
    FOR UPDATE TO service_role
    USING (true)
    WITH CHECK (true);
