-- Create table to track sent dating reminders
CREATE TABLE IF NOT EXISTS public.dating_meeting_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_proposal_id UUID NOT NULL REFERENCES public.meeting_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT '24h',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(meeting_proposal_id, user_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.dating_meeting_reminders ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write reminders
CREATE POLICY "Admins can manage dating reminders"
ON public.dating_meeting_reminders
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));