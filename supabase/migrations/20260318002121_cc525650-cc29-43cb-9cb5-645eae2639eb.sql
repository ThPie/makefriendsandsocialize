CREATE TABLE public.soul_maps_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  quiz_slug text NOT NULL DEFAULT 'attachment-style',
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.soul_maps_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public lead capture)
CREATE POLICY "Anyone can submit email lead"
  ON public.soul_maps_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
