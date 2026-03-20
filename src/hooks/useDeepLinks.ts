import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';

/**
 * Deep-link route map: maps URL path patterns to in-app routes.
 * Supports path parameters via :param syntax.
 */
const DEEP_LINK_ROUTES: Array<{
  pattern: RegExp;
  /** Function that receives regex match groups and returns an in-app path */
  toRoute: (match: RegExpMatchArray) => string;
}> = [
  // Event detail: /events/:id or /event/:id
  {
    pattern: /^\/events?\/([a-f0-9-]+)$/i,
    toRoute: (m) => `/portal/events/${m[1]}`,
  },
  // Profile: /profile/:id or /member/:id
  {
    pattern: /^\/(?:profile|member)\/([a-f0-9-]+)$/i,
    toRoute: (m) => `/portal/network/${m[1]}`,
  },
  // Dating match: /match/:id
  {
    pattern: /^\/match\/([a-f0-9-]+)$/i,
    toRoute: (m) => `/portal/slow-dating`,
  },
  // Business: /business/:slug
  {
    pattern: /^\/business\/([a-zA-Z0-9-]+)$/i,
    toRoute: (m) => `/business/${m[1]}`,
  },
  // Blog post: /journal/:slug
  {
    pattern: /^\/journal\/([a-zA-Z0-9-]+)$/i,
    toRoute: (m) => `/journal/${m[1]}`,
  },
  // Referral: /refer/:code
  {
    pattern: /^\/refer\/([a-zA-Z0-9]+)$/i,
    toRoute: (m) => `/join?ref=${m[1]}`,
  },
  // Portal pages
  {
    pattern: /^\/portal(\/.*)?$/i,
    toRoute: (m) => `/portal${m[1] || '/dashboard'}`,
  },
];

/**
 * Resolves a deep-link URL to an in-app route.
 * Returns null if no matching route is found.
 */
export function resolveDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    for (const route of DEEP_LINK_ROUTES) {
      const match = path.match(route.pattern);
      if (match) {
        const resolved = route.toRoute(match);
        // Preserve query params
        const search = parsed.search;
        return search ? `${resolved}${search}` : resolved;
      }
    }

    // Fallback: pass the path through directly if it starts with /
    if (path && path !== '/') {
      return path + parsed.search;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Hook that listens for deep links (Universal Links on iOS, App Links on Android)
 * and navigates to the corresponding in-app route.
 *
 * Must be used inside a Router context.
 */
export function useDeepLinks() {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const processedRef = useRef<Set<string>>(new Set());

  const handleDeepLink = useCallback(
    (event: URLOpenListenerEvent) => {
      const url = event.url;

      // Deduplicate: don't process the same URL twice in quick succession
      if (processedRef.current.has(url)) return;
      processedRef.current.add(url);
      setTimeout(() => processedRef.current.delete(url), 2000);

      console.log('[DeepLinks] Received:', url);

      const route = resolveDeepLink(url);
      if (route) {
        console.log('[DeepLinks] Navigating to:', route);
        navigate(route, { replace: true });
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (!isNative) return;

    // Listen for incoming deep links while app is running
    const listener = App.addListener('appUrlOpen', handleDeepLink);

    // Check if the app was launched via a deep link
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        handleDeepLink({ url: result.url });
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [isNative, handleDeepLink]);

  return { resolveDeepLink };
}
