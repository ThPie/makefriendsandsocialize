import { useState, useEffect } from 'react';

type ConnectionQuality = 'high' | 'low' | 'offline';

interface NetworkInformation extends EventTarget {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

export const useConnectionQuality = (): ConnectionQuality => {
  const [quality, setQuality] = useState<ConnectionQuality>('low');

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) {
      // If Network Information API is not supported, assume high quality
      return;
    }

    const updateQuality = () => {
      if (!navigator.onLine) {
        setQuality('offline');
        return;
      }

      const isSlowConnection =
        connection.effectiveType === '2g' ||
        connection.effectiveType === 'slow-2g' ||
        connection.saveData === true ||
        connection.downlink < 1.5; // Less than 1.5 Mbps

      setQuality(isSlowConnection ? 'low' : 'high');
    };

    connection.addEventListener('change', updateQuality);
    window.addEventListener('online', updateQuality);
    window.addEventListener('offline', () => setQuality('offline'));

    updateQuality();

    return () => {
      connection.removeEventListener('change', updateQuality);
      window.removeEventListener('online', updateQuality);
      window.removeEventListener('offline', () => setQuality('offline'));
    };
  }, []);

  return quality;
};
