-- Create IP-based rate limiting table for all edge functions
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(ip_address, endpoint, window_start)
);

-- Enable RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (edge functions use service role)
CREATE POLICY "Service role only" ON public.api_rate_limits
  FOR ALL USING (false);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_lookup 
  ON public.api_rate_limits (ip_address, endpoint, window_start);

-- Create index for cleanup
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_cleanup 
  ON public.api_rate_limits (window_start);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  _ip_address text,
  _endpoint text,
  _max_requests integer DEFAULT 100,
  _window_minutes integer DEFAULT 15
)
RETURNS TABLE(allowed boolean, remaining_requests integer, reset_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window_start timestamp with time zone;
  current_count integer;
  window_reset timestamp with time zone;
BEGIN
  -- Calculate current window start (aligned to the window)
  current_window_start := date_trunc('minute', now() - ((_window_minutes - 1) * interval '1 minute'));
  window_reset := current_window_start + (_window_minutes * interval '1 minute');
  
  -- Get current count within the window
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM public.api_rate_limits
  WHERE ip_address = _ip_address
    AND endpoint = _endpoint
    AND window_start >= current_window_start;
  
  allowed := current_count < _max_requests;
  remaining_requests := GREATEST(0, _max_requests - current_count);
  reset_at := window_reset;
  
  RETURN NEXT;
END;
$$;

-- Function to increment rate limit counter
CREATE OR REPLACE FUNCTION public.increment_api_rate_limit(
  _ip_address text,
  _endpoint text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_minute timestamp with time zone;
BEGIN
  current_minute := date_trunc('minute', now());
  
  INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (_ip_address, _endpoint, 1, current_minute)
  ON CONFLICT (ip_address, endpoint, window_start)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1;
END;
$$;

-- Function to cleanup old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_api_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.api_rate_limits 
  WHERE window_start < now() - interval '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;