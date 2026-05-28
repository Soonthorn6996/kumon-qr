-- Migration 007: user watches students for push notifications

CREATE TABLE IF NOT EXISTS user_student_watches (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, student_id)
);

ALTER TABLE user_student_watches ENABLE ROW LEVEL SECURITY;

-- Each user manages only their own watches
CREATE POLICY "own_watches" ON user_student_watches
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
