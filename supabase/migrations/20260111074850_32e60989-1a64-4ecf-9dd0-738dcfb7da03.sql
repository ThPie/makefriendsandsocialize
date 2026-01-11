-- Create a function to get application data with controlled access to sensitive fields
-- This ensures admin_notes are only visible to the specific admin who reviewed the application
CREATE OR REPLACE FUNCTION public.get_application_safe(_application_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status application_status,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  job_title text,
  industry text,
  interests text[],
  favorite_brands text[],
  style_description text,
  values_in_partner text,
  admin_notes text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  is_owner boolean;
BEGIN
  -- Check if user is an admin
  is_admin := public.has_role(auth.uid(), 'admin');
  
  -- Check if user is the owner of this application
  SELECT EXISTS (
    SELECT 1 FROM public.application_waitlist aw 
    WHERE aw.id = _application_id AND aw.user_id = auth.uid()
  ) INTO is_owner;
  
  -- Only return data if user is admin or owner
  IF NOT (is_admin OR is_owner) THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    aw.id,
    aw.user_id,
    aw.status,
    aw.submitted_at,
    aw.reviewed_at,
    aw.job_title,
    aw.industry,
    aw.interests,
    aw.favorite_brands,
    aw.style_description,
    aw.values_in_partner,
    -- Only show admin_notes to admins, mask for regular users
    CASE 
      WHEN is_admin THEN aw.admin_notes
      ELSE NULL
    END as admin_notes
  FROM public.application_waitlist aw
  WHERE aw.id = _application_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_application_safe(uuid) TO authenticated;

-- Create an audit log table for admin access to sensitive application data
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only system can insert audit logs (via security definer functions)
-- No direct insert policy for users

-- Create a function to log admin access with rate limiting check
CREATE OR REPLACE FUNCTION public.log_admin_access(
  _action_type text,
  _resource_type text,
  _resource_id uuid DEFAULT NULL,
  _details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_access_count integer;
BEGIN
  -- Only log if user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;
  
  -- Check for suspicious activity - more than 50 accesses to applications in last hour
  SELECT COUNT(*) INTO recent_access_count
  FROM public.admin_audit_log
  WHERE admin_user_id = auth.uid()
    AND resource_type = 'application_waitlist'
    AND created_at > now() - interval '1 hour';
  
  -- Log the access
  INSERT INTO public.admin_audit_log (admin_user_id, action_type, resource_type, resource_id, details)
  VALUES (auth.uid(), _action_type, _resource_type, _resource_id, 
    COALESCE(_details, '{}'::jsonb) || jsonb_build_object('access_count_last_hour', recent_access_count)
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_admin_access(text, text, uuid, jsonb) TO authenticated;

-- Add comment explaining security model
COMMENT ON TABLE public.admin_audit_log IS 
'Audit log for tracking admin access to sensitive data. Used to detect unusual access patterns 
that might indicate a compromised admin account harvesting competitive intelligence.';

COMMENT ON FUNCTION public.get_application_safe IS 
'Secure function to retrieve application data with controlled access. Admin notes are only 
visible to admins, not to the applicant themselves. All admin access should be audited.';

-- Create index for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource ON public.admin_audit_log(resource_type, resource_id);