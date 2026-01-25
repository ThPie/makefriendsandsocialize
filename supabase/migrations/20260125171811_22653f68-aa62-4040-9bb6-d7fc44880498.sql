-- Fix storage policy with unique name
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

CREATE POLICY "Users can delete their own event photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-member-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);