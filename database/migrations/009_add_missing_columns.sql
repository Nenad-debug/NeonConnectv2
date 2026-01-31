-- Migration: Add missing columns to support password reset tracking and profile completion tracking

-- Add missing columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS password_reset_used BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMP DEFAULT NULL;

-- Add missing columns to candidate_profiles table
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS education TEXT[],
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create index for faster password reset token lookups
CREATE INDEX IF NOT EXISTS idx_users_password_reset_at ON public.users(password_reset_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.users.password_reset_used IS 'Track if password reset token has been used to prevent replay attacks';
COMMENT ON COLUMN public.candidate_profiles.profile_complete IS 'Flag indicating if candidate profile has been fully filled out';
