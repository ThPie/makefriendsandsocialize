import { useCallback, useEffect, useRef } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cacheSet, cacheGet } from '@/lib/offline-cache';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/** Cache keys used across the app */
export const CACHE_KEYS = {
  EVENTS: 'offline:events',
  PROFILE: (userId: string) => `offline:profile:${userId}`,
  MATCHES: (userId: string) => `offline:matches:${userId}`,
  NOTIFICATIONS: (userId: string) => `offline:notifications:${userId}`,
  CONNECTIONS: (userId: string) => `offline:connections:${userId}`,
  DASHBOARD_STATS: (userId: string) => `offline:dashboard:${userId}`,
} as const;

/** TTLs in seconds */
const TTL = {
  EVENTS: 1800,       // 30 minutes
  PROFILE: 3600,      // 1 hour
  MATCHES: 900,       // 15 minutes
  NOTIFICATIONS: 300, // 5 minutes
  CONNECTIONS: 1800,  // 30 minutes
  DASHBOARD: 600,     // 10 minutes
};

/**
 * Offline-aware data hook.
 * - When online: fetches from Supabase, caches locally
 * - When offline: serves cached data
 * - On reconnect: syncs fresh data automatically
 */
export function useOfflineSync() {
  const { user } = useAuth();
  const { isOnline, wasOffline } = useNetworkStatus();
  const syncInProgress = useRef(false);

  /**
   * Fetch with offline fallback.
   * Tries network first, falls back to cache if offline.
   */
  const fetchWithCache = useCallback(
    async <T>(
      cacheKey: string,
      fetcher: () => Promise<T>,
      ttl: number,
    ): Promise<{ data: T | null; fromCache: boolean }> => {
      // Online — fetch fresh, cache result
      if (isOnline) {
        try {
          const data = await fetcher();
          await cacheSet(cacheKey, data, ttl);
          return { data, fromCache: false };
        } catch (error) {
          // Network error despite being "online" — try cache
          console.warn('[OfflineSync] Fetch failed, trying cache:', error);
          const cached = await cacheGet<T>(cacheKey);
          return { data: cached, fromCache: true };
        }
      }

      // Offline — serve from cache
      const cached = await cacheGet<T>(cacheKey);
      return { data: cached, fromCache: true };
    },
    [isOnline],
  );

  /**
   * Pre-built fetchers for common data.
   */
  const fetchEvents = useCallback(
    () =>
      fetchWithCache(CACHE_KEYS.EVENTS, async () => {
        const { data } = await supabase
          .from('events')
          .select('*')
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(50);
        return data || [];
      }, TTL.EVENTS),
    [fetchWithCache],
  );

  const fetchProfile = useCallback(
    () => {
      if (!user) return Promise.resolve({ data: null, fromCache: false });
      return fetchWithCache(CACHE_KEYS.PROFILE(user.id), async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        return data;
      }, TTL.PROFILE);
    },
    [user, fetchWithCache],
  );

  const fetchNotifications = useCallback(
    () => {
      if (!user) return Promise.resolve({ data: null, fromCache: false });
      return fetchWithCache(CACHE_KEYS.NOTIFICATIONS(user.id), async () => {
        const { data } = await supabase
          .from('notification_queue')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(50);
        return data || [];
      }, TTL.NOTIFICATIONS);
    },
    [user, fetchWithCache],
  );

  const fetchConnections = useCallback(
    () => {
      if (!user) return Promise.resolve({ data: null, fromCache: false });
      return fetchWithCache(CACHE_KEYS.CONNECTIONS(user.id), async () => {
        const { data } = await supabase
          .from('connections')
          .select('*')
          .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
          .eq('status', 'accepted')
          .limit(100);
        return data || [];
      }, TTL.CONNECTIONS);
    },
    [user, fetchWithCache],
  );

  /**
   * Sync all data when coming back online.
   */
  const syncAll = useCallback(async () => {
    if (!user || syncInProgress.current) return;
    syncInProgress.current = true;

    if (import.meta.env.DEV) console.log('[OfflineSync] Syncing all data…');

    try {
      await Promise.allSettled([
        fetchEvents(),
        fetchProfile(),
        fetchNotifications(),
        fetchConnections(),
      ]);
    } finally {
      syncInProgress.current = false;
    }
  }, [user, fetchEvents, fetchProfile, fetchNotifications, fetchConnections]);

  // Auto-sync when reconnecting
  useEffect(() => {
    if (isOnline && wasOffline && user) {
      syncAll();
    }
  }, [isOnline, wasOffline, user, syncAll]);

  return {
    isOnline,
    fetchWithCache,
    fetchEvents,
    fetchProfile,
    fetchNotifications,
    fetchConnections,
    syncAll,
  };
}
