-- Drop the problematic trigger that uses pg_net (may not be available)
DROP TRIGGER IF EXISTS on_waitlist_notification_queued ON public.notification_queue;
DROP FUNCTION IF EXISTS public.send_waitlist_notification();

-- Update the promote_from_waitlist function to be simpler and just queue the notification
-- The edge function will be called from the frontend when canceling RSVP
CREATE OR REPLACE FUNCTION public.promote_from_waitlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_in_line RECORD;
  event_capacity INTEGER;
  current_rsvps INTEGER;
  event_title TEXT;
BEGIN
  -- Only trigger on RSVP deletion or cancellation
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status = 'cancelled') THEN
    -- Get event capacity and title
    SELECT capacity, title INTO event_capacity, event_title FROM events WHERE id = OLD.event_id;
    
    -- Get current RSVP count
    SELECT COUNT(*) INTO current_rsvps 
    FROM event_rsvps 
    WHERE event_id = OLD.event_id AND status = 'confirmed';
    
    -- If there's now room and someone is waiting
    IF event_capacity IS NOT NULL AND current_rsvps < event_capacity THEN
      -- Get next person in waitlist
      SELECT * INTO next_in_line
      FROM event_waitlist
      WHERE event_id = OLD.event_id AND status = 'waiting'
      ORDER BY position ASC
      LIMIT 1;
      
      IF next_in_line.id IS NOT NULL THEN
        -- Update waitlist entry status
        UPDATE event_waitlist 
        SET status = 'notified', notified_at = now()
        WHERE id = next_in_line.id;
        
        -- Queue notification with event title for the edge function
        INSERT INTO notification_queue (user_id, notification_type, payload)
        VALUES (
          next_in_line.user_id,
          'waitlist_spot_available',
          jsonb_build_object(
            'event_id', OLD.event_id,
            'event_title', event_title,
            'waitlist_id', next_in_line.id
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;