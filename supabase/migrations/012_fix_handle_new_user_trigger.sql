-- Migration 012: make handle_new_user trigger exception-safe
--
-- "Database error saving new user" occurs when the trigger throws an
-- unhandled exception and rolls back the entire auth.signUp transaction.
-- Fix: catch all exceptions so auth signup always succeeds even if the
-- profile row can't be inserted (settings.html has a fallback upsert).

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.created_at, NOW()),
    'view'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
