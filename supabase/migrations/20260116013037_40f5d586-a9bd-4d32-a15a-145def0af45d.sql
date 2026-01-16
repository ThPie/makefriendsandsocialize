CREATE OR REPLACE FUNCTION public.get_upcoming_events_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  events_count integer;
BEGIN
  SELECT COUNT(*) INTO events_count
  FROM public.events
  WHERE date >= CURRENT_DATE
    AND status = 'published';
  
  RETURN events_count;
END;
$$;