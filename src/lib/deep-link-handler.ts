/**
 * Deep link handling for future native app integration
 */

export const DEEP_LINK_SCHEMES = {
  ios: 'slowdating://',
  android: 'slowdating://',
  universal: 'https://slowdating.makefriendsandsocialize.com'
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
    return null;
  }
}

export function isNativeApp(): boolean {
  // Check if running inside Capacitor
  // This will be available when native app is set up
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })?.Capacitor?.isNativePlatform?.();
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  if (!isNativeApp()) return 'web';
  
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'ios';
  }
  if (userAgent.includes('android')) {
    return 'android';
  }
  return 'web';
}
