import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandedLoader } from "@/components/ui/branded-loader";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      const msg = errorDescription ? decodeURIComponent(errorDescription) : error;
      setErrorMsg(msg);
      toast.error("Google sign-in failed", { description: msg });
      return;
    }

    const code = params.get("code");
    if (!code) {
      const msg = "Missing OAuth code. Please try signing in again.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    let cancelled = false;

    (async () => {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (cancelled) return;

      if (exchangeError) {
        const msg = exchangeError.message || "Failed to complete sign-in.";
        setErrorMsg(msg);
        toast.error("Could not finish sign-in", { description: msg });
        return;
      }

      navigate("/portal", { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, params]);

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
