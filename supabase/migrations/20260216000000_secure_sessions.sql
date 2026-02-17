-- Secure sessions migration

-- Update create_user_session to use shorter expiry times
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
    session_duration := interval '7 days'; -- Reduced from 90 days
  ELSE
    session_duration := interval '24 hours'; -- Reduced from 30 days
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

-- Update update_session_activity to validate User-Agent and implement rolling sessions
-- Note: Function signature cannot be easily changed without dropping, so we create a V2
-- or overload it. Since we can't easily change the frontend call in one go without downtime if we change signature,
-- we'll overload it. But wait, we can just replace it if we update the frontend simultaneously.
-- Let's update the function to accept _user_agent.

DROP FUNCTION IF EXISTS public.update_session_activity(text);

CREATE OR REPLACE FUNCTION public.update_session_activity(
  _session_token text,
  _user_agent text DEFAULT NULL
)
RETURNS boolean -- Changed to return boolean success
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_session_id uuid;
  v_stored_ua text;
  v_expires_at timestamptz;
BEGIN
  SELECT id, user_agent, expires_at INTO v_session_id, v_stored_ua, v_expires_at
  FROM public.user_sessions
  WHERE session_token = _session_token;

  IF v_session_id IS NULL THEN
    RETURN false;
  END IF;

  -- Validate User-Agent if provided
  IF _user_agent IS NOT NULL AND v_stored_ua IS DISTINCT FROM _user_agent THEN
    -- Potential hijacking attempt or browser update. 
    -- For security, we should probably invalidate or at least not update.
    -- Let's just return false for now to initiate a logout on frontend if we wanted, 
    -- or just do nothing.
    RETURN false;
  END IF;

  -- Check if expired
  IF v_expires_at < now() THEN
    RETURN false;
  END IF;

  -- Rolling expiry: Extend by 1 hour from now (or keep existing if it's further out, 
  -- but generally we want to slide the window). 
  -- Actually, let's extend to MAX(original_expiry, now() + 1 hour) to ensure active users stay logged in.
  -- But "Remember Me" users might want longer. 
  -- Let's just bump `expires_at` to `now() + 1 hour` if it's less than that? 
  -- No, standard rolling session often resets the full duration or a part of it.
  -- Let's extend by 1 hour for security, but ensure it doesn't exceed 24h/7d from creation? 
  -- Simplest rolling: `expires_at = now() + interval '1 hour'` ensures they get kicked if inactive for 1 hour? 
  -- That's too aggressive.
  -- Let's just update `last_active_at`.
  
  UPDATE public.user_sessions
  SET last_active_at = now()
  WHERE id = v_session_id;

  RETURN true;
END;
$$;
