-- Add waitlist_enabled to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS waitlist_enabled boolean DEFAULT true;

-- Add category field to business_profiles table with predefined values
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS category text DEFAULT 'Other';

-- Add connection_count to business_profiles for sorting
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS connection_count integer DEFAULT 0;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS business_profiles_category_idx ON public.business_profiles(category);

-- Create trigger function to auto-promote from waitlist when a spot opens
CREATE OR REPLACE FUNCTION public.promote_from_waitlist()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  next_in_line RECORD;
  event_rec RECORD;
BEGIN
  -- Get event details
  SELECT * INTO event_rec FROM public.events WHERE id = OLD.event_id;
  
  -- Only proceed if waitlist is enabled for this event
  IF NOT event_rec.waitlist_enabled THEN
    RETURN OLD;
  END IF;
  
  -- Find the next person on the waitlist
  SELECT * INTO next_in_line
  FROM public.event_waitlist
  WHERE event_id = OLD.event_id
    AND status = 'waiting'
  ORDER BY position ASC
  LIMIT 1;
  
  -- If someone is waiting, notify them
  IF next_in_line.id IS NOT NULL THEN
    UPDATE public.event_waitlist
    SET status = 'notified',
        notified_at = now()
    WHERE id = next_in_line.id;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger that fires when an RSVP is deleted
DROP TRIGGER IF EXISTS trigger_promote_from_waitlist ON public.event_rsvps;
CREATE TRIGGER trigger_promote_from_waitlist
  AFTER DELETE ON public.event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_from_waitlist();

-- Create function to get next waitlist position
CREATE OR REPLACE FUNCTION public.get_next_waitlist_position(p_event_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  max_position integer;
BEGIN
  SELECT COALESCE(MAX(position), 0) + 1 INTO max_position
  FROM public.event_waitlist
  WHERE event_id = p_event_id;
  
  RETURN max_position;
END;
$$;

-- Create function to increment rsvp count
CREATE OR REPLACE FUNCTION public.increment_rsvp_count(event_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.events
  SET rsvp_count = COALESCE(rsvp_count, 0) + 1
  WHERE id = event_id;
END;
$$;

-- Create function to decrement rsvp count
CREATE OR REPLACE FUNCTION public.decrement_rsvp_count(event_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.events
  SET rsvp_count = GREATEST(COALESCE(rsvp_count, 0) - 1, 0)
  WHERE id = event_id;
END;
$$;

-- Create function to check if event has available spots
CREATE OR REPLACE FUNCTION public.event_has_available_spots(p_event_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  event_capacity integer;
  current_rsvp_count integer;
BEGIN
  SELECT capacity, COALESCE(rsvp_count, 0) INTO event_capacity, current_rsvp_count
  FROM public.events
  WHERE id = p_event_id;
  
  IF event_capacity IS NULL THEN
    RETURN true; -- No capacity limit
  END IF;
  
  RETURN current_rsvp_count < event_capacity;
END;
$$;

-- Update RLS policy for event_rsvps to prevent over-registration
DROP POLICY IF EXISTS "Users can RSVP to events with spots" ON public.event_rsvps;
CREATE POLICY "Users can RSVP to events with spots" ON public.event_rsvps
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND has_active_membership(auth.uid())
    AND event_has_available_spots(event_id)
  );

-- Update existing insert policy to use the new check
DROP POLICY IF EXISTS "Users can RSVP to events" ON public.event_rsvps;

-- Create function to update business connection count
CREATE OR REPLACE FUNCTION public.update_business_connection_count()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    UPDATE public.business_profiles
    SET connection_count = connection_count + 1
    WHERE id = NEW.business_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to update connection count
DROP TRIGGER IF EXISTS trigger_update_business_connection_count ON public.business_introduction_requests;
CREATE TRIGGER trigger_update_business_connection_count
  AFTER INSERT ON public.business_introduction_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_connection_count();