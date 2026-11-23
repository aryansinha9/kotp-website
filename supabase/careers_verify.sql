-- ============================================================================
-- Careers job board - post-install check
-- ----------------------------------------------------------------------------
-- Paste into the Supabase SQL Editor AFTER running careers_job_board.sql.
--
-- This is ONE query on purpose: the SQL Editor only displays the result of the
-- last statement, so a script of separate SELECTs hides all but the final one.
-- Read-only - it changes nothing. Every row should read PASS.
-- ============================================================================

WITH checks AS (

    SELECT 1 AS sort, 'Tables created' AS item,
           count(*)::TEXT || ' of 5' AS detail,
           CASE WHEN count(*) = 5 THEN 'PASS' ELSE 'FAIL' END AS result
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('job_admins', 'job_listings', 'job_questions',
                         'job_applications', 'job_application_answers')

    UNION ALL
    SELECT 2, 'Public questions view', count(*)::TEXT || ' of 1',
           CASE WHEN count(*) = 1 THEN 'PASS' ELSE 'FAIL' END
    FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'open_job_questions'

    UNION ALL
    SELECT 3, 'Helper functions', count(*)::TEXT || ' of 3',
           CASE WHEN count(*) = 3 THEN 'PASS' ELSE 'FAIL' END
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('is_job_admin', 'job_application_counts',
                        'purge_expired_job_applications')

    -- Row Level Security must be on for all five tables.
    UNION ALL
    SELECT 4, 'RLS enabled', count(*) FILTER (WHERE relrowsecurity)::TEXT || ' of 5',
           CASE WHEN count(*) FILTER (WHERE relrowsecurity) = 5
                THEN 'PASS' ELSE 'FAIL - RLS IS OFF SOMEWHERE' END
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('job_admins', 'job_listings', 'job_questions',
                        'job_applications', 'job_application_answers')

    -- The whole point: the public must not reach applicant data.
    UNION ALL
    SELECT 5, 'Public access to applicant data',
           count(*)::TEXT || ' policies (want 0)',
           CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL - LEAK' END
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('job_applications', 'job_application_answers')
      AND (roles::TEXT LIKE '%anon%' OR roles::TEXT = '{public}')

    -- Nor the base questions table, which holds the screening answer keys.
    UNION ALL
    SELECT 6, 'Public access to answer keys',
           count(*)::TEXT || ' policies (want 0)',
           CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL - LEAK' END
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'job_questions'
      AND (roles::TEXT LIKE '%anon%' OR roles::TEXT = '{public}')

    UNION ALL
    SELECT 7, 'Admin policies on careers tables', count(*)::TEXT || ' total',
           CASE WHEN count(*) >= 14 THEN 'PASS' ELSE 'CHECK' END
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename LIKE 'job%'

    UNION ALL
    SELECT 8, 'Resume bucket is private',
           coalesce(max(CASE WHEN public THEN 'PUBLIC' ELSE 'private' END), 'missing')
             || ', limit ' || coalesce(max(file_size_limit)::TEXT, '-'),
           CASE WHEN count(*) = 1 AND bool_and(public = false)
                     AND max(file_size_limit) = 5242880
                THEN 'PASS' ELSE 'FAIL - create it by hand' END
    FROM storage.buckets WHERE id = 'job-applications'

    UNION ALL
    SELECT 9, 'Storage policies', count(*)::TEXT || ' of 2',
           CASE WHEN count(*) = 2 THEN 'PASS' ELSE 'FAIL - add them by hand' END
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname IN ('Admins read resumes', 'Admins delete resumes')

    -- Not a pass/fail: a list to read. Everyone here can open every CV.
    UNION ALL
    SELECT 10, 'CAN SEE APPLICANT DATA', string_agg(email, ', ' ORDER BY email),
           count(*)::TEXT || ' admin(s) - check this list'
    FROM public.job_admins

    -- Bot submissions are answered with a decoy reference and stored nowhere,
    -- so this should still be 0 after any honeypot test.
    UNION ALL
    SELECT 11, 'Applications stored', count(*)::TEXT || ' row(s)',
           CASE WHEN count(*) = 0 THEN 'none yet' ELSE 'see Applications tab' END
    FROM public.job_applications

    UNION ALL
    SELECT 12, 'Listings created', count(*)::TEXT || ' row(s)',
           count(*) FILTER (WHERE status = 'open')::TEXT || ' published'
    FROM public.job_listings
)
SELECT item, detail, result FROM checks ORDER BY sort;
