-- Create meeting_feedback table
CREATE TABLE IF NOT EXISTS public.meeting_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.dating_matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  did_meet boolean DEFAULT true,
  would_meet_again boolean,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.meeting_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own feedback" 
ON public.meeting_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.meeting_feedback FOR SELECT 
USING (auth.uid() = user_id);

-- Only admins or the specific match participants can view feedback (though usually restricted)
-- For this MVP, let's keep it strictly to the user who wrote it and potentially the concierge.

-- Function to update updated_at
CREATE TRIGGER handle_meeting_feedback_updated_at
  BEFORE UPDATE ON public.meeting_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
