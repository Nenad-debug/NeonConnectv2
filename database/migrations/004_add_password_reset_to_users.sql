-- Add password reset tracking to users table
BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_reset_used BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMP DEFAULT NULL;

COMMIT;
