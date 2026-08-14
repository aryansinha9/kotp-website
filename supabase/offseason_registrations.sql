-- 1. Create table for Off-season Summer Program Registrations
CREATE TABLE public.offseason_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    payment_status TEXT DEFAULT 'pending' NOT NULL,
    stripe_session_id TEXT,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,

    -- Athlete Details
    participant_name TEXT NOT NULL,
    dob DATE NOT NULL,
    age_turning_2026 INTEGER NOT NULL,
    position TEXT NOT NULL,

    -- Parent Details
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    home_address TEXT NOT NULL,

    -- Apparel Size Options
    team TEXT NOT NULL,
    jersey_size TEXT NOT NULL,
    shorts_size TEXT NOT NULL,
    socks_size TEXT NOT NULL,

    -- Medical Info
    has_medical_condition TEXT NOT NULL,
    medical_description TEXT,
    has_medication TEXT NOT NULL,
    medication_details TEXT,

    -- Legal
    agreed_to_terms BOOLEAN NOT NULL,
    signature TEXT NOT NULL,
    signature_date DATE NOT NULL,
    package_type TEXT NOT NULL DEFAULT 'standard'
);

-- 2. Add Row Level Security (RLS) to restrict public access
ALTER TABLE public.offseason_registrations ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Only allow admin reads.
-- Note: no public INSERT policy is created here on purpose. The Edge Function
-- uses the SERVICE_ROLE_KEY which bypasses RLS, so the anon key must not be
-- able to insert directly (this mirrors fix_rls_policy.sql for parklea).
CREATE POLICY "Allow authenticated reads"
    ON public.offseason_registrations
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. Policy: Allow authenticated admins to delete registrations
CREATE POLICY "Allow authenticated deletes"
    ON public.offseason_registrations
    FOR DELETE USING (auth.role() = 'authenticated');
