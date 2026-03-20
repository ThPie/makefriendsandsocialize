
-- Drop the 4 individual notification triggers
DROP TRIGGER IF EXISTS trigger_mutual_match_notification ON public.dating_matches;
DROP TRIGGER IF EXISTS trigger_meeting_scheduled_notification ON public.dating_matches;
DROP TRIGGER IF EXISTS trigger_decision_time_notification ON public.dating_matches;
DROP TRIGGER IF EXISTS trigger_match_declined_notification ON public.dating_matches;

-- Drop old functions
DROP FUNCTION IF EXISTS queue_mutual_match_notification();
DROP FUNCTION IF EXISTS queue_meeting_scheduled_notification();
DROP FUNCTION IF EXISTS queue_decision_time_notification();
DROP FUNCTION IF EXISTS queue_match_declined_notification();

-- Create one consolidated function
CREATE OR REPLACE FUNCTION queue_dating_match_notification()
RETURNS TRIGGER AS $$
DECLARE
  profile_a RECORD;
  profile_b RECORD;
  notif_type text;
  payload_a jsonb;
  payload_b jsonb;
  formatted_date text;
BEGIN
  -- Determine which notification to send (only one per update)
  IF NEW.status = 'mutual_yes' AND (OLD.status IS NULL OR OLD.status <> 'mutual_yes') THEN
    notif_type := 'mutual_match';
  ELSIF NEW.status = 'declined' AND (OLD.status IS NULL OR OLD.status <> 'declined') THEN
    notif_type := 'match_declined';
  ELSIF NEW.meeting_status = 'met' AND (OLD.meeting_status IS NULL OR OLD.meeting_status <> 'met') THEN
    notif_type := 'decision_time';
  ELSIF NEW.meeting_status = 'scheduled' AND (OLD.meeting_status IS NULL OR OLD.meeting_status <> 'scheduled') THEN
    notif_type := 'meeting_scheduled';
  ELSE
    RETURN NEW;
  END IF;

  -- Get both profiles (single lookup for all cases)
  SELECT dp.*, p.first_name
  INTO profile_a
  FROM public.dating_profiles dp
  LEFT JOIN public.profiles p ON dp.user_id = p.id
  WHERE dp.id = NEW.user_a_id;

  SELECT dp.*, p.first_name
  INTO profile_b
  FROM public.dating_profiles dp
  LEFT JOIN public.profiles p ON dp.user_id = p.id
  WHERE dp.id = NEW.user_b_id;

  -- Build payloads based on type
  IF notif_type = 'meeting_scheduled' THEN
    formatted_date := to_char(NEW.meeting_date, 'Day, Month DD, YYYY');
    payload_a := jsonb_build_object(
      'match_id', NEW.id,
      'display_name', profile_a.display_name,
      'match_display_name', profile_b.display_name,
      'meeting_date', formatted_date,
      'meeting_time', NEW.meeting_time
    );
    payload_b := jsonb_build_object(
      'match_id', NEW.id,
      'display_name', profile_b.display_name,
      'match_display_name', profile_a.display_name,
      'meeting_date', formatted_date,
      'meeting_time', NEW.meeting_time
    );
  ELSIF notif_type = 'match_declined' THEN
    payload_a := jsonb_build_object('match_id', NEW.id, 'display_name', profile_a.display_name);
    payload_b := jsonb_build_object('match_id', NEW.id, 'display_name', profile_b.display_name);
  ELSE
    payload_a := jsonb_build_object(
      'match_id', NEW.id,
      'display_name', profile_a.display_name,
      'match_display_name', profile_b.display_name
    );
    payload_b := jsonb_build_object(
      'match_id', NEW.id,
      'display_name', profile_b.display_name,
      'match_display_name', profile_a.display_name
    );
  END IF;

  -- Queue notifications
  IF profile_a.user_id IS NOT NULL THEN
    INSERT INTO public.notification_queue (user_id, notification_type, payload)
    VALUES (profile_a.user_id, notif_type, payload_a);
  END IF;

  IF profile_b.user_id IS NOT NULL THEN
    INSERT INTO public.notification_queue (user_id, notification_type, payload)
    VALUES (profile_b.user_id, notif_type, payload_b);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create single consolidated trigger
CREATE TRIGGER trigger_dating_match_notifications
  AFTER UPDATE ON public.dating_matches
  FOR EACH ROW
  EXECUTE FUNCTION queue_dating_match_notification();
