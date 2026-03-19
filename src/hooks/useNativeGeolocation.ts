import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { toast } from 'sonner';

interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Native geolocation via Capacitor.
 * Provides current position, distance calculation, and permission handling.
 * Falls back to browser Geolocation API on web.
 */
export function useNativeGeolocation() {
  const isNative = Capacitor.isNativePlatform();
  const [position, setPosition] = useState<GeoCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  // Check permission status on mount
  useEffect(() => {
    (async () => {
      try {
        const status = await Geolocation.checkPermissions();
        setPermissionStatus(status.location as any);
      } catch {
        setPermissionStatus('unknown');
      }
    })();
  }, []);

  /**
   * Request location permission and get current position.
   */
  const getCurrentPosition = useCallback(async (): Promise<GeoCoordinates | null> => {
    setIsLoading(true);
    try {
      // Request permission if needed
      let status = await Geolocation.checkPermissions();
      if (status.location === 'prompt' || status.location === 'prompt-with-rationale') {
        status = await Geolocation.requestPermissions();
      }

      if (status.location !== 'granted') {
        setPermissionStatus('denied');
        toast.error('Location access denied. Enable it in your device settings.');
        return null;
      }

      setPermissionStatus('granted');

      const pos: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const coords: GeoCoordinates = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };

      setPosition(coords);
      return coords;
    } catch (error: any) {
      console.error('Geolocation error:', error);
      if (error?.message?.includes('denied')) {
        setPermissionStatus('denied');
        toast.error('Location access denied');
      } else {
        toast.error('Could not get your location');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported: true, // Both native and web support geolocation
    isNative,
    isLoading,
    position,
    permissionStatus,
    getCurrentPosition,
    distanceBetween,
    distanceFromUser: useCallback(
      (lat: number, lng: number) => {
        if (!position) return null;
        return distanceBetween(position.latitude, position.longitude, lat, lng);
      },
      [position],
    ),
  };
}

/**
 * Haversine formula — distance between two coordinates in km.
 */
export function distanceBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Format a distance for display.
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
