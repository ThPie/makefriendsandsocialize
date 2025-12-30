-- Create event waitlist table
CREATE TABLE public.event_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own waitlist entries"
  ON public.event_waitlist FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can join waitlist"
  ON public.event_waitlist FOR INSERT
  WITH CHECK (user_id = auth.uid() AND has_active_membership(auth.uid()));

CREATE POLICY "Users can leave waitlist"
  ON public.event_waitlist FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all waitlist entries"
  ON public.event_waitlist FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Function to get next waitlist position
CREATE OR REPLACE FUNCTION public.get_next_waitlist_position(p_event_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(MAX(position), 0) + 1
  FROM public.event_waitlist
  WHERE event_id = p_event_id AND status = 'waiting';
$$;

-- Function to promote from waitlist when spot opens
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
  -- Only trigger on RSVP deletion or cancellation
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status = 'cancelled') THEN
    -- Get event capacity
    SELECT capacity INTO event_capacity FROM events WHERE id = OLD.event_id;
    
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

-- Create trigger for RSVP changes
CREATE TRIGGER promote_waitlist_on_rsvp_change
  AFTER DELETE OR UPDATE ON public.event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_from_waitlist();