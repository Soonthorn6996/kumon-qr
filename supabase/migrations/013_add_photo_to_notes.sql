-- Migration 013: add photo_url to student_notes + scan-photos storage bucket

ALTER TABLE student_notes ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create public storage bucket for scan photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scan-photos',
  'scan-photos',
  true,
  10485760,   -- 10 MB limit per file
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "scan_photos_insert" ON storage.objects;
CREATE POLICY "scan_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'scan-photos');

-- Allow public read (parents view photos)
DROP POLICY IF EXISTS "scan_photos_select" ON storage.objects;
CREATE POLICY "scan_photos_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'scan-photos');

-- Allow authenticated delete (admin cleanup)
DROP POLICY IF EXISTS "scan_photos_delete" ON storage.objects;
CREATE POLICY "scan_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'scan-photos');
