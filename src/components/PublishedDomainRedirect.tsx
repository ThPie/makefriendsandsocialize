import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BrandedLoader } from '@/components/ui/branded-loader';

const PUBLISHED_HOSTNAME = 'makefriendsandsocializecom.lovable.app';
const CUSTOM_DOMAIN = 'https://makefriendsandsocialize.com';

/**
 * When the app is loaded on the published .lovable.app domain,
 * this component redirects users to the custom domain.
 *
 * For authenticated users (e.g. returning from Google OAuth),
 * it passes session tokens via hash fragment so the custom domain
 * can establish the session.
 *
 * For unauthenticated users, it redirects to the same path on the
 * custom domain after a short wait (to allow any in-flight OAuth
 * to complete).
 */
export function usePublishedDomainRedirect(): boolean {
  const isPublishedDomain = typeof window !== 'undefined' &&
    window.location.hostname === PUBLISHED_HOSTNAME;

  useEffect(() => {
    if (!isPublishedDomain) return;

    let cancelled = false;

    const redirectWithSession = (session: { access_token: string; refresh_token: string; expires_in: number }) => {
      if (cancelled) return;
      const hash = `#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&token_type=bearer&expires_in=${session.expires_in}`;
      window.location.replace(`${CUSTOM_DOMAIN}/auth/callback${hash}`);
    };

    const redirectWithoutSession = () => {
      if (cancelled) return;
      // Preserve the current path so /auth stays /auth, etc.
      window.location.replace(
        `${CUSTOM_DOMAIN}${window.location.pathname}${window.location.search}`
      );
    };

    const run = async () => {
      // If there are tokens in the hash (from OAuth callback), forward them immediately
      if (window.location.hash && window.location.hash.includes('access_token')) {
        if (cancelled) return;
        window.location.replace(
          `${CUSTOM_DOMAIN}/auth/callback${window.location.hash}`
        );
        return;
      }

      // Check if there's already a session
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        redirectWithSession(session);
        return;
      }

      // No session yet — could be mid-OAuth flow. Listen for sign-in.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          if (newSession && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            subscription.unsubscribe();
            redirectWithSession(newSession);
          }
        }
      );

      // Timeout: if no sign-in after 4 seconds, redirect without tokens
      setTimeout(() => {
        if (!cancelled) {
          subscription.unsubscribe();
          redirectWithoutSession();
        }
      }, 4000);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isPublishedDomain]);

  return isPublishedDomain;
}

export function PublishedDomainRedirect() {
  const isRedirecting = usePublishedDomainRedirect();

  if (isRedirecting) {
    return <BrandedLoader message="Redirecting to makefriendsandsocialize.com..." />;
  }

  return null;
}
