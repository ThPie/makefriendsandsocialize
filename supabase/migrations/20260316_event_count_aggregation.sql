-- Create RPC function to get event RSVP counts in bulk
CREATE OR REPLACE FUNCTION public.get_event_rsvp_counts(event_ids UUID[])
RETURNS TABLE(event_id UUID, rsvp_count INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    event_id,
    COUNT(*)::INTEGER as rsvp_count
  FROM public.event_rsvps
  WHERE event_id = ANY(event_ids)
    AND status = 'confirmed'
  GROUP BY event_id;
$$;

-- Create RPC function to get event waitlist counts in bulk
CREATE OR REPLACE FUNCTION public.get_event_waitlist_counts(event_ids UUID[])
RETURNS TABLE(event_id UUID, waitlist_count INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    event_id,
    COUNT(*)::INTEGER as waitlist_count
  FROM public.event_waitlist
  WHERE event_id = ANY(event_ids)
    AND status = 'waiting'
  GROUP BY event_id;
$$;
