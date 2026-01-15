-- Fix security warnings: search_path for functions and overly permissive cache RLS

-- Fix calculate_reading_time function with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_reading_time(_content text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  word_count integer;
BEGIN
  IF _content IS NULL OR _content = '' THEN
    RETURN 1;
  END IF;
  word_count := array_length(regexp_split_to_array(trim(_content), E'\\s+'), 1);
  RETURN GREATEST(1, CEIL(word_count::float / 200));
END;
$$;

-- Fix update_reading_time trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.update_reading_time()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.reading_time_minutes := public.calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$;

-- Fix overly permissive cache_metadata RLS policy
-- Drop the too-permissive policy
DROP POLICY IF EXISTS "Edge functions can manage cache" ON public.cache_metadata;

-- Create more restrictive policies for cache_metadata
-- Cache data should only be managed by service role (edge functions use service role)
-- and admin users for manual cache invalidation
CREATE POLICY "Anyone can read cache data"
ON public.cache_metadata FOR SELECT
USING (true);

CREATE POLICY "Admins can manage cache"
ON public.cache_metadata FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));