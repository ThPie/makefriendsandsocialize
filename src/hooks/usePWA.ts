import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check if app is running in standalone mode (installed)
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkStandalone();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Listen for app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for service worker update events
  useEffect(() => {
    const handleSWUpdate = () => setNeedsUpdate(true);

    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  // Install function
  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Reload to update
  const updateApp = useCallback(() => {
    if (needsUpdate) {
      window.location.reload();
    }
  }, [needsUpdate]);

  // Get platform-specific install instructions
  const getInstallInstructions = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isEdge = /edge/.test(userAgent);

    if (isIOS) {
      return {
        platform: 'iOS',
        steps: [
          'Tap the Share button at the bottom of Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right corner'
        ],
        icon: 'share'
      };
    }

    if (isAndroid && isChrome) {
      return {
        platform: 'Android',
        steps: [
          'Tap the menu icon (three dots) in Chrome',
          'Tap "Add to Home screen"',
          'Tap "Add" to confirm'
        ],
        icon: 'more_vert'
      };
    }

    if (isChrome || isEdge) {
      return {
        platform: 'Desktop',
        steps: [
          'Click the install icon in the address bar',
          'Or click the menu and select "Install MakeFriends"',
          'Click "Install" to confirm'
        ],
        icon: 'install_desktop'
      };
    }

    if (isFirefox) {
      return {
        platform: 'Firefox',
        steps: [
          'Firefox has limited PWA support',
          'Consider using Chrome or Edge for the best experience',
          'Or bookmark this page for quick access'
        ],
        icon: 'info'
      };
    }

    return {
      platform: 'Browser',
      steps: [
        'Look for an install option in your browser menu',
        'Or add this page to your bookmarks',
        'For the best experience, try Chrome or Safari'
      ],
      icon: 'help'
    };
  }, []);

  return {
    isInstalled,
    isInstallable,
    isOnline,
    isStandalone,
    needsUpdate,
    install,
    updateApp,
    getInstallInstructions,
    canInstall: isInstallable && !isInstalled
  };
}
