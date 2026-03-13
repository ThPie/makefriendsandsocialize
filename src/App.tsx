import { useEffect, Suspense, lazy } from "react";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { appQueryClient } from "@/lib/queryClient";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PublishedDomainRedirect } from "@/components/PublishedDomainRedirect";
import { isSlowDatingSubdomain, isCanadianDomain } from "@/lib/subdomain-utils";
import { CountryRedirectBanner } from "@/components/ui/country-redirect-banner";
// Lazy-load SpeedInsights — it's non-critical and shouldn't block initial render
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then((m) => ({ default: m.SpeedInsights }))
);
import { HelmetProvider } from 'react-helmet-async';
import { RegisterSW } from "./components/common/RegisterSW";

import { SlowDatingRoutes, MainRoutes } from "@/routes/config";

// Component that handles password recovery redirect
// When the user lands on the home page with recovery tokens, this detects
// the PASSWORD_RECOVERY event and navigates to the reset password page
function RecoveryRedirectHandler() {
  const { isRecoveryMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRecoveryMode) {
      if (import.meta.env.DEV) console.log('Recovery mode detected, redirecting to reset password page');
      navigate('/auth/reset-password', { replace: true });
    }
  }, [isRecoveryMode, navigate]);

  return null;
}



const App = () => {
  // Determine which routes to render based on subdomain
  const showSlowDatingRoutes = isSlowDatingSubdomain();
  // Only show geo-redirect banner on .com domains (not on .ca)
  const showGeoRedirectBanner = !isCanadianDomain() && !showSlowDatingRoutes;

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={appQueryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <TooltipProvider>
                <RegisterSW />
                <PublishedDomainRedirect />
                <BrowserRouter>
                  <SessionProvider>
                    <ScrollToTop />
                    <RecoveryRedirectHandler />
                    {/* Show geo-redirect banner for Canadian users on .com */}
                    {showGeoRedirectBanner && <CountryRedirectBanner />}
                    <Suspense fallback={<BrandedLoader />}>
                      {showSlowDatingRoutes ? <SlowDatingRoutes /> : <MainRoutes />}
                    </Suspense>
                    <Suspense fallback={null}><SpeedInsights /></Suspense>
                  </SessionProvider>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
