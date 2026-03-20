import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

/**
 * Tracks online/offline status with reconnection detection.
 * Shows toast notifications when connectivity changes.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [wasOffline, setWasOffline] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOfflineRef.current) {
        toast.success('Back online — syncing data…');
        wasOfflineRef.current = false;
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOfflineRef.current = true;
      setWasOffline(true);
      toast.warning("You're offline — using cached data");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
