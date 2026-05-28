-- Migration 009: student development notes (บันทึกพัฒนาการ)

CREATE TABLE IF NOT EXISTS student_notes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  log_id      UUID REFERENCES attendance_logs(id)   ON DELETE SET NULL,
  body        TEXT NOT NULL CHECK (char_length(trim(body)) > 0),
  created_by  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON student_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_notes_student_date ON student_notes(student_id, created_at DESC);
CREATE INDEX idx_notes_date ON student_notes(created_at DESC);
