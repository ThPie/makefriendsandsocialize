-- Fix search path for get_next_waitlist_position function
CREATE OR REPLACE FUNCTION public.get_next_waitlist_position(p_event_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(position), 0) + 1
  FROM public.event_waitlist
  WHERE event_id = p_event_id AND status = 'waiting';
$$;