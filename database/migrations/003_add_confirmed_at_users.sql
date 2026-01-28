-- Add confirmed_at column to users and allow users to update their own row (RLS)
BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;

-- Replace update policy so authenticated users can update their own rows
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

COMMIT;
