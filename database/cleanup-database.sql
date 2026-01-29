-- NeonConnect Database Cleanup Script
-- Briše sve test naloge i organizuje bazu

-- 1. Obriši sve chat messages
DELETE FROM public.chat_messages WHERE created_at IS NOT NULL;

-- 2. Obriši sve applications
DELETE FROM public.applications WHERE created_at IS NOT NULL;

-- 3. Obriši sve saved_jobs
DELETE FROM public.saved_jobs WHERE saved_at IS NOT NULL;

-- 4. Obriši sve jobs sa status = 'draft' (test jobs)
DELETE FROM public.jobs WHERE status = 'draft';

-- 5. Obriši sve candidate_profiles
DELETE FROM public.candidate_profiles WHERE created_at IS NOT NULL;

-- 6. Obriši sve employer_profiles  
DELETE FROM public.employer_profiles WHERE created_at IS NOT NULL;

-- 7. Obriši sve test users (all except those with verified emails if needed)
DELETE FROM auth.users WHERE created_at > NOW() - INTERVAL '30 days';

-- 8. Verifikuj rezultate
SELECT 
  'users' as table_name,
  COUNT(*) as row_count
FROM public.users
UNION ALL
SELECT 'candidate_profiles', COUNT(*) FROM public.candidate_profiles
UNION ALL
SELECT 'employer_profiles', COUNT(*) FROM public.employer_profiles
UNION ALL
SELECT 'jobs', COUNT(*) FROM public.jobs
UNION ALL
SELECT 'applications', COUNT(*) FROM public.applications
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM public.chat_messages
UNION ALL
SELECT 'saved_jobs', COUNT(*) FROM public.saved_jobs
ORDER BY table_name;
