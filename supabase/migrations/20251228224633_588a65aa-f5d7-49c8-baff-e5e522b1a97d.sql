-- Add new columns to dating_matches for meeting scheduling and responses
ALTER TABLE public.dating_matches 
ADD COLUMN IF NOT EXISTS user_a_response text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS user_b_response text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS meeting_status text DEFAULT 'pending_woman',
ADD COLUMN IF NOT EXISTS meeting_date date,
ADD COLUMN IF NOT EXISTS meeting_time text;

-- Create meeting_proposals table for date scheduling
CREATE TABLE IF NOT EXISTS public.meeting_proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.dating_matches(id) ON DELETE CASCADE,
  proposed_by uuid NOT NULL REFERENCES public.dating_profiles(id) ON DELETE CASCADE,
  proposed_date date NOT NULL,
  proposed_time text NOT NULL,
  status text NOT NULL DEFAULT 'proposed',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on meeting_proposals
ALTER TABLE public.meeting_proposals ENABLE ROW LEVEL SECURITY;

-- Users can view proposals for matches they're part of
CREATE POLICY "Users can view proposals for their matches"
ON public.meeting_proposals
FOR SELECT
USING (
  match_id IN (
    SELECT dm.id FROM public.dating_matches dm
    WHERE dm.user_a_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
       OR dm.user_b_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
  )
);

-- Users can insert proposals for matches they're part of
CREATE POLICY "Users can insert proposals for their matches"
ON public.meeting_proposals
FOR INSERT
WITH CHECK (
  proposed_by IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
  AND match_id IN (
    SELECT dm.id FROM public.dating_matches dm
    WHERE dm.user_a_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
       OR dm.user_b_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
  )
);

-- Users can update proposals they created or proposals for their matches
CREATE POLICY "Users can update proposals for their matches"
ON public.meeting_proposals
FOR UPDATE
USING (
  match_id IN (
    SELECT dm.id FROM public.dating_matches dm
    WHERE dm.user_a_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
       OR dm.user_b_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
  )
);

-- Admins can manage all proposals
CREATE POLICY "Admins can manage all proposals"
ON public.meeting_proposals
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_meeting_proposals_updated_at
BEFORE UPDATE ON public.meeting_proposals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Update the dating_matches status update policy to allow users to update their responses
DROP POLICY IF EXISTS "Users can update their match responses" ON public.dating_matches;
CREATE POLICY "Users can update their match responses"
ON public.dating_matches
FOR UPDATE
USING (
  user_a_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
  OR user_b_id IN (SELECT id FROM public.dating_profiles WHERE user_id = auth.uid())
);