-- Add email preference columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_reminders_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reminder_hours_before INTEGER DEFAULT 24;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_emails_enabled BOOLEAN DEFAULT true;

-- Create trigger function to notify on referral conversion
CREATE OR REPLACE FUNCTION public.notify_referral_conversion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND (OLD.status IS NULL OR OLD.status != 'converted') THEN
    INSERT INTO public.notification_queue (user_id, notification_type, payload, status)
    VALUES (
      NEW.referrer_id, 
      'referral_converted', 
      jsonb_build_object(
        'referral_id', NEW.id,
        'referred_user_id', NEW.referred_user_id,
        'referral_code', NEW.referral_code
      ),
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on referrals table
DROP TRIGGER IF EXISTS on_referral_conversion ON public.referrals;
CREATE TRIGGER on_referral_conversion
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_referral_conversion();