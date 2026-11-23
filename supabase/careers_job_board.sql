-- ============================================================================
-- KOTP Careers / Job Board
-- ----------------------------------------------------------------------------
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).
-- It is idempotent: safe to re-run.
--
-- Security model
--   * Job listings are world-readable ONLY while published (status = 'open').
--     Everything else (drafts, closed roles, internal notes) is admin-only.
--   * Applicant records are NEVER readable or writable with the anon key.
--     Submissions arrive through the `submit-job-application` Edge Function,
--     which uses the service-role key after validating the payload.
--   * Admin access is an explicit allow-list (`public.job_admins`), not merely
--     "any authenticated user". Applicant data is sensitive personal
--     information, so being signed in is not by itself enough.
--   * Resumes live in a PRIVATE storage bucket. There is no public read path;
--     admins fetch them through short-lived signed URLs.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Admin allow-list + helper
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_admins (
    user_id    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_admins ENABLE ROW LEVEL SECURITY;

-- Seed with every existing dashboard user. The KOTP site has no public
-- sign-up: the only auth users are staff. New admins must be added
-- deliberately (see the INSERT at the bottom of this file).
INSERT INTO public.job_admins (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- SECURITY DEFINER so policies can read the allow-list without needing a
-- policy on job_admins itself (which would recurse).
CREATE OR REPLACE FUNCTION public.is_job_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.job_admins ja WHERE ja.user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_job_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_job_admin() TO authenticated, service_role;

-- Admins may see who else is an admin; only the service role may change it.
DROP POLICY IF EXISTS "Admins read admin list" ON public.job_admins;
CREATE POLICY "Admins read admin list"
    ON public.job_admins FOR SELECT TO authenticated
    USING (public.is_job_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Shared trigger: keep updated_at honest (named for this feature so it
--    cannot collide with an existing helper of the same purpose)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.job_board_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Job listings
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_listings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by         UUID REFERENCES auth.users (id) ON DELETE SET NULL,

    -- Identity
    slug               TEXT NOT NULL UNIQUE
                       CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    title              TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    department         TEXT,
    location           TEXT,
    workplace_type     TEXT NOT NULL DEFAULT 'on_site'
                       CHECK (workplace_type IN ('on_site', 'hybrid', 'remote')),
    employment_type    TEXT NOT NULL DEFAULT 'full_time'
                       CHECK (employment_type IN ('full_time', 'part_time', 'contract',
                                                  'casual', 'internship', 'volunteer',
                                                  'temporary', 'seasonal')),
    experience_level   TEXT CHECK (experience_level IS NULL OR experience_level IN
                       ('entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'executive')),

    -- Content
    summary            TEXT,                                   -- teaser on the cards
    description        TEXT NOT NULL DEFAULT '',               -- "About the role"
    responsibilities   TEXT[] NOT NULL DEFAULT '{}',
    requirements       TEXT[] NOT NULL DEFAULT '{}',
    qualifications     TEXT[] NOT NULL DEFAULT '{}',
    benefits           TEXT[] NOT NULL DEFAULT '{}',
    skills             TEXT[] NOT NULL DEFAULT '{}',
    about_team         TEXT,
    how_to_apply       TEXT,

    -- Compensation (optional, hidden unless salary_visible)
    salary_min         NUMERIC(12, 2) CHECK (salary_min IS NULL OR salary_min >= 0),
    salary_max         NUMERIC(12, 2) CHECK (salary_max IS NULL OR salary_max >= 0),
    salary_currency    TEXT NOT NULL DEFAULT 'AUD',
    salary_period      TEXT NOT NULL DEFAULT 'year'
                       CHECK (salary_period IN ('hour', 'day', 'week', 'month', 'year', 'project')),
    salary_visible     BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT job_listings_salary_range CHECK (
        salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min
    ),

    -- Lifecycle
    status             TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'open', 'closed', 'archived')),
    openings           INTEGER NOT NULL DEFAULT 1 CHECK (openings >= 1),
    published_at       TIMESTAMPTZ,
    application_deadline DATE,
    sort_order         INTEGER NOT NULL DEFAULT 0,

    -- Application settings
    contact_email      TEXT,
    requires_resume    BOOLEAN NOT NULL DEFAULT true,
    allow_cover_letter BOOLEAN NOT NULL DEFAULT true,
    allow_projects     BOOLEAN NOT NULL DEFAULT true,
    allow_links        BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS job_listings_status_idx   ON public.job_listings (status);
CREATE INDEX IF NOT EXISTS job_listings_slug_idx     ON public.job_listings (slug);
CREATE INDEX IF NOT EXISTS job_listings_ordering_idx ON public.job_listings (sort_order, published_at DESC);

DROP TRIGGER IF EXISTS job_listings_set_updated_at ON public.job_listings;
CREATE TRIGGER job_listings_set_updated_at
    BEFORE UPDATE ON public.job_listings
    FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();

-- Stamp published_at the first time a role goes live.
CREATE OR REPLACE FUNCTION public.job_listings_stamp_published()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'open' AND NEW.published_at IS NULL THEN
        NEW.published_at = now();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS job_listings_stamp_published ON public.job_listings;
CREATE TRIGGER job_listings_stamp_published
    BEFORE INSERT OR UPDATE ON public.job_listings
    FOR EACH ROW EXECUTE FUNCTION public.job_listings_stamp_published();

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- Public: published roles only. Drafts, closed and archived roles stay hidden.
DROP POLICY IF EXISTS "Public reads open listings" ON public.job_listings;
CREATE POLICY "Public reads open listings"
    ON public.job_listings FOR SELECT TO anon, authenticated
    USING (status = 'open');

DROP POLICY IF EXISTS "Admins read all listings" ON public.job_listings;
CREATE POLICY "Admins read all listings"
    ON public.job_listings FOR SELECT TO authenticated
    USING (public.is_job_admin());

DROP POLICY IF EXISTS "Admins insert listings" ON public.job_listings;
CREATE POLICY "Admins insert listings"
    ON public.job_listings FOR INSERT TO authenticated
    WITH CHECK (public.is_job_admin());

DROP POLICY IF EXISTS "Admins update listings" ON public.job_listings;
CREATE POLICY "Admins update listings"
    ON public.job_listings FOR UPDATE TO authenticated
    USING (public.is_job_admin()) WITH CHECK (public.is_job_admin());

DROP POLICY IF EXISTS "Admins delete listings" ON public.job_listings;
CREATE POLICY "Admins delete listings"
    ON public.job_listings FOR DELETE TO authenticated
    USING (public.is_job_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Screening questions (per listing)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    job_id          UUID NOT NULL REFERENCES public.job_listings (id) ON DELETE CASCADE,

    position        INTEGER NOT NULL DEFAULT 0,
    label           TEXT NOT NULL CHECK (char_length(trim(label)) > 0),
    help_text       TEXT,
    question_type   TEXT NOT NULL DEFAULT 'short_text'
                    CHECK (question_type IN ('short_text', 'long_text', 'single_select',
                                             'multi_select', 'boolean', 'number',
                                             'date', 'url')),
    options         JSONB NOT NULL DEFAULT '[]'::JSONB,   -- ["Yes","No"] for selects
    required        BOOLEAN NOT NULL DEFAULT false,
    max_length      INTEGER CHECK (max_length IS NULL OR max_length BETWEEN 1 AND 10000),

    -- Screening / knock-out: when the answer is not acceptable the application
    -- is refused up-front and nothing is stored (data minimisation).
    is_knockout        BOOLEAN NOT NULL DEFAULT false,
    knockout_expected  JSONB NOT NULL DEFAULT '[]'::JSONB,  -- accepted values
    knockout_min       NUMERIC,
    knockout_max       NUMERIC,
    knockout_message   TEXT,

    CONSTRAINT job_questions_options_is_array
        CHECK (jsonb_typeof(options) = 'array'),
    CONSTRAINT job_questions_knockout_is_array
        CHECK (jsonb_typeof(knockout_expected) = 'array')
);

CREATE INDEX IF NOT EXISTS job_questions_job_idx ON public.job_questions (job_id, position);

DROP TRIGGER IF EXISTS job_questions_set_updated_at ON public.job_questions;
CREATE TRIGGER job_questions_set_updated_at
    BEFORE UPDATE ON public.job_questions
    FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();

ALTER TABLE public.job_questions ENABLE ROW LEVEL SECURITY;

-- The public gets NO policy on this table: knock-out answer keys
-- (knockout_expected / min / max) must never leave the server. Applicants read
-- the questions through the column-limited `open_job_questions` view below, and
-- the authoritative screening check runs in the Edge Function.
DROP POLICY IF EXISTS "Public reads questions for open listings" ON public.job_questions;

DROP POLICY IF EXISTS "Admins read all questions" ON public.job_questions;
CREATE POLICY "Admins read all questions"
    ON public.job_questions FOR SELECT TO authenticated
    USING (public.is_job_admin());

DROP POLICY IF EXISTS "Admins insert questions" ON public.job_questions;
CREATE POLICY "Admins insert questions"
    ON public.job_questions FOR INSERT TO authenticated
    WITH CHECK (public.is_job_admin());

DROP POLICY IF EXISTS "Admins update questions" ON public.job_questions;
CREATE POLICY "Admins update questions"
    ON public.job_questions FOR UPDATE TO authenticated
    USING (public.is_job_admin()) WITH CHECK (public.is_job_admin());

DROP POLICY IF EXISTS "Admins delete questions" ON public.job_questions;
CREATE POLICY "Admins delete questions"
    ON public.job_questions FOR DELETE TO authenticated
    USING (public.is_job_admin());

-- Public, deliberately column-limited projection of the questions for a live
-- role. Owner-rights (no security_invoker) so it works without granting anon
-- any access to the base table; the status filter is baked in and the
-- screening columns are simply absent.
CREATE OR REPLACE VIEW public.open_job_questions AS
    SELECT q.id,
           q.job_id,
           q.position,
           q.label,
           q.help_text,
           q.question_type,
           q.options,
           q.required,
           q.max_length
    FROM public.job_questions q
    JOIN public.job_listings jl ON jl.id = q.job_id
    WHERE jl.status = 'open';

ALTER VIEW public.open_job_questions SET (security_invoker = false);
GRANT SELECT ON public.open_job_questions TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Applications (sensitive personal information)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_applications (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    job_id             UUID REFERENCES public.job_listings (id) ON DELETE SET NULL,
    job_title_snapshot TEXT NOT NULL DEFAULT '',   -- survives listing deletion
    reference          TEXT NOT NULL UNIQUE,       -- e.g. KOTP-7F3K9A

    -- Applicant details
    first_name         TEXT NOT NULL,
    last_name          TEXT NOT NULL,
    email              TEXT NOT NULL,
    phone              TEXT,
    city               TEXT,
    state              TEXT,
    country            TEXT,

    -- Eligibility
    work_rights        TEXT CHECK (work_rights IS NULL OR work_rights IN
                       ('citizen', 'permanent_resident', 'visa_with_work_rights',
                        'student_visa', 'requires_sponsorship', 'other')),
    work_rights_notes  TEXT,
    available_from     DATE,
    notice_period      TEXT,
    salary_expectation TEXT,
    years_experience   NUMERIC(4, 1) CHECK (years_experience IS NULL OR years_experience >= 0),

    -- Links, projects and free text
    linkedin_url       TEXT,
    portfolio_url      TEXT,
    github_url         TEXT,
    other_links        JSONB NOT NULL DEFAULT '[]'::JSONB,  -- [{label,url}]
    projects           JSONB NOT NULL DEFAULT '[]'::JSONB,  -- [{title,url,description}]
    cover_letter       TEXT,
    additional_info    TEXT,
    heard_about        TEXT,

    -- Resume in the private `job-applications` bucket
    resume_path        TEXT,
    resume_filename    TEXT,
    resume_size        INTEGER CHECK (resume_size IS NULL OR resume_size >= 0),
    resume_mime        TEXT,

    -- Consent / audit (Australian Privacy Principles)
    consent_given      BOOLEAN NOT NULL DEFAULT false,
    consent_version    TEXT,
    consent_at         TIMESTAMPTZ,
    submitted_ip_hash  TEXT,          -- salted HMAC, never the raw address

    -- Pipeline
    status             TEXT NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new', 'in_review', 'shortlisted', 'interviewing',
                                         'offer', 'hired', 'rejected', 'withdrawn')),
    rating             SMALLINT CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
    admin_notes        TEXT,
    reviewed_by        UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    reviewed_at        TIMESTAMPTZ,

    -- Retention: purge target, enforced by purge_expired_job_applications()
    delete_after       DATE NOT NULL DEFAULT ((CURRENT_DATE + INTERVAL '2 years')::DATE),

    CONSTRAINT job_applications_email_format
        CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
    CONSTRAINT job_applications_links_are_arrays
        CHECK (jsonb_typeof(other_links) = 'array' AND jsonb_typeof(projects) = 'array')
);

-- One application per person per role (case-insensitive).
CREATE UNIQUE INDEX IF NOT EXISTS job_applications_unique_per_job
    ON public.job_applications (job_id, lower(email))
    WHERE job_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS job_applications_job_idx     ON public.job_applications (job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS job_applications_status_idx  ON public.job_applications (status);
CREATE INDEX IF NOT EXISTS job_applications_created_idx ON public.job_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS job_applications_iphash_idx  ON public.job_applications (submitted_ip_hash, created_at DESC);

DROP TRIGGER IF EXISTS job_applications_set_updated_at ON public.job_applications;
CREATE TRIGGER job_applications_set_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- No anon policy of any kind: the anon key cannot read, write or count rows.
-- Inserts happen only through the Edge Function (service role bypasses RLS).
DROP POLICY IF EXISTS "Admins read applications" ON public.job_applications;
CREATE POLICY "Admins read applications"
    ON public.job_applications FOR SELECT TO authenticated
    USING (public.is_job_admin());

DROP POLICY IF EXISTS "Admins update applications" ON public.job_applications;
CREATE POLICY "Admins update applications"
    ON public.job_applications FOR UPDATE TO authenticated
    USING (public.is_job_admin()) WITH CHECK (public.is_job_admin());

DROP POLICY IF EXISTS "Admins delete applications" ON public.job_applications;
CREATE POLICY "Admins delete applications"
    ON public.job_applications FOR DELETE TO authenticated
    USING (public.is_job_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Questionnaire answers
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_application_answers (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    application_id UUID NOT NULL REFERENCES public.job_applications (id) ON DELETE CASCADE,
    question_id    UUID REFERENCES public.job_questions (id) ON DELETE SET NULL,

    -- Snapshots so historical answers stay readable after a question is edited.
    question_label TEXT NOT NULL DEFAULT '',
    question_type  TEXT,
    position       INTEGER NOT NULL DEFAULT 0,
    answer         JSONB NOT NULL DEFAULT 'null'::JSONB
);

CREATE INDEX IF NOT EXISTS job_application_answers_app_idx
    ON public.job_application_answers (application_id, position);

ALTER TABLE public.job_application_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read answers" ON public.job_application_answers;
CREATE POLICY "Admins read answers"
    ON public.job_application_answers FOR SELECT TO authenticated
    USING (public.is_job_admin());

DROP POLICY IF EXISTS "Admins delete answers" ON public.job_application_answers;
CREATE POLICY "Admins delete answers"
    ON public.job_application_answers FOR DELETE TO authenticated
    USING (public.is_job_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Admin-facing counts for live listings (no applicant data exposed)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.job_application_counts()
RETURNS TABLE (job_id UUID, total BIGINT, new_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
    SELECT a.job_id,
           count(*)                                        AS total,
           count(*) FILTER (WHERE a.status = 'new')         AS new_count
    FROM public.job_applications a
    WHERE a.job_id IS NOT NULL
    GROUP BY a.job_id;
$$;

GRANT EXECUTE ON FUNCTION public.job_application_counts() TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Retention purge (call from a scheduled job if pg_cron is available)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.purge_expired_job_applications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    removed INTEGER;
BEGIN
    WITH expired AS (
        DELETE FROM public.job_applications
        WHERE delete_after < CURRENT_DATE
          AND status NOT IN ('hired')
        RETURNING 1
    )
    SELECT count(*) INTO removed FROM expired;
    RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_job_applications() FROM public;
GRANT EXECUTE ON FUNCTION public.purge_expired_job_applications() TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Private storage bucket for resumes
-- ─────────────────────────────────────────────────────────────────────────────

-- The storage schema is owned by supabase_storage_admin, and depending on the
-- project the role running this script may not be allowed to touch it. Both
-- steps are therefore wrapped so a permission error degrades into a warning
-- instead of rolling back the whole migration - the SQL Editor runs the script
-- as a single transaction. If you see either warning, finish that step in the
-- dashboard (Storage > Buckets / Policies); CAREERS_SETUP.md has the values.

DO $do$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'job-applications',
        'job-applications',
        false,
        5242880,  -- 5 MB
        ARRAY[
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf',
            'text/rtf',
            'text/plain'
        ]
    )
    ON CONFLICT (id) DO UPDATE
        SET "public"           = false,
            file_size_limit    = EXCLUDED.file_size_limit,
            allowed_mime_types = EXCLUDED.allowed_mime_types;

    RAISE NOTICE 'Bucket job-applications is present and private.';
EXCEPTION WHEN insufficient_privilege THEN
    RAISE WARNING 'Could not create the job-applications bucket. Create it by hand: private, 5 MB limit.';
END
$do$;

-- Only admins may read (to create signed URLs) or delete resume objects.
-- Nobody but the service role may write: uploads go through the Edge Function.
DO $do$
BEGIN
    EXECUTE $pol$DROP POLICY IF EXISTS "Admins read resumes" ON storage.objects$pol$;
    EXECUTE $pol$CREATE POLICY "Admins read resumes"
        ON storage.objects FOR SELECT TO authenticated
        USING (bucket_id = 'job-applications' AND public.is_job_admin())$pol$;

    EXECUTE $pol$DROP POLICY IF EXISTS "Admins delete resumes" ON storage.objects$pol$;
    EXECUTE $pol$CREATE POLICY "Admins delete resumes"
        ON storage.objects FOR DELETE TO authenticated
        USING (bucket_id = 'job-applications' AND public.is_job_admin())$pol$;

    RAISE NOTICE 'Storage policies for job-applications created.';
EXCEPTION WHEN insufficient_privilege THEN
    RAISE WARNING 'Could not create the storage policies. Add them in Dashboard > Storage > Policies (see CAREERS_SETUP.md).';
END
$do$;

-- ============================================================================
-- Adding another admin later:
--
--   INSERT INTO public.job_admins (user_id, email)
--   SELECT id, email FROM auth.users WHERE email = 'new.admin@example.com'
--   ON CONFLICT (user_id) DO NOTHING;
--
-- Removing one:
--
--   DELETE FROM public.job_admins WHERE email = 'former.admin@example.com';
-- ============================================================================
