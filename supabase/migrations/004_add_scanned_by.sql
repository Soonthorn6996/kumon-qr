-- Migration 004: track which staff user performed each scan
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS scanned_by TEXT;
