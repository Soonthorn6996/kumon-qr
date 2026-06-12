-- Migration 014: add LINE guardian fields to students

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS guardian_line_id      TEXT,
  ADD COLUMN IF NOT EXISTS guardian_line_name    TEXT,
  ADD COLUMN IF NOT EXISTS guardian_line_picture TEXT;

-- Index for quick lookup when sending notifications
CREATE INDEX IF NOT EXISTS idx_students_guardian_line
  ON students (guardian_line_id)
  WHERE guardian_line_id IS NOT NULL;
