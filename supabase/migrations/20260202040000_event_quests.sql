-- Create event_checkin_quests table
CREATE TABLE IF NOT EXISTS public.event_checkin_quests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_text text NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.event_checkin_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quests" 
ON public.event_checkin_quests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests" 
ON public.event_checkin_quests FOR UPDATE 
USING (auth.uid() = user_id);
