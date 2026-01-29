-- Migration 008: Complete RLS Policy Fixes for Employers
-- This ensures employers can fully manage their jobs and view applications

BEGIN;

-- ========== Fix UPDATE/DELETE policies for jobs ==========
DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.jobs;
CREATE POLICY "Employers can delete own jobs" ON public.jobs
  FOR DELETE USING (auth.uid() = employer_id);

-- ========== Ensure cascade delete works properly ==========
-- Jobs should cascade to applications when deleted
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_job_id_fkey 
  FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

-- ========== Add statistics/metrics view for employers ==========
CREATE TABLE IF NOT EXISTS public.job_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL UNIQUE REFERENCES public.jobs(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_stats_job_id ON public.job_stats(job_id);

ALTER TABLE public.job_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employers can read their job stats" ON public.job_stats;
CREATE POLICY "Employers can read their job stats" ON public.job_stats
  FOR SELECT USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));

-- ========== Add audit log table ==========
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);

-- ========== Ensure proper cascading for employer deletion ==========
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employer_id_fkey;
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_employer_id_fkey 
  FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_user_id_fkey;
ALTER TABLE public.employer_profiles
  ADD CONSTRAINT employer_profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

COMMIT;
