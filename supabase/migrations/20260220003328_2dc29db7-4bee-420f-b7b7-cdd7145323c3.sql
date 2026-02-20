
-- Create a table to store dating intake form drafts per user
CREATE TABLE public.dating_intake_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  current_step integer NOT NULL DEFAULT 1,
  completed_steps integer[] NOT NULL DEFAULT '{}',
  form_data jsonb NOT NULL DEFAULT '{}',
  last_saved_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dating_intake_drafts ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own draft
CREATE POLICY "Users can view their own draft"
  ON public.dating_intake_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own draft"
  ON public.dating_intake_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft"
  ON public.dating_intake_drafts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own draft"
  ON public.dating_intake_drafts
  FOR DELETE
  USING (auth.uid() = user_id);
