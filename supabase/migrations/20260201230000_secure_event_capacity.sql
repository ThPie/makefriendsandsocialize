-- Migration: 20260201230000_secure_event_capacity.sql
-- Goal: Automate rsvp_count and enforce capacity server-side

-- 1. Function to enforce capacity on insertion
CREATE OR REPLACE FUNCTION public.enforce_event_capacity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity INTEGER;
  v_current_rsvps INTEGER;
BEGIN
  -- We use a row-level lock on the event to prevent race conditions during the check
  SELECT capacity, COALESCE(rsvp_count, 0) INTO v_capacity, v_current_rsvps
  FROM events
  WHERE id = NEW.event_id
  FOR UPDATE;

  -- Count 'notified' waitlist spots as 'reserved'
  DECLARE
    v_notified_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_notified_count
    FROM event_waitlist
    WHERE event_id = NEW.event_id AND status = 'notified';

    -- Only enforce capacity for 'confirmed' RSVPs
    -- If the user already has a 'notified' spot, we don't add it to the count check
    -- because that spot is already reserved for them.
    DECLARE
      v_user_notified BOOLEAN;
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM event_waitlist 
        WHERE event_id = NEW.event_id AND user_id = NEW.user_id AND status = 'notified'
      ) INTO v_user_notified;

      IF NEW.status = 'confirmed' AND v_capacity IS NOT NULL THEN
        IF v_user_notified THEN
          -- User has a reservation, check against current RSVPs only
          IF v_current_rsvps >= v_capacity THEN
            RAISE EXCEPTION 'Event is full (even with your reservation)' USING ERRCODE = 'P0001';
          END IF;
        ELSE
          -- User has no reservation, check against RSVPs + other reservations
          IF (v_current_rsvps + v_notified_count) >= v_capacity THEN
            RAISE EXCEPTION 'Event is full' USING ERRCODE = 'P0001';
          END IF;
        END IF;
      END IF;
    END;
  END;

  RETURN NEW;
END;
$$;

-- 2. Function to sync rsvp_count
CREATE OR REPLACE FUNCTION public.sync_event_rsvp_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') THEN
    UPDATE events
    SET rsvp_count = COALESCE(rsvp_count, 0) + 1
    WHERE id = NEW.event_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'confirmed') THEN
    UPDATE events
    SET rsvp_count = GREATEST(COALESCE(rsvp_count, 0) - 1, 0)
    WHERE id = OLD.event_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status != 'confirmed' AND NEW.status = 'confirmed') THEN
      UPDATE events SET rsvp_count = COALESCE(rsvp_count, 0) + 1 WHERE id = NEW.event_id;
    ELSIF (OLD.status = 'confirmed' AND NEW.status != 'confirmed') THEN
      UPDATE events SET rsvp_count = GREATEST(COALESCE(rsvp_count, 0) - 1, 0) WHERE id = NEW.event_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- 3. Create triggers on event_rsvps
DROP TRIGGER IF EXISTS ensure_capacity_on_rsvp ON public.event_rsvps;
CREATE TRIGGER ensure_capacity_on_rsvp
BEFORE INSERT ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.enforce_event_capacity();

DROP TRIGGER IF EXISTS sync_rsvp_count_on_change ON public.event_rsvps;
CREATE TRIGGER sync_rsvp_count_on_change
AFTER INSERT OR DELETE OR UPDATE ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.sync_event_rsvp_count();

-- 4. Deprecate manual increment/decrement functions to prevent double counting
CREATE OR REPLACE FUNCTION public.increment_rsvp_count(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Now handled by triggers on event_rsvps
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_rsvp_count(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Now handled by triggers on event_rsvps
  NULL;
END;
$$;

-- 5. Update promote_from_waitlist to use rsvp_count directly
CREATE OR REPLACE FUNCTION public.promote_from_waitlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_in_line RECORD;
  event_capacity INTEGER;
  current_rsvps INTEGER;
BEGIN
  -- Only trigger on RSVP deletion or status change away from confirmed
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed') THEN
    -- Get event capacity and current rsvp_count
    -- Note: Since this is an AFTER trigger, the rsvp_count in events has already been updated by sync_event_rsvp_count trigger
    SELECT capacity, rsvp_count INTO event_capacity, current_rsvps 
    FROM events 
    WHERE id = OLD.event_id;
    
    -- If there's now room and someone is waiting
    IF event_capacity IS NOT NULL AND (current_rsvps < event_capacity) THEN
      -- Get next person in waitlist
      SELECT * INTO next_in_line
      FROM event_waitlist
      WHERE event_id = OLD.event_id AND status = 'waiting'
      ORDER BY position ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED;
      
      IF next_in_line IS NOT NULL AND next_in_line.id IS NOT NULL THEN
        -- Update waitlist entry status
        UPDATE event_waitlist 
        SET status = 'notified', notified_at = now()
        WHERE id = next_in_line.id;
        
        -- Queue notification
        INSERT INTO notification_queue (user_id, notification_type, payload)
        VALUES (
          next_in_line.user_id,
          'waitlist_spot_available',
          jsonb_build_object(
            'event_id', OLD.event_id,
            'waitlist_id', next_in_line.id
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- 6. Initial sync of rsvp_count
UPDATE public.events e
SET rsvp_count = (
  SELECT COUNT(*)
  FROM public.event_rsvps r
  WHERE r.event_id = e.id AND r.status = 'confirmed'
);
