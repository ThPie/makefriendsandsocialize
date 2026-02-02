-- Create business_synergy_matches table
CREATE TABLE IF NOT EXISTS public.business_synergy_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_a_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  business_b_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  synergy_type text NOT NULL,
  collaboration_hooks text[] DEFAULT '{}',
  ai_analysis text,
  status text NOT NULL DEFAULT 'suggested',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  -- Ensure unique pairs to prevent duplicate entries
  CONSTRAINT unique_business_pair UNIQUE (business_a_id, business_b_id),
  -- Prevent businesses from matching with themselves
  CONSTRAINT different_businesses CHECK (business_a_id != business_b_id)
);

-- Enable RLS
ALTER TABLE public.business_synergy_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Businesses can view matches they are part of
CREATE POLICY "Businesses can view their own synergy matches"
ON public.business_synergy_matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_profiles
    WHERE (id = business_a_id OR id = business_b_id)
    AND user_id = auth.uid()
  )
);

-- Policy: Admins can manage all synergy matches
CREATE POLICY "Admins can manage all synergy matches"
ON public.business_synergy_matches
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_business_synergy_matches_updated_at
BEFORE UPDATE ON public.business_synergy_matches
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_synergy_business_a ON public.business_synergy_matches(business_a_id);
CREATE INDEX IF NOT EXISTS idx_synergy_business_b ON public.business_synergy_matches(business_b_id);
CREATE INDEX IF NOT EXISTS idx_synergy_score ON public.business_synergy_matches(score DESC);
