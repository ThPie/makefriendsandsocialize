import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Updates the app icon badge count with unread notifications.
 * Uses polling instead of realtime to reduce CPU overhead.
 */
export function useAppBadge() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updateBadge = async (count: number) => {
      try {
        if ('setAppBadge' in navigator) {
          if (count > 0) {
            await (navigator as any).setAppBadge(count);
          } else {
            await (navigator as any).clearAppBadge();
          }
        }
      } catch {
        // Badge API not supported — silent fail
      }
    };

    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('notification_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error && count !== null) {
        updateBadge(count);
      }
    };

    fetchCount();

    // Poll every 60 seconds instead of realtime channel
    const interval = setInterval(fetchCount, 60_000);

    return () => {
      clearInterval(interval);
      if ('clearAppBadge' in navigator) {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    };
  }, [user]);
}
