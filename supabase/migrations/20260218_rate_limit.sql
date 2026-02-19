-- Migration: Server-Side Rate Limiting
-- Created: 2026-02-18
-- Purpose: Replace client-side rate limiting with a robust database-backed solution.

-- 1. Create a table to track rate limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL, -- composite key: "prefix:identifier" (e.g., "auth_attempt:127.0.0.1")
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    count INTEGER DEFAULT 1,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);

-- Enable RLS (Service Role only)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 2. Create the RPC function to check and increment rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key_prefix text,
    p_identifier text DEFAULT NULL,
    p_max_requests int DEFAULT 5,
    p_window_seconds int DEFAULT 60,
    p_block_duration_seconds int DEFAULT 300
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_identifier text;
    v_key text;
    v_record record;
    v_now timestamp with time zone := now();
    v_headers json;
    v_reset_at timestamp with time zone;
BEGIN
    -- Determine identifier: use provided one, or fall back to IP from headers
    IF p_identifier IS NOT NULL THEN
        v_identifier := p_identifier;
    ELSE
        -- Attempt to get IP from request headers (Supabase injects this)
        BEGIN
            v_headers := current_setting('request.headers', true)::json;
            v_identifier := v_headers->>'x-forwarded-for';
        EXCEPTION WHEN OTHERS THEN
            v_identifier := NULL;
        END;

        -- Fallback if no IP found (should rare in real Http context)
        IF v_identifier IS NULL THEN
             v_identifier := 'unknown';
        END IF;
    END IF;

    v_key := p_key_prefix || ':' || v_identifier;

    -- Clean up old records for this key (optional optimization)
    DELETE FROM public.rate_limits 
    WHERE key = v_key AND window_start < (v_now - (p_window_seconds || ' seconds')::interval);

    -- Get existing record or insert new one
    SELECT * INTO v_record FROM public.rate_limits WHERE key = v_key;

    IF v_record IS NULL THEN
        INSERT INTO public.rate_limits (key, window_start, count)
        VALUES (v_key, v_now, 1)
        RETURNING * INTO v_record;
    ELSE
        -- Check if currently blocked
        IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
            RETURN json_build_object(
                'allowed', false,
                'remaining', 0,
                'reset_at', v_record.blocked_until
            );
        END IF;

        -- If window expired, reset
        IF v_record.window_start < (v_now - (p_window_seconds || ' seconds')::interval) THEN
             UPDATE public.rate_limits
             SET window_start = v_now, count = 1, blocked_until = NULL
             WHERE id = v_record.id
             RETURNING * INTO v_record;
        ELSE
             -- Increment count
             UPDATE public.rate_limits
             SET count = count + 1
             WHERE id = v_record.id
             RETURNING * INTO v_record;
        END IF;
    END IF;

    -- Check if limit exceeded
    IF v_record.count > p_max_requests THEN
        -- Block the user
        v_reset_at := v_now + (p_block_duration_seconds || ' seconds')::interval;
        
        UPDATE public.rate_limits
        SET blocked_until = v_reset_at
        WHERE id = v_record.id;

        RETURN json_build_object(
            'allowed', false,
            'remaining', 0,
            'reset_at', v_reset_at
        );
    ELSE
        RETURN json_build_object(
            'allowed', true,
            'remaining', p_max_requests - v_record.count,
            'reset_at', v_record.window_start + (p_window_seconds || ' seconds')::interval
        );
    END IF;
END;
$$;
