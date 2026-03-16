-- Create table to cache AI matchmaking results
-- This prevents redundant API calls for profiles that haven't changed
CREATE TABLE IF NOT EXISTS public.match_ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a_id UUID NOT NULL REFERENCES public.dating_profiles(id) ON DELETE CASCADE,
  profile_b_id UUID NOT NULL REFERENCES public.dating_profiles(id) ON DELETE CASCADE,
  
  -- Cached AI results
  ai_score INTEGER NOT NULL,
  ai_gottman_score INTEGER,
  ai_confidence INTEGER,
  ai_dimensions JSONB,
  ai_reason TEXT,
  
  -- Metadata for cache invalidation
  profile_a_updated_at TIMESTAMPTZ NOT NULL,
  profile_b_updated_at TIMESTAMPTZ NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(profile_a_id, profile_b_id)
);

-- Enable RLS
ALTER TABLE public.match_ai_cache ENABLE ROW LEVEL SECURITY;

-- RLS policy: Service role can manage cache
CREATE POLICY "Service role can manage AI cache"
  ON public.match_ai_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_ai_cache_profile_a 
  ON public.match_ai_cache(profile_a_id);

CREATE INDEX IF NOT EXISTS idx_match_ai_cache_profile_b 
  ON public.match_ai_cache(profile_b_id);

CREATE INDEX IF NOT EXISTS idx_match_ai_cache_timestamp 
  ON public.match_ai_cache(cached_at);

-- Create function to check if cached result is still valid
CREATE OR REPLACE FUNCTION public.get_cached_match_score(
  p_profile_a_id UUID,
  p_profile_b_id UUID,
  p_profile_a_updated_at TIMESTAMPTZ,
  p_profile_b_updated_at TIMESTAMPTZ
)
RETURNS TABLE(
  ai_score INTEGER,
  ai_gottman_score INTEGER,
  ai_confidence INTEGER,
  ai_dimensions JSONB,
  ai_reason TEXT,
  is_valid BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    cache.ai_score,
    cache.ai_gottman_score,
    cache.ai_confidence,
    cache.ai_dimensions,
    cache.ai_reason,
    -- Cache is valid if both profiles haven't been updated since caching
    (cache.profile_a_updated_at >= p_profile_a_updated_at 
     AND cache.profile_b_updated_at >= p_profile_b_updated_at)::BOOLEAN as is_valid
  FROM public.match_ai_cache cache
  WHERE (cache.profile_a_id = p_profile_a_id AND cache.profile_b_id = p_profile_b_id)
     OR (cache.profile_a_id = p_profile_b_id AND cache.profile_b_id = p_profile_a_id)
  LIMIT 1;
$$;

-- Create function to store AI cache result
CREATE OR REPLACE FUNCTION public.cache_match_score(
  p_profile_a_id UUID,
  p_profile_b_id UUID,
  p_ai_score INTEGER,
  p_ai_gottman_score INTEGER,
  p_ai_confidence INTEGER,
  p_ai_dimensions JSONB,
  p_ai_reason TEXT,
  p_profile_a_updated_at TIMESTAMPTZ,
  p_profile_b_updated_at TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cache_id UUID;
BEGIN
  INSERT INTO public.match_ai_cache (
    profile_a_id,
    profile_b_id,
    ai_score,
    ai_gottman_score,
    ai_confidence,
    ai_dimensions,
    ai_reason,
    profile_a_updated_at,
    profile_b_updated_at
  ) VALUES (
    p_profile_a_id,
    p_profile_b_id,
    p_ai_score,
    p_ai_gottman_score,
    p_ai_confidence,
    p_ai_dimensions,
    p_ai_reason,
    p_profile_a_updated_at,
    p_profile_b_updated_at
  )
  ON CONFLICT (profile_a_id, profile_b_id) DO UPDATE SET
    ai_score = EXCLUDED.ai_score,
    ai_gottman_score = EXCLUDED.ai_gottman_score,
    ai_confidence = EXCLUDED.ai_confidence,
    ai_dimensions = EXCLUDED.ai_dimensions,
    ai_reason = EXCLUDED.ai_reason,
    profile_a_updated_at = EXCLUDED.profile_a_updated_at,
    profile_b_updated_at = EXCLUDED.profile_b_updated_at,
    cached_at = now()
  RETURNING id INTO cache_id;
  
  RETURN cache_id;
END;
$$;

-- Create table to track AI API calls for rate limiting and monitoring
CREATE TABLE IF NOT EXISTS public.ai_api_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.dating_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.dating_profiles(id) ON DELETE CASCADE,
  
  -- API call metadata
  model_used TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  tokens_used INTEGER,
  response_time_ms INTEGER,
  
  -- Result
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_api_calls ENABLE ROW LEVEL SECURITY;

-- RLS policy: Service role can manage API calls
CREATE POLICY "Service role can manage AI API calls"
  ON public.ai_api_calls
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for monitoring
CREATE INDEX IF NOT EXISTS idx_ai_api_calls_profile 
  ON public.ai_api_calls(profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_api_calls_success 
  ON public.ai_api_calls(success, created_at DESC);
