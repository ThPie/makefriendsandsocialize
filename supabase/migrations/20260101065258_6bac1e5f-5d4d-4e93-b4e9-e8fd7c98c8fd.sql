-- Add verification columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_security_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

-- Create function to auto-verify profile when security report is cleared
CREATE OR REPLACE FUNCTION public.handle_security_report_cleared()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a security report status changes to 'cleared', update the profile
  IF NEW.status = 'cleared' AND (OLD.status IS NULL OR OLD.status <> 'cleared') THEN
    UPDATE public.profiles
    SET is_security_verified = true, verified_at = now()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-verification
DROP TRIGGER IF EXISTS on_security_report_cleared ON public.member_security_reports;
CREATE TRIGGER on_security_report_cleared
  AFTER UPDATE ON public.member_security_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_security_report_cleared();

-- Create function to queue OSINT scan when application is submitted
CREATE OR REPLACE FUNCTION public.queue_osint_scan_on_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a pending security report for the new applicant
  INSERT INTO public.member_security_reports (
    user_id,
    scan_type,
    status
  ) VALUES (
    NEW.user_id,
    'automatic',
    'pending'
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic OSINT scan on application submission
DROP TRIGGER IF EXISTS on_application_submitted ON public.application_waitlist;
CREATE TRIGGER on_application_submitted
  AFTER INSERT ON public.application_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_osint_scan_on_application();