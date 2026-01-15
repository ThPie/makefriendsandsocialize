import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheConfig {
  key: string;
  ttlSeconds: number;
  fetcher: () => Promise<any>;
}

// In-memory cache for client-side caching
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

export function useCachedData<T>({ key, ttlSeconds, fetcher }: CacheConfig) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithCache = useCallback(async () => {
    try {
      // Check memory cache first (fastest)
      const memoryCached = memoryCache.get(key);
      if (memoryCached && memoryCached.expiresAt > Date.now()) {
        setData(memoryCached.data);
        setIsLoading(false);
        return;
      }

      // Check database cache
      const { data: cachedData } = await supabase.rpc('get_cached_data', {
        _cache_key: key
      });

      if (cachedData) {
        // Update memory cache
        memoryCache.set(key, {
          data: cachedData,
          expiresAt: Date.now() + (ttlSeconds * 1000)
        });
        setData(cachedData as T);
        setIsLoading(false);
        return;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      
      // Update memory cache
      memoryCache.set(key, {
        data: freshData,
        expiresAt: Date.now() + (ttlSeconds * 1000)
      });

      // Note: Database cache is managed by edge functions for consistency
      setData(freshData);
    } catch (err) {
      console.error('Cache fetch error:', err);
      setError(err as Error);
      
      // Fallback to fetcher on cache error
      try {
        const freshData = await fetcher();
        setData(freshData);
      } catch (fetchErr) {
        console.error('Fetcher error:', fetchErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, ttlSeconds, fetcher]);

  useEffect(() => {
    fetchWithCache();
  }, [fetchWithCache]);

  const invalidate = useCallback(() => {
    memoryCache.delete(key);
    fetchWithCache();
  }, [key, fetchWithCache]);

  return { data, isLoading, error, invalidate };
}

// Cache TTL configurations for different data types
export const CACHE_CONFIG = {
  HOMEPAGE_STATS: { ttl: 15 * 60 }, // 15 minutes
  EVENT_LISTINGS: { ttl: 5 * 60 },  // 5 minutes
  BLOG_POSTS: { ttl: 60 * 60 },     // 1 hour
  BUSINESS_DIRECTORY: { ttl: 10 * 60 }, // 10 minutes
};

// Utility to clear all memory cache
export const clearAllCache = () => {
  memoryCache.clear();
};
