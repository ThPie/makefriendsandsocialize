-- Create a function to get active member count from profiles table
CREATE OR REPLACE FUNCTION public.get_active_member_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_count integer;
BEGIN
  SELECT COUNT(*) INTO member_count
  FROM public.profiles
  WHERE onboarding_completed = true 
    OR profile_completed_at IS NOT NULL;
  
  -- If no completed profiles, count all profiles
  IF member_count = 0 THEN
    SELECT COUNT(*) INTO member_count FROM public.profiles;
  END IF;
  
  RETURN member_count;
END;
$$;

-- Create a function to get upcoming events count
CREATE OR REPLACE FUNCTION public.get_upcoming_events_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  events_count integer;
BEGIN
  SELECT COUNT(*) INTO events_count
  FROM public.events
  WHERE date >= CURRENT_DATE
    AND status NOT IN ('cancelled', 'past');
  
  RETURN events_count;
END;
$$;