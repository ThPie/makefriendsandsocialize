import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInactivityLogoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onLogout: () => void;
  enabled?: boolean;
}

interface UseInactivityLogoutReturn {
  showWarning: boolean;
  remainingSeconds: number;
  resetTimer: () => void;
  dismissWarning: () => void;
}

export function useInactivityLogout({
  timeoutMinutes = 30,
  warningMinutes = 2,
  onLogout,
  enabled = true,
}: UseInactivityLogoutOptions): UseInactivityLogoutReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningMinutes * 60);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    setRemainingSeconds(warningMinutes * 60);
    setShowWarning(true);
    
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearAllTimers();
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningMinutes, onLogout, clearAllTimers]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    
    clearAllTimers();
    setShowWarning(false);
    setRemainingSeconds(warningMinutes * 60);
    lastActivityRef.current = Date.now();

    const warningDelay = (timeoutMinutes - warningMinutes) * 60 * 1000;
    
    warningTimeoutRef.current = setTimeout(() => {
      startCountdown();
    }, warningDelay);
  }, [enabled, timeoutMinutes, warningMinutes, clearAllTimers, startCountdown]);

  const dismissWarning = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Track user activity
  const showWarningRef = useRef(showWarning);
  useEffect(() => { showWarningRef.current = showWarning; }, [showWarning]);

  useEffect(() => {
    if (!enabled) return;

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
    ];

    // Throttle activity updates to every 5 seconds
    let lastUpdate = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdate < 5000) return;
      lastUpdate = now;
      
      // Only reset if warning is not showing
      if (!showWarningRef.current) {
        lastActivityRef.current = now;
        resetTimer();
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle visibility change - reset when user returns
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !showWarningRef.current) {
        resetTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the initial timer
    resetTimer();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearAllTimers();
    };
  }, [enabled, resetTimer, clearAllTimers]);

  return {
    showWarning,
    remainingSeconds,
    resetTimer,
    dismissWarning,
  };
}
