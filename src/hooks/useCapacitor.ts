import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkPlatform = () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);
      setPlatform(Capacitor.getPlatform() as 'ios' | 'android' | 'web');
      setIsReady(true);
    };

    checkPlatform();
  }, []);

  return {
    isNative,
    platform,
    isReady,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
}
