-- Combined migration: RLS fixes (409/406), schema improvements, and policies
-- Safe to run: uses IF NOT EXISTS / DROP IF EXISTS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure update_updated_at_column exists (required by triggers below)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ========== fix-rls-409: candidate_profiles & employer_profiles ==========
DROP POLICY IF EXISTS "Users can view own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can insert own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can delete own candidate profile" ON public.candidate_profiles;

DROP POLICY IF EXISTS "candidate_profiles_select_policy" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_insert_policy" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_update_policy" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_delete_policy" ON public.candidate_profiles;
CREATE POLICY "candidate_profiles_select_policy" ON public.candidate_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "candidate_profiles_insert_policy" ON public.candidate_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "candidate_profiles_update_policy" ON public.candidate_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "candidate_profiles_delete_policy" ON public.candidate_profiles FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Users can update own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Users can insert own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Users can delete own employer profile" ON public.employer_profiles;

DROP POLICY IF EXISTS "employer_profiles_select_policy" ON public.employer_profiles;
DROP POLICY IF EXISTS "employer_profiles_insert_policy" ON public.employer_profiles;
DROP POLICY IF EXISTS "employer_profiles_update_policy" ON public.employer_profiles;
DROP POLICY IF EXISTS "employer_profiles_delete_policy" ON public.employer_profiles;
CREATE POLICY "employer_profiles_select_policy" ON public.employer_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "employer_profiles_insert_policy" ON public.employer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "employer_profiles_update_policy" ON public.employer_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "employer_profiles_delete_policy" ON public.employer_profiles FOR DELETE USING (auth.uid() = user_id);

-- ========== 007: employer_profiles, jobs, applications, chat_messages ==========
DROP POLICY IF EXISTS "Employers can update own profile" ON public.employer_profiles;
CREATE POLICY "Employers can update own profile" ON public.employer_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Employers can insert own profile" ON public.employer_profiles;
CREATE POLICY "Employers can insert own profile" ON public.employer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (status = 'active' OR auth.uid() = employer_id);

DROP POLICY IF EXISTS "Candidates can read own applications" ON public.applications;
CREATE POLICY "Candidates can read own applications" ON public.applications FOR SELECT USING (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Employers can read applications for their jobs" ON public.applications;
CREATE POLICY "Employers can read applications for their jobs" ON public.applications FOR SELECT USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));
DROP POLICY IF EXISTS "Candidates can update own applications" ON public.applications;
CREATE POLICY "Candidates can update own applications" ON public.applications FOR UPDATE USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);
DROP POLICY IF EXISTS "Employers can update applications for their jobs" ON public.applications;
CREATE POLICY "Employers can update applications for their jobs" ON public.applications FOR UPDATE USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));

DROP POLICY IF EXISTS "System can update messages" ON public.chat_messages;
CREATE POLICY "Users can update own messages" ON public.chat_messages FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_type TEXT NOT NULL DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance'));
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS remote BOOLEAN DEFAULT FALSE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT NULL;

CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs(job_id);
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can read own saved jobs" ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can save jobs" ON public.saved_jobs;
CREATE POLICY "Users can save jobs" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can remove saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can remove saved jobs" ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
CREATE POLICY "Users can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Resumes are readable by authenticated users" ON storage.objects;
CREATE POLICY "Resumes are readable by authenticated users" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_profile_complete ON public.candidate_profiles(profile_complete);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON public.jobs(remote);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON public.chat_messages(user_id, created_at DESC);

-- ========== 008: jobs delete policy, cascade, job_stats, audit_logs ==========
DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.jobs;
CREATE POLICY "Employers can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = employer_id);

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE public.applications ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.job_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE POLICY "Employers can read their job stats" ON public.job_stats FOR SELECT USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employer_id_fkey;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_user_id_fkey;
ALTER TABLE public.employer_profiles ADD CONSTRAINT employer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
