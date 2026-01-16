-- Fix testimonial-photos bucket security
-- 1. Update bucket with file size limit (2MB) and allowed MIME types
UPDATE storage.buckets 
SET 
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'testimonial-photos';

-- 2. Drop the overly permissive upload policy
DROP POLICY IF EXISTS "Anyone can upload testimonial photos" ON storage.objects;

-- 3. Create a more restrictive policy that still allows public uploads
-- but limits to the specific bucket and enforces the file restrictions
-- Note: The bucket-level restrictions (file_size_limit, allowed_mime_types) 
-- will be enforced by Supabase automatically on upload
CREATE POLICY "Public testimonial photo uploads with restrictions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'testimonial-photos'
  AND (storage.foldername(name))[1] = 'testimonials'
);