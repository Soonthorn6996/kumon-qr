-- Migration 015: store the guardian's LINE identity on their user profile
--
-- Supersedes the per-student guardian fields from migration 014.
-- A parent connects LINE once (account-level); notifications fan out to
-- every student the parent watches (user_student_watches).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS line_user_id      TEXT,
  ADD COLUMN IF NOT EXISTS line_display_name TEXT,
  ADD COLUMN IF NOT EXISTS line_picture_url  TEXT;

-- Quick lookup when fanning out notifications to connected guardians
CREATE INDEX IF NOT EXISTS idx_profiles_line_user
  ON profiles (line_user_id)
  WHERE line_user_id IS NOT NULL;
