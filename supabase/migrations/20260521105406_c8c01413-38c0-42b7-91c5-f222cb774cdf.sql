-- Add photo_urls array column
ALTER TABLE public.repair_requests
ADD COLUMN IF NOT EXISTS photo_urls text[] NOT NULL DEFAULT '{}';

-- Create public bucket for repair photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('repair-photos', 'repair-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Repair photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'repair-photos');

-- Authenticated users can upload to their own folder (user_id as first path segment)
CREATE POLICY "Users upload own repair photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'repair-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own repair photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'repair-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own repair photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'repair-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);