-- Migration: Security Hardening Review
-- Created: 2026-02-18
-- Purpose: Enable RLS on sensitive tables and enforce strict policies.

--
-- 1. Secure `dating_profile_sensitive_data`
--
ALTER TABLE public.dating_profile_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sensitive data
CREATE POLICY "Users can view own sensitive data"
ON public.dating_profile_sensitive_data
FOR SELECT
TO authenticated
USING (
  dating_profile_id IN (
    SELECT id FROM public.dating_profiles WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update their own sensitive data
CREATE POLICY "Users can update own sensitive data"
ON public.dating_profile_sensitive_data
FOR UPDATE
TO authenticated
USING (
  dating_profile_id IN (
    SELECT id FROM public.dating_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  dating_profile_id IN (
    SELECT id FROM public.dating_profiles WHERE user_id = auth.uid()
  )
);

-- Policy: Users can insert their own sensitive data
CREATE POLICY "Users can insert own sensitive data"
ON public.dating_profile_sensitive_data
FOR INSERT
TO authenticated
WITH CHECK (
  dating_profile_id IN (
    SELECT id FROM public.dating_profiles WHERE user_id = auth.uid()
  )
);

-- Policy: Service Role has full access
CREATE POLICY "Service role full access on sensitive data"
ON public.dating_profile_sensitive_data
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


--
-- 2. Secure `admin_audit_log`
--
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Policy: Admin/Service Role can insert audit logs
-- (Assuming Admins might trigger actions that log, but usually logs are created by triggers/backend)
CREATE POLICY "Service role can insert audit logs"
ON public.admin_audit_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy: Service Role full access
CREATE POLICY "Service role full access on audit logs"
ON public.admin_audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


--
-- 3. Secure `user_sessions` (Precautionary)
--
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can delete (sign out) their own sessions
CREATE POLICY "Users can delete own sessions"
ON public.user_sessions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Service Role full access
CREATE POLICY "Service role full access on user sessions"
ON public.user_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


--
-- 4. Review `profiles_public` View
-- Verified: The view only exposes id, first_name, bio, created_at, is_visible.
-- No action needed as it filters sensitive columns by definition.
