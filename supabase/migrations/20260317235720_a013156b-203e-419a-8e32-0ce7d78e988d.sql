
CREATE TABLE public.soul_maps_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_slug text NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  result_type text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.soul_maps_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own results"
  ON public.soul_maps_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own results"
  ON public.soul_maps_results FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all results"
  ON public.soul_maps_results FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_soul_maps_results_user_id ON public.soul_maps_results(user_id);
CREATE INDEX idx_soul_maps_results_quiz_slug ON public.soul_maps_results(user_id, quiz_slug);
