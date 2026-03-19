import { useEffect, useState } from 'react';
import { useNativeBiometrics } from '@/hooks/useNativeBiometrics';
import { isNativeApp } from '@/lib/deep-link-handler';
import { App } from '@capacitor/app';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Biometric lock screen that appears when the app resumes from background.
 * Only active when the user has enabled biometric lock in settings.
 */
export function BiometricLockScreen({ children }: { children: React.ReactNode }) {
  const { isEnabled, verify, biometryLabel } = useNativeBiometrics();
  const [isLocked, setIsLocked] = useState(false);

  // Listen for app returning from background
  useEffect(() => {
    if (!isNativeApp() || !isEnabled) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const listener = await App.addListener('appStateChange', (state) => {
        if (state.isActive && isEnabled) {
          setIsLocked(true);
          // Auto-prompt on resume
          verify().then((ok) => {
            if (ok) setIsLocked(false);
          });
        }
      });
      cleanup = () => listener.remove();
    })();

    return () => cleanup?.();
  }, [isEnabled, verify]);

  const handleUnlock = async () => {
    const ok = await verify();
    if (ok) setIsLocked(false);
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
        <Shield className="h-16 w-16 text-primary mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">App Locked</h2>
        <p className="text-muted-foreground mb-8 text-center px-8">
          Unlock with {biometryLabel} to continue
        </p>
        <Button onClick={handleUnlock} size="lg">
          Unlock
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
