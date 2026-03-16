
CREATE OR REPLACE FUNCTION public.get_upcoming_events_count()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(COUNT(*), 0)::integer
  FROM public.events e
  WHERE e."date" >= CURRENT_DATE
    AND e.status NOT IN ('past', 'cancelled');
$$;
