-- Fix Issue 1 & 2: OAuth rate limits - Remove public access, service role only
DROP POLICY IF EXISTS "Allow rate limit operations" ON public.oauth_rate_limits;

-- Create restrictive policy - only service role can access (edge functions use service role)
CREATE POLICY "Service role only access"
ON public.oauth_rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- Fix Issue 3: Cache metadata - Remove public read access
DROP POLICY IF EXISTS "Anyone can read cache data" ON public.cache_metadata;

-- Create restrictive policy - only service role can access cache
CREATE POLICY "Service role only cache access"
ON public.cache_metadata
FOR ALL
USING (false)
WITH CHECK (false);