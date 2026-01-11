-- =====================================================
-- PHASE 1: DATABASE SCHEMA FOR PRICING & MONETIZATION
-- =====================================================

-- 1.1 Add 'explorer' to membership_tier enum (keeping existing for backward compatibility)
-- Note: We'll map patron -> explorer, fellow -> member, founder -> fellow in application code
-- The enum already has patron, fellow, founder - we'll use patron as the free tier

-- 1.2 Create match_reveal_purchases table for tracking pay-per-reveal
CREATE TABLE IF NOT EXISTS public.match_reveal_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('single', 'pack_3')),
  reveals_total INTEGER NOT NULL DEFAULT 1,
  reveals_used INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '90 days'),
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on match_reveal_purchases
ALTER TABLE public.match_reveal_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for match_reveal_purchases
CREATE POLICY "Users can view their own reveal purchases"
  ON public.match_reveal_purchases
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage reveal purchases"
  ON public.match_reveal_purchases
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 1.3 Create match_reveals table to track which matches have been revealed
CREATE TABLE IF NOT EXISTS public.match_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID NOT NULL REFERENCES public.dating_matches(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.match_reveal_purchases(id),
  revealed_via TEXT NOT NULL CHECK (revealed_via IN ('purchase', 'membership', 'admin')),
  revealed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Enable RLS on match_reveals
ALTER TABLE public.match_reveals ENABLE ROW LEVEL SECURITY;

-- RLS policies for match_reveals
CREATE POLICY "Users can view their own reveals"
  ON public.match_reveals
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage reveals"
  ON public.match_reveals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 1.4 Create membership_trials table for 7-day trials
CREATE TABLE IF NOT EXISTS public.membership_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('member', 'fellow')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  converted_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on membership_trials
ALTER TABLE public.membership_trials ENABLE ROW LEVEL SECURITY;

-- RLS policies for membership_trials
CREATE POLICY "Users can view their own trials"
  ON public.membership_trials
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage trials"
  ON public.membership_trials
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage trials"
  ON public.membership_trials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 1.5 Add guest tracking columns to event_rsvps
ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guest_names TEXT[] DEFAULT '{}';

-- 1.6 Create business_verification_reports table for AI verification
CREATE TABLE IF NOT EXISTS public.business_verification_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'needs_review')),
  verification_score INTEGER CHECK (verification_score >= 0 AND verification_score <= 100),
  findings JSONB DEFAULT '{}',
  red_flags TEXT[] DEFAULT '{}',
  positive_signals TEXT[] DEFAULT '{}',
  ai_recommendation TEXT CHECK (ai_recommendation IN ('approve', 'investigate', 'reject')),
  sources_checked TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  UNIQUE(business_id)
);

-- Enable RLS on business_verification_reports
ALTER TABLE public.business_verification_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_verification_reports
CREATE POLICY "Admins can manage verification reports"
  ON public.business_verification_reports
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Business owners can view their verification report"
  ON public.business_verification_reports
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    )
  );

-- 1.7 Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_reveal_purchases_user_expires 
  ON public.match_reveal_purchases(user_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_match_reveals_user_match 
  ON public.match_reveals(user_id, match_id);

CREATE INDEX IF NOT EXISTS idx_membership_trials_user_ends 
  ON public.membership_trials(user_id, ends_at);

-- 1.8 Create function to check if user can reveal matches (has membership or credits)
CREATE OR REPLACE FUNCTION public.can_reveal_match(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    -- Check for active paid membership (fellow or founder tier which map to member/fellow)
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id
      AND status = 'active'
      AND tier IN ('fellow', 'founder')
  )
  OR EXISTS (
    -- Check for active trial
    SELECT 1 FROM public.membership_trials
    WHERE user_id = _user_id
      AND ends_at > now()
      AND converted_at IS NULL
  )
  OR EXISTS (
    -- Check for available reveal credits
    SELECT 1 FROM public.match_reveal_purchases
    WHERE user_id = _user_id
      AND expires_at > now()
      AND reveals_used < reveals_total
  )
$$;

-- 1.9 Create function to get available reveal credits
CREATE OR REPLACE FUNCTION public.get_available_reveals(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(reveals_total - reveals_used), 0)::integer
  FROM public.match_reveal_purchases
  WHERE user_id = _user_id
    AND expires_at > now()
    AND reveals_used < reveals_total
$$;

-- 1.10 Create function to use a reveal credit
CREATE OR REPLACE FUNCTION public.use_reveal_credit(_user_id uuid, _match_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  purchase_record RECORD;
BEGIN
  -- First check if already revealed
  IF EXISTS (SELECT 1 FROM public.match_reveals WHERE user_id = _user_id AND match_id = _match_id) THEN
    RETURN true; -- Already revealed
  END IF;
  
  -- Check if user has paid membership
  IF EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id AND status = 'active' AND tier IN ('fellow', 'founder')
  ) OR EXISTS (
    SELECT 1 FROM public.membership_trials
    WHERE user_id = _user_id AND ends_at > now() AND converted_at IS NULL
  ) THEN
    -- Insert reveal record for membership
    INSERT INTO public.match_reveals (user_id, match_id, revealed_via)
    VALUES (_user_id, _match_id, 'membership');
    RETURN true;
  END IF;
  
  -- Find oldest non-expired purchase with available credits
  SELECT * INTO purchase_record
  FROM public.match_reveal_purchases
  WHERE user_id = _user_id
    AND expires_at > now()
    AND reveals_used < reveals_total
  ORDER BY expires_at ASC
  LIMIT 1
  FOR UPDATE;
  
  IF purchase_record.id IS NULL THEN
    RETURN false; -- No credits available
  END IF;
  
  -- Use the credit
  UPDATE public.match_reveal_purchases
  SET reveals_used = reveals_used + 1
  WHERE id = purchase_record.id;
  
  -- Insert reveal record
  INSERT INTO public.match_reveals (user_id, match_id, purchase_id, revealed_via)
  VALUES (_user_id, _match_id, purchase_record.id, 'purchase');
  
  RETURN true;
END;
$$;