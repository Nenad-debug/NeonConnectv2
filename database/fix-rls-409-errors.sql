-- Fix RLS Policies for candidate_profiles to prevent 409 Conflict errors

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can insert own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can delete own candidate profile" ON public.candidate_profiles;

-- 2. Create new simplified RLS policies
-- SELECT: Users can view their own profile
CREATE POLICY "candidate_profiles_select_policy"
  ON public.candidate_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can insert their own profile
CREATE POLICY "candidate_profiles_insert_policy"
  ON public.candidate_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own profile
CREATE POLICY "candidate_profiles_update_policy"
  ON public.candidate_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own profile
CREATE POLICY "candidate_profiles_delete_policy"
  ON public.candidate_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Similar fix for employer_profiles
DROP POLICY IF EXISTS "Users can view own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Users can update own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Users can insert own employer profile" ON public.employer_profiles;
DROP POLICY IF EXISTS "Users can delete own employer profile" ON public.employer_profiles;

CREATE POLICY "employer_profiles_select_policy"
  ON public.employer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "employer_profiles_insert_policy"
  ON public.employer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "employer_profiles_update_policy"
  ON public.employer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "employer_profiles_delete_policy"
  ON public.employer_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify the policies are created
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename IN ('candidate_profiles', 'employer_profiles')
ORDER BY tablename, policyname;
