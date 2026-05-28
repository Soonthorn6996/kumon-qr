-- Migration 011: student leave / absence requests

CREATE TABLE IF NOT EXISTS student_leaves (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  leave_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  reason          TEXT,
  submitted_by    TEXT NOT NULL,
  submitted_by_id UUID NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON student_leaves
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_leaves_date        ON student_leaves(leave_date DESC);
CREATE INDEX idx_leaves_student     ON student_leaves(student_id, leave_date DESC);
CREATE INDEX idx_leaves_submitter   ON student_leaves(submitted_by_id, leave_date DESC);
