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
      
      const { data, error: invokeError } = await supabase.functions.invoke('oauth-rate-limiter', {
        body: { action: 'increment', isFailure },
      });

      if (invokeError) {
        console.error('Auth rate limit increment error:', invokeError);
        return DEFAULT_RATE_LIMIT_INFO;
      }

      const info: AuthRateLimitInfo = {
        allowed: data?.allowed ?? true,
        remaining: data?.remaining ?? 9,
        requiresCaptcha: data?.requiresCaptcha ?? false,
        resetAt: data?.resetAt ?? null,
      };

      setRateLimitInfo(info);

      if (!info.allowed) {
        const resetTime = info.resetAt ? new Date(info.resetAt).toLocaleTimeString() : 'soon';
        setError(`Too many sign-in attempts. Please try again after ${resetTime}.`);
      }

      return info;
    } catch (err) {
      console.error('Auth rate limit increment failed:', err);
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
