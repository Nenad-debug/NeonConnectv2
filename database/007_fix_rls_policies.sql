-- Migration 007: Fix RLS policies and improve database structure
-- This migration fixes several issues found in the initial schema

BEGIN;

-- ========== FIX 1: Add missing RLS policies for employer_profiles ==========
DROP POLICY IF EXISTS "Employers can update own profile" ON public.employer_profiles;
CREATE POLICY "Employers can update own profile" ON public.employer_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employers can insert own profile" ON public.employer_profiles;
CREATE POLICY "Employers can insert own profile" ON public.employer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========== FIX 2: Improve jobs RLS - candidates should see all active jobs, not just their own ==========
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
  FOR SELECT USING (status = 'active' OR auth.uid() = employer_id);

-- ========== FIX 3: Add comprehensive RLS for applications ==========
DROP POLICY IF EXISTS "Candidates can read own applications" ON public.applications;
CREATE POLICY "Candidates can read own applications" ON public.applications
  FOR SELECT USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Employers can read applications for their jobs" ON public.applications;
CREATE POLICY "Employers can read applications for their jobs" ON public.applications
  FOR SELECT USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));

DROP POLICY IF EXISTS "Candidates can update own applications" ON public.applications;
CREATE POLICY "Candidates can update own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Employers can update applications for their jobs" ON public.applications;
CREATE POLICY "Employers can update applications for their jobs" ON public.applications
  FOR UPDATE USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));

-- ========== FIX 4: Improve chat_messages RLS - allow users to delete their own messages ==========
DROP POLICY IF EXISTS "System can update messages" ON public.chat_messages;
CREATE POLICY "Users can update own messages" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- ========== FIX 5: Add trigger for chat_messages updated_at ==========
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== FIX 6: Add missing columns that frontend expects ==========
-- Check if columns exist, then add them if missing
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS job_type TEXT NOT NULL DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance'));

-- ========== FIX 7: Add soft delete support for applications (archive instead of delete) ==========
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT NULL;

-- ========== FIX 8: Add saved jobs / favorited jobs functionality ==========
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs(job_id);

-- Enable RLS on saved_jobs
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can read own saved jobs" ON public.saved_jobs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save jobs" ON public.saved_jobs;
CREATE POLICY "Users can save jobs" ON public.saved_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can remove saved jobs" ON public.saved_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- ========== FIX 9: Add notifications table ==========
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'application_status', 'new_job', 'message', etc
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID, -- Could be job_id, application_id, etc
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== FIX 10: Improve storage RLS policies ==========
-- The current policies don't restrict deletion properly
-- Make sure users can only delete their own files

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ========== FIX 11: Add resume storage bucket ==========
-- Create resumes bucket for PDF uploads
DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
CREATE POLICY "Users can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Resumes are readable by authenticated users" ON storage.objects;
CREATE POLICY "Resumes are readable by authenticated users"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- ========== FIX 12: Add performance indexes ==========
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_profile_complete ON public.candidate_profiles(profile_complete);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON public.jobs(remote);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON public.chat_messages(user_id, created_at DESC);

COMMIT;
