-- Create function to increment rsvp_count
CREATE OR REPLACE FUNCTION public.increment_rsvp_count(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET rsvp_count = COALESCE(rsvp_count, 0) + 1
  WHERE id = event_id;
END;
$$;

-- Create function to decrement rsvp_count
CREATE OR REPLACE FUNCTION public.decrement_rsvp_count(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET rsvp_count = GREATEST(COALESCE(rsvp_count, 0) - 1, 0)
  WHERE id = event_id;
END;
$$;