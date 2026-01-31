import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isCanadianDomain, getEquivalentCanadianUrl } from '@/lib/subdomain-utils';

const GEO_REDIRECT_DISMISSED_KEY = 'geo-redirect-dismissed';
const GEO_REDIRECT_CACHE_KEY = 'geo-location-cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface GeoLocation {
  country: string | null;
  state: string | null;
  city: string | null;
  isVpn: boolean;
}

interface CachedGeoLocation extends GeoLocation {
  timestamp: number;
}

interface UseGeoRedirectResult {
  showBanner: boolean;
  isLoading: boolean;
  location: GeoLocation | null;
  canadianUrl: string;
  dismissBanner: () => void;
  redirectToCanada: () => void;
}

/**
 * Hook for geo-based redirect suggestions.
 * Shows a banner to Canadian users on .com domains suggesting they visit .ca
 */
export function useGeoRedirect(): UseGeoRedirectResult {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<GeoLocation | null>(null);

  const canadianUrl = getEquivalentCanadianUrl();

  // Check if the user has dismissed the banner before
  const wasDismissed = useCallback((): boolean => {
    try {
      const dismissed = localStorage.getItem(GEO_REDIRECT_DISMISSED_KEY);
      return dismissed === 'true';
    } catch {
      return false;
    }
  }, []);

  // Get cached location data
  const getCachedLocation = useCallback((): GeoLocation | null => {
    try {
      const cached = localStorage.getItem(GEO_REDIRECT_CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedGeoLocation = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - data.timestamp > CACHE_DURATION_MS) {
        localStorage.removeItem(GEO_REDIRECT_CACHE_KEY);
        return null;
      }
      
      return {
        country: data.country,
        state: data.state,
        city: data.city,
        isVpn: data.isVpn,
      };
    } catch {
      return null;
    }
  }, []);

  // Cache location data
  const cacheLocation = useCallback((loc: GeoLocation): void => {
    try {
      const cacheData: CachedGeoLocation = {
        ...loc,
        timestamp: Date.now(),
      };
      localStorage.setItem(GEO_REDIRECT_CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Dismiss the banner and remember the choice
  const dismissBanner = useCallback((): void => {
    try {
      localStorage.setItem(GEO_REDIRECT_DISMISSED_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
    setShowBanner(false);
  }, []);

  // Redirect to the Canadian site
  const redirectToCanada = useCallback((): void => {
    window.location.href = canadianUrl;
  }, [canadianUrl]);

  useEffect(() => {
    // Don't show banner if already on Canadian domain
    if (isCanadianDomain()) {
      setIsLoading(false);
      return;
    }

    // Don't show banner if user already dismissed it
    if (wasDismissed()) {
      setIsLoading(false);
      return;
    }

    // Check for cached location first
    const cachedLoc = getCachedLocation();
    if (cachedLoc) {
      setLocation(cachedLoc);
      // Show banner if user is in Canada (but not on VPN)
      if (cachedLoc.country === 'Canada' && !cachedLoc.isVpn) {
        setShowBanner(true);
      }
      setIsLoading(false);
      return;
    }

    // Fetch location from edge function
    const detectLocation = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('detect-location');
        
        if (error) {
          console.error('Error detecting location:', error);
          setIsLoading(false);
          return;
        }

        if (data?.success) {
          const loc: GeoLocation = {
            country: data.country,
            state: data.state,
            city: data.city,
            isVpn: data.isVpn || false,
          };
          
          setLocation(loc);
          cacheLocation(loc);
          
          // Show banner if user is in Canada (but not on VPN)
          if (loc.country === 'Canada' && !loc.isVpn) {
            setShowBanner(true);
          }
        }
      } catch (err) {
        console.error('Error detecting location:', err);
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, [wasDismissed, getCachedLocation, cacheLocation]);

  return {
    showBanner,
    isLoading,
    location,
    canadianUrl,
    dismissBanner,
    redirectToCanada,
  };
}
