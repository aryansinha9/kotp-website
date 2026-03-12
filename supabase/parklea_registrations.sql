-- 1. Create table for Parklea Registrations
CREATE TABLE public.parklea_registrations (
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
    jersey_size TEXT NOT NULL,
    hoodie_size TEXT NOT NULL,
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
ALTER TABLE public.parklea_registrations ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anybody to insert new registrations
CREATE POLICY "Allow public inserts"
    ON public.parklea_registrations
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 4. Policy: Only allow admin reads (if you're using Supabase Auth for Admin)
-- Let's just create an authenticated policy, or allow full selection if using Service Role Key in Dashboard
CREATE POLICY "Allow authenticated reads"
    ON public.parklea_registrations
    FOR SELECT
    TO authenticated
    USING (true);
