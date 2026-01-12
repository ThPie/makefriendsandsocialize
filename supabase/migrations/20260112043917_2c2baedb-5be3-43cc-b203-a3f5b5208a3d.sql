-- STEP 1: Create check_admin_mfa_verified function
CREATE OR REPLACE FUNCTION public.check_admin_mfa_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_mfa_sessions
    WHERE user_id = _user_id
      AND expires_at > now()
  )
$$;

-- STEP 2: Create RLS policy for admins with MFA to view sensitive data
CREATE POLICY "Admins with MFA can view sensitive data"
  ON public.dating_profile_sensitive_data FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') AND 
    public.check_admin_mfa_verified(auth.uid())
  );

-- STEP 3: Create rate limit check function
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(
  _admin_id uuid,
  _endpoint text,
  _max_requests integer DEFAULT 100,
  _window_minutes integer DEFAULT 60
)
RETURNS TABLE (
  allowed boolean,
  remaining_requests integer,
  reset_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_window_start timestamp with time zone;
  current_count integer;
  window_reset timestamp with time zone;
BEGIN
  current_window_start := date_trunc('minute', now() - ((_window_minutes - 1) * interval '1 minute'));
  window_reset := current_window_start + (_window_minutes * interval '1 minute');
  
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM public.admin_rate_limits
  WHERE admin_user_id = _admin_id
    AND endpoint = _endpoint
    AND window_start >= current_window_start;
  
  allowed := current_count < _max_requests;
  remaining_requests := GREATEST(0, _max_requests - current_count);
  reset_at := window_reset;
  
  RETURN NEXT;
END;
$$;

-- STEP 4: Create function to increment rate limit counter
CREATE OR REPLACE FUNCTION public.increment_admin_rate_limit(
  _admin_id uuid,
  _endpoint text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_minute timestamp with time zone;
BEGIN
  current_minute := date_trunc('minute', now());
  
  INSERT INTO public.admin_rate_limits (admin_user_id, endpoint, request_count, window_start)
  VALUES (_admin_id, _endpoint, 1, current_minute)
  ON CONFLICT (admin_user_id, endpoint, window_start)
  DO UPDATE SET request_count = admin_rate_limits.request_count + 1;
END;
$$;

-- STEP 5: Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- STEP 6: Encryption function
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(
  _plaintext text,
  _key text DEFAULT 'dating_profile_key_v1'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF _plaintext IS NULL OR _plaintext = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(pgp_sym_encrypt(_plaintext, _key), 'base64');
END;
$$;

-- STEP 7: Decryption function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(
  _ciphertext text,
  _key text DEFAULT 'dating_profile_key_v1'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF _ciphertext IS NULL OR _ciphertext = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(decode(_ciphertext, 'base64'), _key);
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

-- STEP 8: Get decrypted sensitive data function
CREATE OR REPLACE FUNCTION public.get_dating_profile_sensitive_data(_dating_profile_id uuid)
RETURNS TABLE (
  phone_number text,
  linkedin_url text,
  instagram_url text,
  facebook_url text,
  twitter_url text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_user_id uuid;
  is_owner boolean;
  is_admin_verified boolean;
BEGIN
  SELECT dp.user_id INTO profile_user_id
  FROM public.dating_profiles dp
  WHERE dp.id = _dating_profile_id;
  
  is_owner := (profile_user_id = auth.uid());
  is_admin_verified := (
    public.has_role(auth.uid(), 'admin') AND 
    public.check_admin_mfa_verified(auth.uid())
  );
  
  IF NOT (is_owner OR is_admin_verified) THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    public.decrypt_sensitive_field(dpsd.phone_number_encrypted),
    public.decrypt_sensitive_field(dpsd.linkedin_url_encrypted),
    public.decrypt_sensitive_field(dpsd.instagram_url_encrypted),
    public.decrypt_sensitive_field(dpsd.facebook_url_encrypted),
    public.decrypt_sensitive_field(dpsd.twitter_url_encrypted)
  FROM public.dating_profile_sensitive_data dpsd
  WHERE dpsd.dating_profile_id = _dating_profile_id;
END;
$$;

-- STEP 9: Save encrypted sensitive data function
CREATE OR REPLACE FUNCTION public.save_dating_profile_sensitive_data(
  _dating_profile_id uuid,
  _phone_number text DEFAULT NULL,
  _linkedin_url text DEFAULT NULL,
  _instagram_url text DEFAULT NULL,
  _facebook_url text DEFAULT NULL,
  _twitter_url text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_user_id uuid;
BEGIN
  SELECT dp.user_id INTO profile_user_id
  FROM public.dating_profiles dp
  WHERE dp.id = _dating_profile_id;
  
  IF profile_user_id != auth.uid() THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.dating_profile_sensitive_data (
    dating_profile_id,
    phone_number_encrypted,
    linkedin_url_encrypted,
    instagram_url_encrypted,
    facebook_url_encrypted,
    twitter_url_encrypted,
    updated_at
  ) VALUES (
    _dating_profile_id,
    public.encrypt_sensitive_field(_phone_number),
    public.encrypt_sensitive_field(_linkedin_url),
    public.encrypt_sensitive_field(_instagram_url),
    public.encrypt_sensitive_field(_facebook_url),
    public.encrypt_sensitive_field(_twitter_url),
    now()
  )
  ON CONFLICT (dating_profile_id) DO UPDATE SET
    phone_number_encrypted = COALESCE(public.encrypt_sensitive_field(_phone_number), dating_profile_sensitive_data.phone_number_encrypted),
    linkedin_url_encrypted = COALESCE(public.encrypt_sensitive_field(_linkedin_url), dating_profile_sensitive_data.linkedin_url_encrypted),
    instagram_url_encrypted = COALESCE(public.encrypt_sensitive_field(_instagram_url), dating_profile_sensitive_data.instagram_url_encrypted),
    facebook_url_encrypted = COALESCE(public.encrypt_sensitive_field(_facebook_url), dating_profile_sensitive_data.facebook_url_encrypted),
    twitter_url_encrypted = COALESCE(public.encrypt_sensitive_field(_twitter_url), dating_profile_sensitive_data.twitter_url_encrypted),
    updated_at = now();
  
  RETURN true;
END;
$$;

-- STEP 10: Migrate existing sensitive data
INSERT INTO public.dating_profile_sensitive_data (
  dating_profile_id,
  phone_number_encrypted,
  linkedin_url_encrypted,
  instagram_url_encrypted,
  facebook_url_encrypted,
  twitter_url_encrypted
)
SELECT 
  id,
  public.encrypt_sensitive_field(phone_number),
  public.encrypt_sensitive_field(linkedin_url),
  public.encrypt_sensitive_field(instagram_url),
  public.encrypt_sensitive_field(facebook_url),
  public.encrypt_sensitive_field(twitter_url)
FROM public.dating_profiles
WHERE phone_number IS NOT NULL 
   OR linkedin_url IS NOT NULL 
   OR instagram_url IS NOT NULL 
   OR facebook_url IS NOT NULL 
   OR twitter_url IS NOT NULL
ON CONFLICT (dating_profile_id) DO NOTHING;

-- STEP 11: Create triggers for timestamps
CREATE TRIGGER update_admin_mfa_status_updated_at
  BEFORE UPDATE ON public.admin_mfa_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dating_profile_sensitive_data_updated_at
  BEFORE UPDATE ON public.dating_profile_sensitive_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- STEP 12: Cleanup functions
CREATE OR REPLACE FUNCTION public.cleanup_expired_mfa_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.admin_mfa_sessions WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.admin_rate_limits WHERE window_start < now() - interval '24 hours';
END;
$$;