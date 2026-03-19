import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initDeepLinkListener, initAppStateListener, isNativeApp } from '@/lib/deep-link-handler';

/**
 * Initializes deep link routing and app state listeners for native apps.
 * Call once inside the BrowserRouter context (e.g., in App.tsx).
 */
export function useDeepLinkRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeApp()) return;

    let cleanupDeepLink: (() => void) | undefined;
    let cleanupState: (() => void) | undefined;

    (async () => {
      cleanupDeepLink = await initDeepLinkListener((path) => {
        // Normalise common deep link paths
        const route = mapDeepLinkPath(path);
        navigate(route);
      });

      cleanupState = await initAppStateListener(
        () => {
          // On resume — could trigger biometric check, refresh data, etc.
          if (import.meta.env.DEV) console.log('[DeepLinkRouter] App resumed');
        },
        () => {
          if (import.meta.env.DEV) console.log('[DeepLinkRouter] App paused');
        },
      );
    })();

    return () => {
      cleanupDeepLink?.();
      cleanupState?.();
    };
  }, [navigate]);
}

/**
 * Map incoming deep link paths to app routes.
 * Handles both universal links and custom scheme paths.
 */
function mapDeepLinkPath(path: string): string {
  // Strip leading slashes and normalise
  const clean = path.replace(/^\/+/, '/');

  // Direct portal routes pass through
  if (clean.startsWith('/portal')) return clean;
  if (clean.startsWith('/auth')) return clean;

  // Shortcut mappings for share links
  const mappings: Record<string, string> = {
    '/events': '/portal/events',
    '/dating': '/portal/slow-dating',
    '/matches': '/portal/slow-dating',
    '/profile': '/portal/profile',
    '/dashboard': '/portal/dashboard',
    '/network': '/portal/network',
    '/settings': '/portal/settings',
  };

  // Check exact matches
  if (mappings[clean]) return mappings[clean];

  // Pattern-based routes
  if (clean.startsWith('/event/')) return `/portal/events`;
  if (clean.startsWith('/match/')) return `/portal/match/${clean.split('/').pop()}`;
  if (clean.startsWith('/member/')) return `/portal/network`;

  // Fallback — let the router handle it
  return clean || '/portal/dashboard';
}
