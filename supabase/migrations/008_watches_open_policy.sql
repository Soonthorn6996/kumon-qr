-- Migration 008: allow admin/teacher to manage watches for any user
-- (frontend enforces role restriction; matching auth_all pattern used on other tables)

DROP POLICY IF EXISTS "own_watches" ON user_student_watches;

CREATE POLICY "auth_all" ON user_student_watches
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
