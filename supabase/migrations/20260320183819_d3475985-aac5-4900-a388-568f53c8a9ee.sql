
-- =============================================
-- PHASE 1: Transaction-cached has_role() and has_active_membership()
-- =============================================

-- Replace has_role() with transaction-cached version
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cache_key text;
  _cached text;
  _result boolean;
BEGIN
  _cache_key := 'app.role_' || _role::text || '_' || replace(_user_id::text, '-', '');
  
  _cached := current_setting(_cache_key, true);
  IF _cached IS NOT NULL AND _cached != '' THEN
    RETURN _cached = 't';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO _result;
  
  PERFORM set_config(_cache_key, _result::text, true);
  
  RETURN _result;
END;
$$;

-- Replace has_active_membership() with transaction-cached version
CREATE OR REPLACE FUNCTION public.has_active_membership(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cache_key text;
  _cached text;
  _result boolean;
BEGIN
  _cache_key := 'app.membership_' || replace(_user_id::text, '-', '');
  
  _cached := current_setting(_cache_key, true);
  IF _cached IS NOT NULL AND _cached != '' THEN
    RETURN _cached = 't';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id AND status = 'active'
  ) INTO _result;
  
  PERFORM set_config(_cache_key, _result::text, true);
  
  RETURN _result;
END;
$$;

-- =============================================
-- PHASE 2: Helper function for dating match participant check
-- =============================================

CREATE OR REPLACE FUNCTION public.is_dating_match_participant(_user_id uuid, _match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.dating_matches dm
    JOIN public.dating_profiles dp ON dp.user_id = _user_id
    WHERE dm.id = _match_id
      AND (dm.user_a_id = dp.id OR dm.user_b_id = dp.id)
  )
$$;

-- Helper to get user's dating profile id (cached per transaction)
CREATE OR REPLACE FUNCTION public.get_user_dating_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cache_key text;
  _cached text;
  _result uuid;
BEGIN
  _cache_key := 'app.dp_' || replace(_user_id::text, '-', '');
  
  _cached := current_setting(_cache_key, true);
  IF _cached IS NOT NULL AND _cached != '' THEN
    RETURN _cached::uuid;
  END IF;
  
  SELECT id INTO _result FROM public.dating_profiles WHERE user_id = _user_id LIMIT 1;
  
  IF _result IS NOT NULL THEN
    PERFORM set_config(_cache_key, _result::text, true);
  END IF;
  
  RETURN _result;
END;
$$;

-- Update dating_matches policies to use cached helper
DROP POLICY IF EXISTS "Users can view matches they're part of" ON public.dating_matches;
CREATE POLICY "Users can view matches they're part of" ON public.dating_matches
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR user_a_id = get_user_dating_profile_id(auth.uid())
  OR user_b_id = get_user_dating_profile_id(auth.uid())
);

DROP POLICY IF EXISTS "Users can update their match responses" ON public.dating_matches;
CREATE POLICY "Users can update their match responses" ON public.dating_matches
FOR UPDATE TO public
USING (
  user_a_id = get_user_dating_profile_id(auth.uid())
  OR user_b_id = get_user_dating_profile_id(auth.uid())
);

-- Drop the now-redundant admin ALL policy (merged into SELECT above)
DROP POLICY IF EXISTS "Admins can manage all matches" ON public.dating_matches;
CREATE POLICY "Admins can manage all matches" ON public.dating_matches
FOR ALL TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update meeting_proposals policies to use helper function
DROP POLICY IF EXISTS "Users can view proposals for their matches" ON public.meeting_proposals;
CREATE POLICY "Users can view proposals for their matches" ON public.meeting_proposals
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_dating_match_participant(auth.uid(), match_id)
);

DROP POLICY IF EXISTS "Users can update proposals for their matches" ON public.meeting_proposals;
CREATE POLICY "Users can update proposals for their matches" ON public.meeting_proposals
FOR UPDATE TO public
USING (is_dating_match_participant(auth.uid(), match_id));

DROP POLICY IF EXISTS "Admins can manage all proposals" ON public.meeting_proposals;
CREATE POLICY "Admins can manage all proposals" ON public.meeting_proposals
FOR ALL TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update dating_profile_sensitive_data to use cached helper
DROP POLICY IF EXISTS "Users can view their own sensitive data" ON public.dating_profile_sensitive_data;
CREATE POLICY "Users can view their own sensitive data" ON public.dating_profile_sensitive_data
FOR SELECT TO public
USING (
  dating_profile_id = get_user_dating_profile_id(auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Users can update their own sensitive data" ON public.dating_profile_sensitive_data;
CREATE POLICY "Users can update their own sensitive data" ON public.dating_profile_sensitive_data
FOR UPDATE TO public
USING (dating_profile_id = get_user_dating_profile_id(auth.uid()));

-- =============================================
-- PHASE 4: Add missing indexes for RLS query patterns
-- =============================================

CREATE INDEX IF NOT EXISTS idx_connections_accepted_pair 
  ON public.connections (requester_id, requested_id) WHERE status = 'accepted';

CREATE INDEX IF NOT EXISTS idx_connections_accepted_pair_rev 
  ON public.connections (requested_id, requester_id) WHERE status = 'accepted';

CREATE INDEX IF NOT EXISTS idx_testimonials_approved 
  ON public.testimonials (is_approved) WHERE is_approved = true;

CREATE INDEX IF NOT EXISTS idx_memberships_user_active 
  ON public.memberships (user_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_roles_user_role 
  ON public.user_roles (user_id, role);

CREATE INDEX IF NOT EXISTS idx_dating_matches_user_a 
  ON public.dating_matches (user_a_id);

CREATE INDEX IF NOT EXISTS idx_dating_matches_user_b 
  ON public.dating_matches (user_b_id);

CREATE INDEX IF NOT EXISTS idx_meeting_proposals_match_id 
  ON public.meeting_proposals (match_id);
