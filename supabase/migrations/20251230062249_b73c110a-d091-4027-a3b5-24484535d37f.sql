-- Create a function to send waitlist notification via edge function
CREATE OR REPLACE FUNCTION public.send_waitlist_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id_val uuid;
  waitlist_id_val uuid;
BEGIN
  -- Only trigger for waitlist_spot_available notifications
  IF NEW.notification_type = 'waitlist_spot_available' THEN
    -- Extract event_id and waitlist_id from payload
    event_id_val := (NEW.payload->>'event_id')::uuid;
    waitlist_id_val := (NEW.payload->>'waitlist_id')::uuid;
    
    -- Call the edge function using pg_net (async HTTP request)
    PERFORM net.http_post(
      url := current_setting('app.supabase_url', true) || '/functions/v1/send-waitlist-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object(
        'userId', NEW.user_id::text,
        'eventId', event_id_val::text,
        'waitlistId', waitlist_id_val::text
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to send email when waitlist notification is queued
DROP TRIGGER IF EXISTS on_waitlist_notification_queued ON public.notification_queue;
CREATE TRIGGER on_waitlist_notification_queued
  AFTER INSERT ON public.notification_queue
  FOR EACH ROW
  WHEN (NEW.notification_type = 'waitlist_spot_available')
  EXECUTE FUNCTION public.send_waitlist_notification();