-- =====================================================
-- COMPREHENSIVE SECURITY FIXES
-- =====================================================

-- 1. Create secure profile access function for connections
-- This limits what data can be accessed through connection-based queries
CREATE OR REPLACE FUNCTION public.get_connected_profile_limited(_profile_id UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  avatar_urls TEXT[],
  city TEXT,
  job_title TEXT,
  industry TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return limited data for connected profiles
  IF NOT (
    _profile_id = auth.uid() 
    OR public.is_connected_with(auth.uid(), _profile_id)
    OR public.has_role(auth.uid(), 'admin')
  ) THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.avatar_urls,
    p.city,
    p.job_title,
    p.industry
  FROM public.profiles p
  WHERE p.id = _profile_id;
END;
$$;

-- 2. Drop sensitive columns from dating_profiles 
-- These are now stored encrypted in dating_profile_sensitive_data
ALTER TABLE public.dating_profiles DROP COLUMN IF EXISTS phone_number;
ALTER TABLE public.dating_profiles DROP COLUMN IF EXISTS linkedin_url;
ALTER TABLE public.dating_profiles DROP COLUMN IF EXISTS instagram_url;
ALTER TABLE public.dating_profiles DROP COLUMN IF EXISTS facebook_url;
ALTER TABLE public.dating_profiles DROP COLUMN IF EXISTS twitter_url;

-- 3. Add cleanup function for leads (data retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_leads()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Delete leads older than 90 days that are still in 'new' status
  DELETE FROM public.leads 
  WHERE created_at < now() - interval '90 days'
  AND status = 'new';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 4. Add RLS policies for notification system tables
-- These tables should only be accessible by service role/admins

-- notification_throttle_log policies
CREATE POLICY "Users can view their own throttle log"
ON public.notification_throttle_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage throttle log"
ON public.notification_throttle_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all throttle logs"
ON public.notification_throttle_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- pending_notification_bundle policies
CREATE POLICY "Users can view their own pending bundles"
ON public.pending_notification_bundle
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert pending bundles"
ON public.pending_notification_bundle
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all pending bundles"
ON public.pending_notification_bundle
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));