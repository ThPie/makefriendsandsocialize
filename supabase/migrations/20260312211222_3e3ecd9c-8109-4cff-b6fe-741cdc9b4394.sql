CREATE TABLE public.host_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  skill_topic text NOT NULL,
  experience_description text,
  teaching_format text,
  availability text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit host applications"
  ON public.host_applications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can view own host applications"
  ON public.host_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all host applications"
  ON public.host_applications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit host application"
  ON public.host_applications FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE TRIGGER handle_host_applications_updated_at
  BEFORE UPDATE ON public.host_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();