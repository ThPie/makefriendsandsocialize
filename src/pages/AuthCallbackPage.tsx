import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ADMIN_BASE } from "@/lib/route-paths";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";

/**
 * Determine where to redirect after successful auth
 */
async function getRedirectDestination(userId: string): Promise<string> {
  // Check if admin
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (roleData) {
    return '/admin';
  }

  // Check profile completion
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    return '/portal/onboarding';
  }

  // Check application status
  const { data: appData } = await supabase
    .from('application_waitlist')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle();

  if (appData?.status === 'pending') {
    return '/auth/waiting';
  }

  return '/portal';
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleAuthCallback = async () => {
      // Check for errors in query params (OAuth error responses)
      const params = new URLSearchParams(location.search);
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (error) {
        const msg = errorDescription ? decodeURIComponent(errorDescription) : error;
        setErrorMsg(msg);
        toast.error("Sign-in failed", { description: msg });
        return;
      }

      // Check for authorization code in query params (PKCE flow)
      const code = params.get("code");
      
      if (code) {
        // Exchange authorization code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;

        if (exchangeError) {
          const msg = exchangeError.message || "Failed to complete sign-in.";
          setErrorMsg(msg);
          toast.error("Could not finish sign-in", { description: msg });
          return;
        }

        // Successfully exchanged code, determine redirect destination
        if (data.session?.user) {
          const destination = await getRedirectDestination(data.session.user.id);
          navigate(destination, { replace: true });
        } else {
          navigate("/portal/onboarding", { replace: true });
        }
        return;
      }

      // Check for tokens in hash fragment (implicit flow or cross-domain transfer)
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      
      if (accessToken && refreshToken) {
        // Explicitly set the session using the provided tokens
        const { data, error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (cancelled) return;

        if (setSessionError) {
          const msg = setSessionError.message || "Failed to establish session.";
          setErrorMsg(msg);
          toast.error("Could not finish sign-in", { description: msg });
          return;
        }

        if (data.session?.user) {
          const destination = await getRedirectDestination(data.session.user.id);
          navigate(destination, { replace: true });
          return;
        }

        setErrorMsg("Could not establish session. Please try signing in again.");
        return;
      }

      // No code or tokens found - check if there's already a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (cancelled) return;

      if (session?.user) {
        const destination = await getRedirectDestination(session.user.id);
        navigate(destination, { replace: true });
        return;
      }

      // No authentication data found
      const msg = "Missing authentication data. Please try signing in again.";
      setErrorMsg(msg);
      toast.error(msg);
    };

    handleAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate, location.search, location.hash]);

  const handleRetryWithEmail = () => {
    navigate("/auth", { replace: true });
  };

  if (errorMsg) {
    return (
      <AuthErrorCard
        title="Sign-in failed"
        message={errorMsg}
        showRetryWithEmail={true}
        onRetryWithEmail={handleRetryWithEmail}
        showSignInButton={false}
        showHomeButton={true}
      />
    );
  }

  return <BrandedLoader message="Completing sign-in..." />;
}
