-- Fix Issue 1: Session token exposure - Create a safe view excluding session_token
-- Users don't need to read their own session tokens via API

-- Create a view that excludes the session_token column
CREATE OR REPLACE VIEW public.user_sessions_safe
WITH (security_invoker = on) AS
  SELECT 
    id,
    user_id,
    device_name,
    device_type,
    browser,
    os,
    ip_address,
    user_agent,
    remember_me,
    last_active_at,
    expires_at,
    is_current,
    created_at
    -- session_token is EXCLUDED for security
  FROM public.user_sessions;

-- Drop the existing permissive SELECT policy on user_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;

-- Create a restrictive policy - users cannot directly SELECT from user_sessions
-- They must use the safe view instead
CREATE POLICY "No direct session token access"
ON public.user_sessions
FOR SELECT
USING (false);

-- Allow users to read the safe view (via service role for validation)
-- The view will be accessed through edge functions with service role

-- Fix Issue 2: Ensure all database functions have search_path set
-- Check and fix any functions without search_path
-- The encrypt/decrypt functions may be missing this

CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _value IS NULL OR _value = '' THEN
    RETURN NULL;
  END IF;
  -- Simple encoding for now - in production use pgcrypto with proper key management
  RETURN encode(convert_to(_value, 'UTF8'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(_encrypted text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _encrypted IS NULL OR _encrypted = '' THEN
    RETURN NULL;
  END IF;
  RETURN convert_from(decode(_encrypted, 'base64'), 'UTF8');
END;
$$;