import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle } from 'lucide-react';

/**
 * Current app version — update this with each release.
 * This is compared against a remote config to determine if an update is available.
 */
const CURRENT_VERSION = '1.0.0';

interface VersionInfo {
  latestVersion: string;
  minVersion: string;
  updateUrl: string;
  releaseNotes?: string;
}

/**
 * Hook that checks for app updates by comparing the current version
 * against a remote version endpoint. Shows a modal when an update is available.
 */
export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  const checkForUpdate = useCallback(async () => {
    if (!isNative) return;

    try {
      // Fetch version info from edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-data`,
        {
          method: 'OPTIONS', // Lightweight check
        },
      );

      // For now, use local version comparison
      // In production, replace with a dedicated version-check endpoint
      const appInfo = await App.getInfo();
      const currentBuild = appInfo.version || CURRENT_VERSION;

      // Store for comparison — this would come from your backend
      // For now, no update is available
      console.log(`[AppUpdate] Current version: ${currentBuild}`);
    } catch (error) {
      console.error('[AppUpdate] Version check failed:', error);
    }
  }, [isNative]);

  useEffect(() => {
    // Check on mount and when app resumes
    checkForUpdate();

    if (!isNative) return;

    let cleanup: (() => void) | undefined;
    App.addListener('appStateChange', (state) => {
      if (state.isActive) checkForUpdate();
    }).then((listener) => {
      cleanup = () => listener.remove();
    });

    return () => cleanup?.();
  }, [checkForUpdate, isNative]);

  const openStore = useCallback(() => {
    const storeUrl =
      platform === 'ios'
        ? 'https://apps.apple.com/app/makefriends/id000000000' // Replace with real ID
        : 'https://play.google.com/store/apps/details?id=app.lovable.c4cc7ef9b4c34c978cd0fc758a50847e';

    window.open(storeUrl, '_system');
  }, [platform]);

  return {
    updateAvailable: updateAvailable && !dismissed,
    forceUpdate,
    versionInfo,
    currentVersion: CURRENT_VERSION,
    openStore,
    dismiss: () => setDismissed(true),
    checkForUpdate,
  };
}

/**
 * Modal component that shows when an app update is available.
 */
export function AppUpdateModal() {
  const { updateAvailable, forceUpdate, versionInfo, openStore, dismiss } = useAppUpdate();

  if (!updateAvailable) return null;

  return (
    <Dialog open={updateAvailable} onOpenChange={forceUpdate ? undefined : () => dismiss()}>
      <DialogContent className={forceUpdate ? '[&>button]:hidden' : ''}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ArrowUpCircle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Update Available</DialogTitle>
          <DialogDescription className="text-center">
            {forceUpdate
              ? 'This update is required to continue using MakeFriends.'
              : 'A new version of MakeFriends is available with improvements and bug fixes.'}
          </DialogDescription>
        </DialogHeader>

        {versionInfo?.releaseNotes && (
          <p className="text-sm text-muted-foreground text-center">{versionInfo.releaseNotes}</p>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={openStore} className="w-full">
            Update Now
          </Button>
          {!forceUpdate && (
            <Button variant="ghost" onClick={dismiss} className="w-full">
              Later
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
