-- Part 1: Admin access pattern detection

-- Create function to check for suspicious admin activity and queue alerts
CREATE OR REPLACE FUNCTION public.check_admin_access_patterns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_count INTEGER;
  admin_name TEXT;
BEGIN
  -- Only check for application_waitlist access (the sensitive resource)
  IF NEW.resource_type = 'application_waitlist' THEN
    -- Count accesses in the last hour for this admin
    SELECT COUNT(*) INTO access_count
    FROM admin_audit_log
    WHERE admin_user_id = NEW.admin_user_id
      AND resource_type = 'application_waitlist'
      AND created_at > now() - interval '1 hour';
    
    -- If threshold exceeded (50+ accesses), queue an alert
    IF access_count >= 50 THEN
      -- Get admin details for the notification
      SELECT p.first_name || ' ' || COALESCE(p.last_name, '')
      INTO admin_name
      FROM profiles p
      WHERE p.id = NEW.admin_user_id;
      
      -- Queue notification for all admins (except the suspicious one)
      INSERT INTO notification_queue (user_id, notification_type, payload)
      SELECT 
        ur.user_id,
        'admin_suspicious_access',
        jsonb_build_object(
          'suspicious_admin_id', NEW.admin_user_id,
          'suspicious_admin_name', COALESCE(admin_name, 'Unknown'),
          'access_count', access_count,
          'resource_type', NEW.resource_type,
          'detected_at', now()::text
        )
      FROM user_roles ur
      WHERE ur.role = 'admin'
        AND ur.user_id != NEW.admin_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for admin access pattern detection
DROP TRIGGER IF EXISTS detect_admin_access_patterns ON admin_audit_log;
CREATE TRIGGER detect_admin_access_patterns
  AFTER INSERT ON admin_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.check_admin_access_patterns();

-- Part 2: Strengthen is_connected_with function with NULL checks and validation

CREATE OR REPLACE FUNCTION public.is_connected_with(_user_id uuid, _other_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _user_id IS NULL OR _other_user_id IS NULL THEN false
    WHEN _user_id = _other_user_id THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.connections c
      WHERE c.status = 'accepted'
        AND (
          (c.requester_id = _user_id AND c.requested_id = _other_user_id)
          OR (c.requester_id = _other_user_id AND c.requested_id = _user_id)
        )
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id)
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = _other_user_id)
    )
  END
$$;

COMMENT ON FUNCTION public.is_connected_with IS 'Securely checks if two users have an accepted connection. Returns false for NULL inputs, self-connections, or non-existent profiles.';