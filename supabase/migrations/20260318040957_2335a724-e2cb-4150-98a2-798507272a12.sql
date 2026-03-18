CREATE OR REPLACE FUNCTION public.get_dashboard_stats(_user_id uuid)
RETURNS TABLE(
  upcoming_events integer,
  connections integer,
  unread_notifications integer,
  badges integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT COALESCE(COUNT(*), 0)::integer INTO upcoming_events
  FROM public.events e
  WHERE e."date" >= CURRENT_DATE
    AND e.status NOT IN ('cancelled', 'past');

  SELECT COALESCE(COUNT(*), 0)::integer INTO connections
  FROM public.connections c
  WHERE (c.requester_id = _user_id OR c.requested_id = _user_id)
    AND c.status = 'accepted';

  SELECT COALESCE(COUNT(*), 0)::integer INTO unread_notifications
  FROM public.notification_queue nq
  WHERE nq.user_id = _user_id
    AND nq.is_read = false;

  SELECT COALESCE(COUNT(*), 0)::integer INTO badges
  FROM public.member_badges mb
  WHERE mb.user_id = _user_id;

  RETURN NEXT;
END;
$$;