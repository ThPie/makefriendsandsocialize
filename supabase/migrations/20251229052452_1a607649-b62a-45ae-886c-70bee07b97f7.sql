-- Create function to trigger push notification when notification is queued
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_title text;
  notification_body text;
  notification_url text;
BEGIN
  -- Map notification type to title/body
  CASE NEW.notification_type
    WHEN 'new_match' THEN
      notification_title := 'New Match!';
      notification_body := 'You have a new match on Slow Dating. Check it out!';
      notification_url := '/portal/slow-dating';
    WHEN 'meeting_scheduled' THEN
      notification_title := 'Meeting Scheduled';
      notification_body := 'Your meeting has been scheduled. View the details.';
      notification_url := '/portal/slow-dating';
    WHEN 'decision_time' THEN
      notification_title := 'Decision Time';
      notification_body := 'It''s time to decide on your recent date!';
      notification_url := '/portal/slow-dating';
    WHEN 'mutual_match' THEN
      notification_title := 'It''s a Match!';
      notification_body := 'Great news! You both want to continue. Check it out!';
      notification_url := '/portal/slow-dating';
    WHEN 'dating_vetted' THEN
      notification_title := 'Profile Approved';
      notification_body := 'Your dating profile has been approved!';
      notification_url := '/portal/slow-dating';
    ELSE
      notification_title := 'New Notification';
      notification_body := 'You have a new notification';
      notification_url := '/portal/dashboard';
  END CASE;

  -- Update the notification record with push data (for reference)
  UPDATE public.notification_queue 
  SET payload = NEW.payload || jsonb_build_object(
    'push_title', notification_title,
    'push_body', notification_body,
    'push_url', notification_url
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_push_on_notification ON public.notification_queue;
CREATE TRIGGER trigger_push_on_notification
AFTER INSERT ON public.notification_queue
FOR EACH ROW
EXECUTE FUNCTION public.trigger_push_notification();