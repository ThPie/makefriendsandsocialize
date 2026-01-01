-- Add last_scanned_at column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP WITH TIME ZONE;

-- Create function to update last_scanned_at when a security report is created
CREATE OR REPLACE FUNCTION public.update_profile_last_scanned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_scanned_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create trigger to call the function on security report insert
DROP TRIGGER IF EXISTS on_security_report_created ON public.member_security_reports;
CREATE TRIGGER on_security_report_created
  AFTER INSERT ON public.member_security_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_last_scanned();