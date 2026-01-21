import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandedLoader } from "@/components/ui/branded-loader";

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
        toast.error("Google sign-in failed", { description: msg });
        return;
      }

      // Check for authorization code in query params (PKCE flow)
      const code = params.get("code");
      
      if (code) {
        // Exchange authorization code for session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;

        if (exchangeError) {
          const msg = exchangeError.message || "Failed to complete sign-in.";
          setErrorMsg(msg);
          toast.error("Could not finish sign-in", { description: msg });
          return;
        }

        // Successfully exchanged code, redirect to portal
        navigate("/portal", { replace: true });
        return;
      }

      // Check for tokens in hash fragment (implicit flow)
      // Supabase client automatically handles hash fragments on initialization
      // We just need to wait for the session to be established
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      
      if (accessToken) {
        // Hash contains tokens - Supabase client should handle this automatically
        // Wait a moment for the auth state to update, then check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (cancelled) return;

        if (sessionError) {
          const msg = sessionError.message || "Failed to establish session.";
          setErrorMsg(msg);
          toast.error("Could not finish sign-in", { description: msg });
          return;
        }

        if (session) {
          navigate("/portal", { replace: true });
          return;
        }

        // If no session yet, set up a listener to wait for it
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session && !cancelled) {
            subscription.unsubscribe();
            navigate("/portal", { replace: true });
          }
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!cancelled) {
            subscription.unsubscribe();
            setErrorMsg("Authentication timed out. Please try again.");
            toast.error("Authentication timed out");
          }
        }, 10000);

        return;
      }

      // No code or tokens found - check if there's already a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (cancelled) return;

      if (session) {
        navigate("/portal", { replace: true });
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

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-6">
          <h1 className="text-xl font-semibold text-foreground">Sign-in failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{errorMsg}</p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Back to sign in
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BrandedLoader />;
}
