/**
 * Deep link handling for native app integration with Capacitor
 */

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export const DEEP_LINK_SCHEMES = {
  ios: 'makefriends://',
  android: 'makefriends://',
  universal: 'https://makefriendsandsocialize.com'
};

export const APP_STORE_URLS = {
  ios: '#', // Placeholder - will be updated when app is published
  android: '#' // Placeholder - will be updated when app is published
};

export function generateDeepLink(path: string): string {
  // Returns the universal link for now
  // Will be updated when native app is ready
  return `${DEEP_LINK_SCHEMES.universal}${path}`;
}

export function handleIncomingDeepLink(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    // Handle custom scheme URLs (makefriends://path)
    const schemeMatch = url.match(/^makefriends:\/\/(.*)$/);
    if (schemeMatch) {
      return '/' + schemeMatch[1];
    }
    return null;
  }
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Initialize deep link listener for native apps
 * Call this in App.tsx after router is ready
 */
export async function initDeepLinkListener(navigate: (path: string) => void): Promise<() => void> {
  if (!isNativeApp()) {
    return () => { }; // No-op cleanup for web
  }

  // Handle app opened via deep link while running
  const urlOpenListener = await App.addListener('appUrlOpen', (event) => {
    if (import.meta.env.DEV) console.log('Deep link received:', event.url);
    const path = handleIncomingDeepLink(event.url);
    if (path) {
      navigate(path);
    }
  });

  // Check if app was opened via URL (cold start)
  try {
    const launchUrl = await App.getLaunchUrl();
    if (launchUrl?.url) {
      if (import.meta.env.DEV) console.log('App launched with URL:', launchUrl.url);
      const path = handleIncomingDeepLink(launchUrl.url);
      if (path) {
        // Small delay to ensure router is ready
        setTimeout(() => navigate(path), 100);
      }
    }
  } catch (error) {
    console.error('Error getting launch URL:', error);
  }

  // Return cleanup function
  return () => {
    urlOpenListener.remove();
  };
}

/**
 * Handle app state changes (foreground/background)
 */
export async function initAppStateListener(
  onResume?: () => void,
  onPause?: () => void
): Promise<() => void> {
  if (!isNativeApp()) {
    return () => { };
  }

  const stateListener = await App.addListener('appStateChange', (state) => {
    if (import.meta.env.DEV) console.log('App state changed:', state.isActive ? 'active' : 'inactive');
    if (state.isActive) {
      onResume?.();
    } else {
      onPause?.();
    }
  });

  return () => {
    stateListener.remove();
  };
}
