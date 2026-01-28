-- Migration: Extend candidate_profiles with detailed information
-- This adds fields for phone, location, experience, education, image, etc.

-- Add new columns to candidate_profiles
ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS education TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;

-- Create index for profile_complete to speed up queries
CREATE INDEX IF NOT EXISTS idx_candidate_profile_complete 
ON public.candidate_profiles(user_id, profile_complete);

-- Add RLS policies for candidate profiles
DROP POLICY IF EXISTS "Candidates can read own profile" ON public.candidate_profiles;
CREATE POLICY "Candidates can read own profile" ON public.candidate_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can update own profile" ON public.candidate_profiles;
CREATE POLICY "Candidates can update own profile" ON public.candidate_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can insert own profile" ON public.candidate_profiles;
CREATE POLICY "Candidates can insert own profile" ON public.candidate_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public read for employer viewing candidate profiles (if needed)
DROP POLICY IF EXISTS "Employers can read candidate profiles" ON public.candidate_profiles;
CREATE POLICY "Employers can read candidate profiles" ON public.candidate_profiles
  FOR SELECT USING (true);
