import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

/**
 * Bridge interface for native Live Activities (iOS 16.1+).
 * The native side must register a Capacitor plugin called "LiveActivities".
 * See docs/NATIVE_WIDGETS.md for the Swift implementation.
 */
interface LiveActivitiesPlugin {
  startEventCountdown(options: {
    eventId: string;
    title: string;
    date: string;
    time: string | null;
    venue: string | null;
  }): Promise<{ activityId: string }>;

  updateEventCountdown(options: {
    activityId: string;
    status: 'upcoming' | 'live' | 'ended';
    attendeeCount?: number;
  }): Promise<void>;

  endActivity(options: { activityId: string }): Promise<void>;

  startMatchTimer(options: {
    matchId: string;
    partnerName: string;
    expiresAt: string;
  }): Promise<{ activityId: string }>;

  endMatchTimer(options: { activityId: string }): Promise<void>;
}

const LiveActivities = registerPlugin<LiveActivitiesPlugin>('LiveActivities');

/**
 * Hook to manage iOS Live Activities for event countdowns and match timers.
 * No-ops gracefully on Android and web.
 */
export function useLiveActivities() {
  const { user } = useAuth();
  const isSupported = Capacitor.getPlatform() === 'ios';

  const startEventCountdown = useCallback(
    async (event: {
      id: string;
      title: string;
      date: string;
      time: string | null;
      venue_name: string | null;
    }): Promise<string | null> => {
      if (!isSupported) return null;

      try {
        const result = await LiveActivities.startEventCountdown({
          eventId: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          venue: event.venue_name,
        });
        return result.activityId;
      } catch (error) {
        console.error('[LiveActivities] Failed to start countdown:', error);
        return null;
      }
    },
    [isSupported],
  );

  const startMatchTimer = useCallback(
    async (matchId: string, partnerName: string, expiresAt: string): Promise<string | null> => {
      if (!isSupported) return null;

      try {
        const result = await LiveActivities.startMatchTimer({
          matchId,
          partnerName,
          expiresAt,
        });
        return result.activityId;
      } catch (error) {
        console.error('[LiveActivities] Failed to start match timer:', error);
        return null;
      }
    },
    [isSupported],
  );

  const endActivity = useCallback(
    async (activityId: string) => {
      if (!isSupported) return;
      try {
        await LiveActivities.endActivity({ activityId });
      } catch (error) {
        console.error('[LiveActivities] Failed to end activity:', error);
      }
    },
    [isSupported],
  );

  return {
    isSupported,
    startEventCountdown,
    startMatchTimer,
    endActivity,
  };
}
