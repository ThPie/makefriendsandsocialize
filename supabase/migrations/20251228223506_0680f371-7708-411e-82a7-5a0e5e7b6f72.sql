-- Create notification queue table for tracking sent emails
CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage notification queue
CREATE POLICY "Admins can manage notification queue"
  ON public.notification_queue
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to queue dating profile vetted notification
CREATE OR REPLACE FUNCTION public.queue_dating_vetted_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when status changes to 'vetted'
  IF NEW.status = 'vetted' AND (OLD.status IS NULL OR OLD.status <> 'vetted') THEN
    INSERT INTO public.notification_queue (user_id, notification_type, payload)
    VALUES (
      NEW.user_id,
      'dating_vetted',
      jsonb_build_object(
        'profile_id', NEW.id,
        'display_name', NEW.display_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for dating profile vetted
CREATE TRIGGER on_dating_profile_vetted
  AFTER UPDATE ON public.dating_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_dating_vetted_notification();

-- Create function to queue new match notification
CREATE OR REPLACE FUNCTION public.queue_new_match_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_a RECORD;
  profile_b RECORD;
BEGIN
  -- Get both profiles
  SELECT dp.*, p.first_name, au.email as user_email
  INTO profile_a
  FROM public.dating_profiles dp
  JOIN public.profiles p ON dp.user_id = p.id
  JOIN auth.users au ON dp.user_id = au.id
  WHERE dp.id = NEW.user_a_id;

  SELECT dp.*, p.first_name, au.email as user_email
  INTO profile_b
  FROM public.dating_profiles dp
  JOIN public.profiles p ON dp.user_id = p.id
  JOIN auth.users au ON dp.user_id = au.id
  WHERE dp.id = NEW.user_b_id;

  -- Queue notification for user A
  IF profile_a.user_id IS NOT NULL THEN
    INSERT INTO public.notification_queue (user_id, notification_type, payload)
    VALUES (
      profile_a.user_id,
      'new_match',
      jsonb_build_object(
        'match_id', NEW.id,
        'match_display_name', profile_b.display_name,
        'match_photo_url', profile_b.photo_url,
        'compatibility_score', NEW.compatibility_score,
        'match_reason', NEW.match_reason
      )
    );
  END IF;

  -- Queue notification for user B
  IF profile_b.user_id IS NOT NULL THEN
    INSERT INTO public.notification_queue (user_id, notification_type, payload)
    VALUES (
      profile_b.user_id,
      'new_match',
      jsonb_build_object(
        'match_id', NEW.id,
        'match_display_name', profile_a.display_name,
        'match_photo_url', profile_a.photo_url,
        'compatibility_score', NEW.compatibility_score,
        'match_reason', NEW.match_reason
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new matches
CREATE TRIGGER on_new_dating_match
  AFTER INSERT ON public.dating_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_new_match_notification();