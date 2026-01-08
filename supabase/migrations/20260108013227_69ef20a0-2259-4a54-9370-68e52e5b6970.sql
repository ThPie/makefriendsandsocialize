-- Add notification preference columns to dating_profiles
ALTER TABLE public.dating_profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT false;

-- Create trigger to queue dates_proposed notification when new meeting proposals are created
CREATE OR REPLACE FUNCTION public.queue_dates_proposed_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  match_record RECORD;
  proposer_profile RECORD;
  other_profile_id uuid;
  other_user_id uuid;
BEGIN
  -- Get the match details
  SELECT * INTO match_record FROM public.dating_matches WHERE id = NEW.match_id;
  
  -- Get the proposer's profile
  SELECT * INTO proposer_profile FROM public.dating_profiles WHERE id = NEW.proposed_by;
  
  -- Determine the other person's profile id
  IF NEW.proposed_by = match_record.user_a_id THEN
    other_profile_id := match_record.user_b_id;
  ELSE
    other_profile_id := match_record.user_a_id;
  END IF;
  
  -- Get the other person's user_id
  SELECT user_id INTO other_user_id FROM public.dating_profiles WHERE id = other_profile_id;
  
  -- Only queue notification if this is the first proposal in this batch (check if there are existing proposals)
  IF NOT EXISTS (
    SELECT 1 FROM public.meeting_proposals 
    WHERE match_id = NEW.match_id 
    AND proposed_by = NEW.proposed_by 
    AND id != NEW.id
    AND created_at > now() - interval '1 minute'
  ) THEN
    INSERT INTO public.notification_queue (user_id, notification_type, payload)
    VALUES (
      other_user_id,
      'dates_proposed',
      jsonb_build_object(
        'match_id', NEW.match_id,
        'proposer_display_name', proposer_profile.display_name,
        'proposal_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on meeting_proposals insert
DROP TRIGGER IF EXISTS on_meeting_proposal_created ON public.meeting_proposals;
CREATE TRIGGER on_meeting_proposal_created
  AFTER INSERT ON public.meeting_proposals
  FOR EACH ROW EXECUTE FUNCTION public.queue_dates_proposed_notification();

-- Create trigger to queue date_accepted notification when a proposal is accepted
CREATE OR REPLACE FUNCTION public.queue_date_accepted_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  match_record RECORD;
  accepter_profile RECORD;
  proposer_user_id uuid;
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status <> 'accepted') THEN
    -- Get the match details
    SELECT * INTO match_record FROM public.dating_matches WHERE id = NEW.match_id;
    
    -- The person who accepted is NOT the proposer
    -- Get the accepter's profile (the person who didn't propose)
    IF NEW.proposed_by = match_record.user_a_id THEN
      SELECT * INTO accepter_profile FROM public.dating_profiles WHERE id = match_record.user_b_id;
    ELSE
      SELECT * INTO accepter_profile FROM public.dating_profiles WHERE id = match_record.user_a_id;
    END IF;
    
    -- Get the proposer's user_id
    SELECT user_id INTO proposer_user_id FROM public.dating_profiles WHERE id = NEW.proposed_by;
    
    -- Queue notification for the proposer
    INSERT INTO public.notification_queue (user_id, notification_type, payload)
    VALUES (
      proposer_user_id,
      'date_accepted',
      jsonb_build_object(
        'match_id', NEW.match_id,
        'accepter_display_name', accepter_profile.display_name,
        'meeting_date', NEW.proposed_date,
        'meeting_time', NEW.proposed_time
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on meeting_proposals update
DROP TRIGGER IF EXISTS on_meeting_proposal_accepted ON public.meeting_proposals;
CREATE TRIGGER on_meeting_proposal_accepted
  AFTER UPDATE ON public.meeting_proposals
  FOR EACH ROW EXECUTE FUNCTION public.queue_date_accepted_notification();