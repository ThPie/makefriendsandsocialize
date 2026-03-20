import { Capacitor, registerPlugin } from '@capacitor/core';
import { useCallback } from 'react';

/**
 * Bridge interface for iOS App Clips / Android Instant Apps.
 * The native side must register a Capacitor plugin called "AppClips".
 * See docs/APP_CLIPS.md for implementation details.
 */
interface AppClipsPlugin {
  /** Check if the app is running as an App Clip / Instant App */
  isAppClip(): Promise<{ isClip: boolean }>;
  /** Get the invocation URL that launched the clip */
  getInvocationURL(): Promise<{ url: string | null }>;
  /** Prompt the user to install the full app */
  promptFullAppInstall(): Promise<void>;
}

const AppClips = registerPlugin<AppClipsPlugin>('AppClips');

/**
 * Manages App Clip (iOS) and Instant App (Android) context.
 * - Detects if the current session is a lightweight clip
 * - Extracts the invocation URL for deep-linking
 * - Provides a prompt to upgrade to the full app
 *
 * No-ops on web.
 */
export function useAppClips() {
  const isNative = Capacitor.isNativePlatform();

  const checkIsAppClip = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;
    try {
      const { isClip } = await AppClips.isAppClip();
      return isClip;
    } catch {
      return false;
    }
  }, [isNative]);

  const getInvocationURL = useCallback(async (): Promise<string | null> => {
    if (!isNative) return null;
    try {
      const { url } = await AppClips.getInvocationURL();
      return url;
    } catch {
      return null;
    }
  }, [isNative]);

  const promptInstallFullApp = useCallback(async () => {
    if (!isNative) return;
    try {
      await AppClips.promptFullAppInstall();
    } catch (error) {
      console.error('[AppClips] Install prompt failed:', error);
    }
  }, [isNative]);

  return {
    isSupported: isNative,
    checkIsAppClip,
    getInvocationURL,
    promptInstallFullApp,
  };
}
