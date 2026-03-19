import { useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Bridge interface for native Home Screen Widgets.
 * The native side must register a Capacitor plugin called "AppWidgets".
 * See docs/NATIVE_WIDGETS.md for Swift (WidgetKit) and Kotlin (Glance) implementation.
 */
interface AppWidgetsPlugin {
  /** Update shared data that widgets can read via App Groups (iOS) or SharedPreferences (Android) */
  updateWidgetData(options: { data: string }): Promise<void>;
  /** Force all widgets to reload */
  reloadAllWidgets(): Promise<void>;
}

const AppWidgets = registerPlugin<AppWidgetsPlugin>('AppWidgets');

export interface WidgetData {
  nextEvent: {
    title: string;
    date: string;
    time: string | null;
    daysUntil: number;
  } | null;
  unreadCount: number;
  dailyQuote: string | null;
  memberSince: string | null;
}

/**
 * Hook to push data to native Home Screen Widgets.
 * Widgets read from a shared data store (App Groups on iOS, SharedPreferences on Android).
 * This hook writes data that the widgets display.
 */
export function useHomeWidgets() {
  const { user } = useAuth();
  const isNative = Capacitor.isNativePlatform();

  /**
   * Refresh widget data from the latest app state.
   * Call after key actions: login, RSVP, new notification, etc.
   */
  const refreshWidgets = useCallback(async () => {
    if (!isNative || !user) return;

    try {
      // Fetch next upcoming event
      const { data: events } = await supabase
        .from('events')
        .select('title, date, time')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(1);

      // Fetch unread notification count
      const { count } = await supabase
        .from('notification_queue')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      // Fetch daily quote
      const today = new Date().toISOString().split('T')[0];
      const { data: quote } = await supabase
        .from('daily_quotes')
        .select('quote_text')
        .eq('quote_date', today)
        .maybeSingle();

      // Fetch profile for member since
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      const nextEvent = events?.[0];
      const widgetData: WidgetData = {
        nextEvent: nextEvent
          ? {
              title: nextEvent.title,
              date: nextEvent.date,
              time: nextEvent.time,
              daysUntil: Math.ceil(
                (new Date(nextEvent.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              ),
            }
          : null,
        unreadCount: count || 0,
        dailyQuote: quote?.quote_text || null,
        memberSince: profile?.created_at
          ? new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })
          : null,
      };

      await AppWidgets.updateWidgetData({ data: JSON.stringify(widgetData) });
      await AppWidgets.reloadAllWidgets();
    } catch (error) {
      console.error('[Widgets] Failed to refresh:', error);
    }
  }, [isNative, user]);

  return {
    isSupported: isNative,
    refreshWidgets,
  };
}
