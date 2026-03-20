INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voice-notes', 'voice-notes', true, 5242880, ARRAY['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-notes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read voice notes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'voice-notes');

CREATE POLICY "Users delete own voice notes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'voice-notes' AND (storage.foldername(name))[1] = auth.uid()::text);