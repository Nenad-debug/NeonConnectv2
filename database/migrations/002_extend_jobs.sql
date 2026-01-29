-- Migration 002: Extend jobs with advanced fields and full-text search

-- Add columns to jobs table (idempotent)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS salary_currency TEXT,
  ADD COLUMN IF NOT EXISTS salary_type TEXT CHECK (salary_type IN ('yearly','monthly','hourly','negotiable')) DEFAULT 'negotiable',
  ADD COLUMN IF NOT EXISTS remote BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('junior','mid','senior','lead','manager','intern')) DEFAULT 'mid',
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location JSONB,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Add search_vector column for full-text search (idempotent)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate search_vector for existing rows (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'search_vector'
  ) THEN
    UPDATE public.jobs SET search_vector = to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''));
  END IF;
END;
$$;

-- Create GIN index on search_vector and arrays
CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON public.jobs USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON public.jobs USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON public.jobs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs USING GIN (location jsonb_path_ops);

-- Trigger function to update search_vector on insert/update
CREATE OR REPLACE FUNCTION public.update_jobs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop existing first to avoid duplicates)
DROP TRIGGER IF EXISTS trg_update_jobs_search_vector ON public.jobs;
CREATE TRIGGER trg_update_jobs_search_vector
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.update_jobs_search_vector();

-- Enforce slug uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_slug_unique ON public.jobs (slug);

-- Notes:
-- - `location` should store JSON like { "city": "Belgrade", "country": "Serbia", "lat": 44.7866, "lng": 20.4489 }
-- - employer_id should reference public.users(id) not public.employer_profiles(user_id)
-- - After running migration, consider backfilling data and adding application-level slug generation (e.g., title -> slug) and validation.
