import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OAuthRateLimitInfo {
  allowed: boolean;
  remaining: number;
  requiresCaptcha: boolean;
  resetAt: string | null;
}

interface UseOAuthRateLimitResult {
  checkRateLimit: () => Promise<OAuthRateLimitInfo>;
  recordAttempt: (isFailure?: boolean) => Promise<OAuthRateLimitInfo>;
  rateLimitInfo: OAuthRateLimitInfo | null;
  isRateLimited: boolean;
  requiresCaptcha: boolean;
  error: string | null;
}

const DEFAULT_RATE_LIMIT_INFO: OAuthRateLimitInfo = {
  allowed: true,
  remaining: 10,
  requiresCaptcha: false,
  resetAt: null,
};

export function useOAuthRateLimit(): UseOAuthRateLimitResult {
  const [rateLimitInfo, setRateLimitInfo] = useState<OAuthRateLimitInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkRateLimit = useCallback(async (): Promise<OAuthRateLimitInfo> => {
    try {
      setError(null);
      
      const { data, error: invokeError } = await supabase.functions.invoke('oauth-rate-limiter', {
        body: { action: 'check' },
      });

      if (invokeError) {
        console.error('OAuth rate limit check error:', invokeError);
        return DEFAULT_RATE_LIMIT_INFO;
      }

      const info: OAuthRateLimitInfo = {
        allowed: data?.allowed ?? true,
        remaining: data?.remaining ?? 10,
        requiresCaptcha: data?.requiresCaptcha ?? false,
        resetAt: data?.resetAt ?? null,
      };

      setRateLimitInfo(info);
      return info;
    } catch (err) {
      console.error('OAuth rate limit check failed:', err);
      return DEFAULT_RATE_LIMIT_INFO;
    }
  }, []);

  const recordAttempt = useCallback(async (isFailure: boolean = false): Promise<OAuthRateLimitInfo> => {
    try {
      setError(null);
      
      const { data, error: invokeError } = await supabase.functions.invoke('oauth-rate-limiter', {
        body: { action: 'increment', isFailure },
      });

      if (invokeError) {
        console.error('OAuth rate limit increment error:', invokeError);
        return DEFAULT_RATE_LIMIT_INFO;
      }

      const info: OAuthRateLimitInfo = {
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
      console.error('OAuth rate limit increment failed:', err);
      return DEFAULT_RATE_LIMIT_INFO;
    }
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
    rateLimitInfo,
    isRateLimited: rateLimitInfo?.allowed === false,
    requiresCaptcha: rateLimitInfo?.requiresCaptcha ?? false,
    error,
  };
}
