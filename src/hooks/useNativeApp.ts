import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const NATIVE_ONBOARDING_KEY = 'native_onboarding_completed';

/**
 * Detects if the app is running as a native Capacitor app
 * and manages native-specific state like first-launch onboarding.
 */
export function useNativeApp() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';

  const [hasSeenNativeOnboarding, setHasSeenNativeOnboarding] = useState(() => {
    if (!isNative) return true; // Web users skip native onboarding
    return localStorage.getItem(NATIVE_ONBOARDING_KEY) === 'true';
  });

  const completeNativeOnboarding = () => {
    localStorage.setItem(NATIVE_ONBOARDING_KEY, 'true');
    setHasSeenNativeOnboarding(true);
  };

  return {
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    hasSeenNativeOnboarding,
    completeNativeOnboarding,
  };
}
