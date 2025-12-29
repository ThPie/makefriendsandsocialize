-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create member_badges table
CREATE TABLE public.member_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, badge_type)
);

-- Enable RLS
ALTER TABLE public.member_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for member_badges
CREATE POLICY "Users can view their own badges"
ON public.member_badges
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own badges"
ON public.member_badges
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all badges"
ON public.member_badges
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));