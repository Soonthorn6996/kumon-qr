-- Migration 006: add role column to profiles for RBAC

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'view'
  CHECK (role IN ('admin', 'teacher', 'view'));

-- Promote the oldest account to admin (first registered user)
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1)
  AND role = 'view';

-- Update trigger so new users default to 'view'
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.created_at, NOW()), 'view')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
