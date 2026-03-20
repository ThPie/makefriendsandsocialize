import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Updates the app icon badge count with unread notifications.
 * Uses the Web Badge API (PWA) and listens for real-time changes.
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

    // Fetch initial unread count
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

    // Listen for real-time notification changes (shares channel name with NotificationBell)
    const channel = supabase
      .channel('notification_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_queue',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      // Clear badge on unmount
      if ('clearAppBadge' in navigator) {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    };
  }, [user]);
}
