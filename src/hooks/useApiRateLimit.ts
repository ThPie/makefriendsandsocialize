import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetAt: string | null;
  limit: number;
}

interface UseApiRateLimitResult {
  checkRateLimit: (endpoint: string) => Promise<boolean>;
  rateLimitInfo: RateLimitInfo | null;
  isRateLimited: boolean;
  error: string | null;
}

/**
 * Hook for checking API rate limits before making requests
 * Prevents DDoS by limiting to 100 requests per 15 minutes per IP
 */
export function useApiRateLimit(): UseApiRateLimitResult {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRateLimit = useCallback(async (endpoint: string): Promise<boolean> => {
    try {
      setError(null);
      
      const { data, error: invokeError } = await supabase.functions.invoke('api-rate-limiter', {
        body: { endpoint, action: 'check_and_increment' }
      });

      if (invokeError) {
        console.error('Rate limit check error:', invokeError);
        // On error, allow the request to prevent blocking legitimate users
        return true;
      }

      const info: RateLimitInfo = {
        allowed: data.allowed ?? true,
        remaining: data.remaining ?? 100,
        resetAt: data.resetAt ?? null,
        limit: data.limit ?? 100
      };

      setRateLimitInfo(info);
      setIsRateLimited(!info.allowed);

      if (!info.allowed) {
        const resetTime = info.resetAt ? new Date(info.resetAt).toLocaleTimeString() : 'soon';
        setError(`Rate limit exceeded. Please try again after ${resetTime}.`);
      }

      return info.allowed;
    } catch (err) {
      console.error('Rate limit check failed:', err);
      // On error, allow the request
      return true;
    }
  }, []);

  return {
    checkRateLimit,
    rateLimitInfo,
    isRateLimited,
    error
  };
}
