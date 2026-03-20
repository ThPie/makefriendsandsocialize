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

  // Direct portal/auth routes pass through
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

  // Pattern-based routes with ID/slug extraction
  const patterns: Array<{ regex: RegExp; toRoute: (m: RegExpMatchArray) => string }> = [
    { regex: /^\/events?\/([a-f0-9-]+)$/i, toRoute: (m) => `/portal/events/${m[1]}` },
    { regex: /^\/(?:profile|member)\/([a-f0-9-]+)$/i, toRoute: (m) => `/portal/network/${m[1]}` },
    { regex: /^\/match\/([a-f0-9-]+)$/i, toRoute: () => `/portal/slow-dating` },
    { regex: /^\/business\/([a-zA-Z0-9-]+)$/i, toRoute: (m) => `/business/${m[1]}` },
    { regex: /^\/journal\/([a-zA-Z0-9-]+)$/i, toRoute: (m) => `/journal/${m[1]}` },
    { regex: /^\/refer\/([a-zA-Z0-9]+)$/i, toRoute: (m) => `/join?ref=${m[1]}` },
  ];

  for (const { regex, toRoute } of patterns) {
    const match = clean.match(regex);
    if (match) return toRoute(match);
  }

  // Fallback — let the router handle it
  return clean || '/portal/dashboard';
}
