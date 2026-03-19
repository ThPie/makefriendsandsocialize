import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTheme } from 'next-themes';

/**
 * Manages the native status bar appearance.
 * Sets the status bar style based on the current theme.
 * Uses the <meta name="theme-color"> tag which Capacitor respects.
 */
export function useNativeStatusBar() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Update the theme-color meta tag — Capacitor uses this for status bar
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#0a0a0a' : '#ffffff'
      );
    }
  }, [resolvedTheme]);
}
