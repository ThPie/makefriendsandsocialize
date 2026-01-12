import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string | null;
  limit: number;
}

export function useAdminRateLimit() {
  const [isLimited, setIsLimited] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitResult | null>(null);

  const checkAndIncrement = useCallback(async (endpoint: string): Promise<boolean> => {
    try {
      // First check the rate limit
      const { data: checkData, error: checkError } = await supabase.functions.invoke('admin-rate-limiter', {
        body: { action: 'check', endpoint }
      });

      if (checkError) {
        console.error('Rate limit check failed:', checkError);
        // On error, allow the request (fail-open for admin operations)
        return true;
      }

      setRateLimitInfo(checkData);

      if (!checkData.allowed) {
        setIsLimited(true);
        const resetTime = checkData.resetAt 
          ? new Date(checkData.resetAt).toLocaleTimeString() 
          : 'soon';
        toast.error(`Rate limit exceeded. Try again at ${resetTime}`);
        return false;
      }

      // Increment the counter
      await supabase.functions.invoke('admin-rate-limiter', {
        body: { action: 'increment', endpoint }
      });

      setIsLimited(false);
      return true;
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail-open for admin operations
      return true;
    }
  }, []);

  const checkOnly = useCallback(async (endpoint: string): Promise<RateLimitResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-rate-limiter', {
        body: { action: 'check', endpoint }
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return null;
      }

      setRateLimitInfo(data);
      setIsLimited(!data.allowed);
      return data;
    } catch (error) {
      console.error('Rate limit error:', error);
      return null;
    }
  }, []);

  return {
    checkAndIncrement,
    checkOnly,
    isLimited,
    rateLimitInfo,
  };
}
