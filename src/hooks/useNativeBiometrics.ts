import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { toast } from 'sonner';

const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
const BIOMETRIC_CREDENTIALS_SERVER = 'app.lovable.makefriends';

interface BiometricState {
  isAvailable: boolean;
  biometryType: BiometryType;
  isEnabled: boolean;
  isLoading: boolean;
}

/**
 * Native biometric authentication (Face ID / Touch ID / Fingerprint).
 * Stores encrypted credentials on the device keychain/keystore
 * and prompts for biometric verification on app resume.
 */
export function useNativeBiometrics() {
  const isNative = Capacitor.isNativePlatform();

  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    biometryType: BiometryType.NONE,
    isEnabled: false,
    isLoading: true,
  });

  // Check availability on mount
  useEffect(() => {
    if (!isNative) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }

    (async () => {
      try {
        const result = await NativeBiometric.isAvailable();
        const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
        setState({
          isAvailable: result.isAvailable,
          biometryType: result.biometryType,
          isEnabled: enabled && result.isAvailable,
          isLoading: false,
        });
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    })();
  }, [isNative]);

  /**
   * Get a human-readable label for the biometry type.
   */
  const biometryLabel = useCallback(() => {
    switch (state.biometryType) {
      case BiometryType.FACE_ID:
        return 'Face ID';
      case BiometryType.TOUCH_ID:
        return 'Touch ID';
      case BiometryType.FINGERPRINT:
        return 'Fingerprint';
      case BiometryType.FACE_AUTHENTICATION:
        return 'Face Unlock';
      case BiometryType.IRIS_AUTHENTICATION:
        return 'Iris';
      default:
        return 'Biometrics';
    }
  }, [state.biometryType]);

  /**
   * Prompt the user for biometric verification.
   * Returns true if verified successfully.
   */
  const verify = useCallback(async (reason?: string): Promise<boolean> => {
    if (!isNative || !state.isAvailable) return false;

    try {
      await NativeBiometric.verifyIdentity({
        reason: reason || `Unlock with ${biometryLabel()}`,
        title: 'Authentication Required',
        subtitle: 'Verify your identity to continue',
        description: '',
      });
      return true;
    } catch {
      return false;
    }
  }, [isNative, state.isAvailable, biometryLabel]);

  /**
   * Enable biometric lock. Stores a credential marker on the device
   * so the app knows to prompt on next launch.
   */
  const enable = useCallback(async (userId: string): Promise<boolean> => {
    if (!isNative || !state.isAvailable) return false;

    try {
      // Verify the user can actually authenticate first
      const verified = await verify('Enable biometric lock');
      if (!verified) return false;

      // Store a credential marker in the secure keychain/keystore
      await NativeBiometric.setCredentials({
        username: userId,
        password: 'biometric-enabled', // Marker value
        server: BIOMETRIC_CREDENTIALS_SERVER,
      });

      localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      setState(s => ({ ...s, isEnabled: true }));
      toast.success(`${biometryLabel()} lock enabled`);
      return true;
    } catch (error) {
      console.error('Failed to enable biometrics:', error);
      toast.error('Failed to enable biometric lock');
      return false;
    }
  }, [isNative, state.isAvailable, verify, biometryLabel]);

  /**
   * Disable biometric lock.
   */
  const disable = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;

    try {
      await NativeBiometric.deleteCredentials({
        server: BIOMETRIC_CREDENTIALS_SERVER,
      });
    } catch {
      // Credentials may not exist, that's fine
    }

    localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    setState(s => ({ ...s, isEnabled: false }));
    toast.success('Biometric lock disabled');
    return true;
  }, [isNative]);

  return {
    ...state,
    biometryLabel: biometryLabel(),
    verify,
    enable,
    disable,
  };
}
