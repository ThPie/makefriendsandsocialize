-- Create user_sessions table for multi-device session tracking
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  device_name text,
  device_type text,
  browser text,
  os text,
  ip_address text,
  user_agent text,
  remember_me boolean DEFAULT false,
  last_active_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_current boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own sessions (for revoking)
CREATE POLICY "Users can delete own sessions"
ON public.user_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Create OAuth rate limits table with simple composite key
CREATE TABLE public.oauth_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  window_hour timestamp with time zone NOT NULL,
  attempt_count integer DEFAULT 1,
  failed_attempts integer DEFAULT 0,
  last_attempt_at timestamp with time zone DEFAULT now(),
  requires_captcha boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (ip_address, window_hour)
);

-- Enable RLS
ALTER TABLE public.oauth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow public insert/update for rate limiting (service role will manage)
CREATE POLICY "Allow rate limit operations"
ON public.oauth_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to check OAuth rate limit
CREATE OR REPLACE FUNCTION public.check_oauth_rate_limit(_ip_address text)
RETURNS TABLE(
  allowed boolean,
  remaining_attempts integer,
  requires_captcha boolean,
  reset_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_hour timestamp with time zone;
  current_record oauth_rate_limits%ROWTYPE;
  max_attempts integer := 10;
  captcha_threshold integer := 3;
BEGIN
  current_hour := date_trunc('hour', now());
  
  SELECT * INTO current_record
  FROM public.oauth_rate_limits
  WHERE ip_address = _ip_address
    AND window_hour = current_hour;
  
  IF current_record.id IS NULL THEN
    allowed := true;
    remaining_attempts := max_attempts - 1;
    requires_captcha := false;
    reset_at := current_hour + interval '1 hour';
  ELSE
    allowed := current_record.attempt_count < max_attempts;
    remaining_attempts := GREATEST(0, max_attempts - current_record.attempt_count);
    requires_captcha := current_record.failed_attempts >= captcha_threshold;
    reset_at := current_hour + interval '1 hour';
  END IF;
  
  RETURN NEXT;
END;
$$;

-- Function to increment OAuth attempt
CREATE OR REPLACE FUNCTION public.increment_oauth_attempt(_ip_address text, _is_failure boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_hour timestamp with time zone;
BEGIN
  current_hour := date_trunc('hour', now());
  
  INSERT INTO public.oauth_rate_limits (ip_address, window_hour, attempt_count, failed_attempts, last_attempt_at, requires_captcha)
  VALUES (_ip_address, current_hour, 1, CASE WHEN _is_failure THEN 1 ELSE 0 END, now(), _is_failure)
  ON CONFLICT (ip_address, window_hour)
  DO UPDATE SET
    attempt_count = oauth_rate_limits.attempt_count + 1,
    failed_attempts = CASE WHEN _is_failure THEN oauth_rate_limits.failed_attempts + 1 ELSE oauth_rate_limits.failed_attempts END,
    last_attempt_at = now(),
    requires_captcha = CASE WHEN _is_failure THEN (oauth_rate_limits.failed_attempts + 1) >= 3 ELSE oauth_rate_limits.requires_captcha END;
END;
$$;

-- Function to cleanup old OAuth rate limits
CREATE OR REPLACE FUNCTION public.cleanup_old_oauth_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.oauth_rate_limits
  WHERE window_hour < now() - interval '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to create user session
CREATE OR REPLACE FUNCTION public.create_user_session(
  _user_id uuid,
  _session_token text,
  _device_name text,
  _device_type text,
  _browser text,
  _os text,
  _ip_address text,
  _user_agent text,
  _remember_me boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  session_id uuid;
  session_duration interval;
BEGIN
  IF _remember_me THEN
    session_duration := interval '90 days';
  ELSE
    session_duration := interval '30 days';
  END IF;
  
  UPDATE public.user_sessions
  SET is_current = false
  WHERE user_id = _user_id;
  
  INSERT INTO public.user_sessions (
    user_id, session_token, device_name, device_type, browser, os,
    ip_address, user_agent, remember_me, expires_at, is_current
  )
  VALUES (
    _user_id, _session_token, _device_name, _device_type, _browser, _os,
    _ip_address, _user_agent, _remember_me, now() + session_duration, true
  )
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- Function to update session activity
CREATE OR REPLACE FUNCTION public.update_session_activity(_session_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_sessions
  SET last_active_at = now()
  WHERE session_token = _session_token
    AND expires_at > now();
END;
$$;

-- Function to revoke session
CREATE OR REPLACE FUNCTION public.revoke_user_session(_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE id = _session_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create indexes for performance
CREATE INDEX user_sessions_user_id_idx ON public.user_sessions(user_id);
CREATE INDEX user_sessions_expires_at_idx ON public.user_sessions(expires_at);
CREATE INDEX user_sessions_session_token_idx ON public.user_sessions(session_token);
CREATE INDEX oauth_rate_limits_ip_idx ON public.oauth_rate_limits(ip_address);
CREATE INDEX oauth_rate_limits_window_idx ON public.oauth_rate_limits(window_hour);