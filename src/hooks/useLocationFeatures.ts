import { useCallback } from 'react';
import { useNativeGeolocation, formatDistance } from '@/hooks/useNativeGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NearbyEvent {
  id: string;
  title: string;
  date: string;
  city: string | null;
  distance: number; // km
  distanceLabel: string;
}

/**
 * Location-aware features: nearby events, event distance sorting,
 * and location-based suggestions.
 */
export function useLocationFeatures() {
  const { user } = useAuth();
  const geo = useNativeGeolocation();

  /**
   * Get events sorted by proximity to the user's current location.
   * Requires events to have city data — uses a server-side geocoding lookup.
   */
  const getNearbyEvents = useCallback(
    async (radiusKm = 50): Promise<NearbyEvent[]> => {
      const pos = geo.position || (await geo.getCurrentPosition());
      if (!pos) return [];

      try {
        const { data, error } = await supabase.functions.invoke('nearby-events', {
          body: {
            latitude: pos.latitude,
            longitude: pos.longitude,
            radius_km: radiusKm,
          },
        });

        if (error || !data?.events) return [];

        return (data.events as any[]).map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          city: e.city,
          distance: e.distance_km,
          distanceLabel: formatDistance(e.distance_km),
        }));
      } catch (error) {
        console.error('Failed to get nearby events:', error);
        return [];
      }
    },
    [geo],
  );

  /**
   * Update the user's approximate location in their profile.
   * Only stores city-level precision, not exact coordinates.
   */
  const updateUserLocation = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    const pos = geo.position || (await geo.getCurrentPosition());
    if (!pos) return false;

    try {
      const { data, error } = await supabase.functions.invoke('reverse-geocode', {
        body: {
          latitude: pos.latitude,
          longitude: pos.longitude,
        },
      });

      if (error || !data?.city) return false;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          city: data.city,
          state: data.state || null,
          country: data.country || null,
        })
        .eq('id', user.id);

      return !updateError;
    } catch {
      return false;
    }
  }, [user, geo]);

  return {
    ...geo,
    getNearbyEvents,
    updateUserLocation,
    formatDistance,
  };
}
