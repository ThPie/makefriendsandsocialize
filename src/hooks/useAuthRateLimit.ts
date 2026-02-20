import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthRateLimitInfo {
  allowed: boolean;
  remaining: number;
  requiresCaptcha: boolean;
  resetAt: string | null;
}

interface UseAuthRateLimitResult {
  recordAttempt: (isFailure?: boolean) => Promise<AuthRateLimitInfo>;
  rateLimitInfo: AuthRateLimitInfo | null;
  isRateLimited: boolean;
  requiresCaptcha: boolean;
  error: string | null;
}

const DEFAULT_RATE_LIMIT_INFO: AuthRateLimitInfo = {
  allowed: true,
  remaining: 10,
  requiresCaptcha: false,
  resetAt: null,
};

export function useAuthRateLimit(): UseAuthRateLimitResult {
  const [rateLimitInfo, setRateLimitInfo] = useState<AuthRateLimitInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recordAttempt = useCallback(async (isFailure: boolean = false): Promise<AuthRateLimitInfo> => {
    try {
      setError(null);

      // Only increment on failure or if we want to track all attempts (usually auth limits failures)
      // But for security, we might want to rate limit *attempts* regardless of success to prevent enumeration?
      // The previous code passed `isFailure`.
      // Let's assume we want to limit ATTEMPTS.

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase.rpc as any)('check_rate_limit', {
        p_key_prefix: 'auth_attempt',
        p_max_requests: 5,      // 5 attempts
        p_window_seconds: 60,   // per 60 seconds
        p_block_duration_seconds: 300 // block for 5 minutes
      });

      if (rpcError) {
        console.error('Auth rate limit check error:', rpcError);
        // Fallback to allow if DB check fails, or default to safe?
        // Defaulting to "allowed" avoids locking out users during outages.
        return DEFAULT_RATE_LIMIT_INFO;
      }

      // Supabase RPC returns the JSON directly in `data` (if successful)
      // We need to cast it because the return type of rpc is generic
      const result = data as any;

      const info: AuthRateLimitInfo = {
        allowed: result?.allowed ?? true,
        remaining: result?.remaining ?? 5,
        requiresCaptcha: false, // RPC doesn't handle captcha logic yet
        resetAt: result?.reset_at ?? null,
      };

      setRateLimitInfo(info);

      if (!info.allowed) {
        const resetTime = info.resetAt ? new Date(info.resetAt).toLocaleTimeString() : 'soon';
        setError(`Too many sign-in attempts. Please try again after ${resetTime}.`);
      }

      return info;
    } catch (err) {
      console.error('Auth rate limit check failed:', err);
      return DEFAULT_RATE_LIMIT_INFO;
    }
  }, []);

  return {
    recordAttempt,
    rateLimitInfo,
    isRateLimited: rateLimitInfo?.allowed === false,
    requiresCaptcha: rateLimitInfo?.requiresCaptcha ?? false,
    error,
  };
}
