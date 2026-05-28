-- Migration 010: RPC to fetch profiles joined with auth.users last_sign_in_at

CREATE OR REPLACE FUNCTION get_users_with_last_login()
RETURNS TABLE (
  id            UUID,
  email         TEXT,
  display_name  TEXT,
  role          TEXT,
  created_at    TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.email,
    p.display_name,
    p.role,
    p.created_at,
    u.last_sign_in_at AS last_login_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION get_users_with_last_login() TO authenticated;
