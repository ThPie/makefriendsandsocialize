-- Create trigger function to queue meeting scheduled notification
CREATE OR REPLACE FUNCTION public.queue_meeting_scheduled_notification()
RETURNS TRIGGER AS $$
DECLARE
  profile_a RECORD;
  profile_b RECORD;
  formatted_date text;
BEGIN
  -- Only trigger when meeting_status changes to 'scheduled'
  IF NEW.meeting_status = 'scheduled' AND (OLD.meeting_status IS NULL OR OLD.meeting_status <> 'scheduled') THEN
    -- Format the meeting date
    formatted_date := to_char(NEW.meeting_date, 'Day, Month DD, YYYY');
    
    -- Get both profiles
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

    -- Queue notification for user A
    IF profile_a.user_id IS NOT NULL THEN
      INSERT INTO public.notification_queue (user_id, notification_type, payload)
      VALUES (
        profile_a.user_id,
        'meeting_scheduled',
        jsonb_build_object(
          'match_id', NEW.id,
          'display_name', profile_a.display_name,
          'match_display_name', profile_b.display_name,
          'meeting_date', formatted_date,
          'meeting_time', NEW.meeting_time
        )
      );
    END IF;

    -- Queue notification for user B
    IF profile_b.user_id IS NOT NULL THEN
      INSERT INTO public.notification_queue (user_id, notification_type, payload)
      VALUES (
        profile_b.user_id,
        'meeting_scheduled',
        jsonb_build_object(
          'match_id', NEW.id,
          'display_name', profile_b.display_name,
          'match_display_name', profile_a.display_name,
          'meeting_date', formatted_date,
          'meeting_time', NEW.meeting_time
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function to queue decision time notification
CREATE OR REPLACE FUNCTION public.queue_decision_time_notification()
RETURNS TRIGGER AS $$
DECLARE
  profile_a RECORD;
  profile_b RECORD;
BEGIN
  -- Only trigger when meeting_status changes to 'met'
  IF NEW.meeting_status = 'met' AND (OLD.meeting_status IS NULL OR OLD.meeting_status <> 'met') THEN
    -- Get both profiles
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

    -- Queue notification for user A
    IF profile_a.user_id IS NOT NULL THEN
      INSERT INTO public.notification_queue (user_id, notification_type, payload)
      VALUES (
        profile_a.user_id,
        'decision_time',
        jsonb_build_object(
          'match_id', NEW.id,
          'display_name', profile_a.display_name,
          'match_display_name', profile_b.display_name
        )
      );
    END IF;

    -- Queue notification for user B
    IF profile_b.user_id IS NOT NULL THEN
      INSERT INTO public.notification_queue (user_id, notification_type, payload)
      VALUES (
        profile_b.user_id,
        'decision_time',
        jsonb_build_object(
          'match_id', NEW.id,
          'display_name', profile_b.display_name,
          'match_display_name', profile_a.display_name
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function to queue mutual match notification
CREATE OR REPLACE FUNCTION public.queue_mutual_match_notification()
RETURNS TRIGGER AS $$
DECLARE
  profile_a RECORD;
  profile_b RECORD;
BEGIN
  -- Only trigger when status changes to 'mutual_yes'
  IF NEW.status = 'mutual_yes' AND (OLD.status IS NULL OR OLD.status <> 'mutual_yes') THEN
    -- Get both profiles
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

    -- Queue notification for user A
    IF profile_a.user_id IS NOT NULL THEN
      INSERT INTO public.notification_queue (user_id, notification_type, payload)
      VALUES (
        profile_a.user_id,
        'mutual_match',
        jsonb_build_object(
          'match_id', NEW.id,
          'display_name', profile_a.display_name,
          'match_display_name', profile_b.display_name
        )
      );
    END IF;

    -- Queue notification for user B
    IF profile_b.user_id IS NOT NULL THEN
      INSERT INTO public.notification_queue (user_id, notification_type, payload)
      VALUES (
        profile_b.user_id,
        'mutual_match',
        jsonb_build_object(
          'match_id', NEW.id,
          'display_name', profile_b.display_name,
          'match_display_name', profile_a.display_name
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function to queue match declined notification
CREATE OR REPLACE FUNCTION public.queue_match_declined_notification()
RETURNS TRIGGER AS $$
DECLARE
  profile_a RECORD;
  profile_b RECORD;
BEGIN
  -- Only trigger when status changes to 'declined'
  IF NEW.status = 'declined' AND (OLD.status IS NULL OR OLD.status <> 'declined') THEN
    -- Get both profiles
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

    -- Queue notification for user A
    IF profile_a.user_id IS NOT NULL THEN
      INSERT INTO public.notification_queue (user_id, notification_type, payload)
      VALUES (
        profile_a.user_id,
        'match_declined',
        jsonb_build_object(
          'match_id', NEW.id,
          'display_name', profile_a.display_name
        )
      );
    END IF;

    -- Queue notification for user B
    IF profile_b.user_id IS NOT NULL THEN
      INSERT INTO public.notification_queue (user_id, notification_type, payload)
      VALUES (
        profile_b.user_id,
        'match_declined',
        jsonb_build_object(
          'match_id', NEW.id,
          'display_name', profile_b.display_name
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers on dating_matches table
CREATE TRIGGER trigger_meeting_scheduled_notification
  AFTER UPDATE ON public.dating_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_meeting_scheduled_notification();

CREATE TRIGGER trigger_decision_time_notification
  AFTER UPDATE ON public.dating_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_decision_time_notification();

CREATE TRIGGER trigger_mutual_match_notification
  AFTER UPDATE ON public.dating_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_mutual_match_notification();

CREATE TRIGGER trigger_match_declined_notification
  AFTER UPDATE ON public.dating_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_match_declined_notification();