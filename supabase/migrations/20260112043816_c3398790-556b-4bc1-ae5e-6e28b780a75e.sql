-- STEP 1: Create all tables first

-- 1. Admin MFA status tracking table
CREATE TABLE public.admin_mfa_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  mfa_enabled boolean DEFAULT false,
  totp_secret_encrypted text,
  mfa_required_since timestamp with time zone DEFAULT now(),
  last_mfa_verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Admin MFA sessions table
CREATE TABLE public.admin_mfa_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  verified_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '2 hours'),
  session_token uuid DEFAULT gen_random_uuid() UNIQUE,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Admin rate limits table
CREATE TABLE public.admin_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(admin_user_id, endpoint, window_start)
);

-- 4. Encrypted sensitive data table for dating profiles
CREATE TABLE public.dating_profile_sensitive_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dating_profile_id uuid NOT NULL UNIQUE REFERENCES public.dating_profiles(id) ON DELETE CASCADE,
  phone_number_encrypted text,
  linkedin_url_encrypted text,
  instagram_url_encrypted text,
  facebook_url_encrypted text,
  twitter_url_encrypted text,
  encryption_key_id text DEFAULT 'v1',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- STEP 2: Enable RLS on all tables
ALTER TABLE public.admin_mfa_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_mfa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_profile_sensitive_data ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create RLS policies for admin_mfa_status
CREATE POLICY "Admins can view their own MFA status"
  ON public.admin_mfa_status FOR SELECT
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update their own MFA status"
  ON public.admin_mfa_status FOR UPDATE
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert their own MFA status"
  ON public.admin_mfa_status FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- STEP 4: RLS policies for admin_mfa_sessions
CREATE POLICY "Admins can view their own MFA sessions"
  ON public.admin_mfa_sessions FOR SELECT
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert their own MFA sessions"
  ON public.admin_mfa_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete their own MFA sessions"
  ON public.admin_mfa_sessions FOR DELETE
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- STEP 5: RLS policies for admin_rate_limits
CREATE POLICY "Admins can view their own rate limits"
  ON public.admin_rate_limits FOR SELECT
  USING (auth.uid() = admin_user_id AND public.has_role(auth.uid(), 'admin'));

-- STEP 6: RLS policies for dating_profile_sensitive_data
CREATE POLICY "Users can view their own sensitive data"
  ON public.dating_profile_sensitive_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dating_profiles dp 
      WHERE dp.id = dating_profile_id AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sensitive data"
  ON public.dating_profile_sensitive_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dating_profiles dp 
      WHERE dp.id = dating_profile_id AND dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sensitive data"
  ON public.dating_profile_sensitive_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.dating_profiles dp 
      WHERE dp.id = dating_profile_id AND dp.user_id = auth.uid()
    )
  );