import { createContext, useContext, ReactNode } from 'react';
import { useNativeApp } from '@/hooks/useNativeApp';
import { NativeOnboarding } from './NativeOnboarding';

interface NativeAppContextValue {
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  platform: 'ios' | 'android' | 'web';
}

const NativeAppContext = createContext<NativeAppContextValue>({
  isNative: false,
  isIOS: false,
  isAndroid: false,
  platform: 'web',
});

export const useNativeAppContext = () => useContext(NativeAppContext);

interface NativeAppProviderProps {
  children: ReactNode;
}

/**
 * Wraps the entire app. In native mode:
 * - Shows onboarding slides on first launch
 * - Provides native context to all children
 */
export function NativeAppProvider({ children }: NativeAppProviderProps) {
  const { isNative, isIOS, isAndroid, platform, hasSeenNativeOnboarding, completeNativeOnboarding } = useNativeApp();

  // Show native onboarding on first launch
  if (isNative && !hasSeenNativeOnboarding) {
    return <NativeOnboarding onComplete={completeNativeOnboarding} />;
  }

  return (
    <NativeAppContext.Provider value={{ isNative, isIOS, isAndroid, platform }}>
      {children}
    </NativeAppContext.Provider>
  );
}
