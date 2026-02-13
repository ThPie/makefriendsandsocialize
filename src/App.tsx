import { useEffect, lazy, Suspense } from "react";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/components/layout/Layout";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { isSlowDatingSubdomain, isCanadianDomain } from "@/lib/subdomain-utils";
import { CountryRedirectBanner } from "@/components/ui/country-redirect-banner";
import { SpeedInsights } from "@vercel/speed-insights/react";

const HomePage = lazy(() => import("@/pages/HomePage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const EventDetailPage = lazy(() => import("@/pages/EventDetailPage"));
const MembershipPage = lazy(() => import("@/pages/MembershipPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const JournalPage = lazy(() => import("@/pages/JournalPage"));
const JournalPostPage = lazy(() => import("@/pages/JournalPostPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const CodeOfConductPage = lazy(() => import("@/pages/CodeOfConductPage"));
const CookiesPage = lazy(() => import("@/pages/CookiesPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const BusinessDirectoryPage = lazy(() => import("@/pages/BusinessDirectoryPage"));
const BusinessLandingPage = lazy(() => import("@/pages/BusinessLandingPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const AuthWaitingPage = lazy(() => import("@/pages/AuthWaitingPage"));
const EmailVerificationPage = lazy(() => import("@/pages/EmailVerificationPage"));
const PortalDashboard = lazy(() => import("@/pages/portal/PortalDashboard"));
const PortalProfile = lazy(() => import("@/pages/portal/PortalProfile"));
const PortalNetwork = lazy(() => import("@/pages/portal/PortalNetwork"));
const PortalConnections = lazy(() => import("@/pages/portal/PortalConnections"));
const PortalEvents = lazy(() => import("@/pages/portal/PortalEvents"));
const PortalSlowDating = lazy(() => import("@/pages/portal/PortalSlowDating"));
const PortalMatchDetail = lazy(() => import("@/pages/portal/PortalMatchDetail"));
const PortalReferrals = lazy(() => import("@/pages/portal/PortalReferrals"));
const PortalBilling = lazy(() => import("@/pages/portal/PortalBilling"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminApplications = lazy(() => import("@/pages/admin/AdminApplications"));
const AdminMembers = lazy(() => import("@/pages/admin/AdminMembers"));
const AdminConnections = lazy(() => import("@/pages/admin/AdminConnections"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminContent = lazy(() => import("@/pages/admin/AdminContent"));
const AdminRoles = lazy(() => import("@/pages/admin/AdminRoles"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminTestimonials = lazy(() => import("@/pages/admin/AdminTestimonials"));
const AdminDating = lazy(() => import("@/pages/admin/AdminDating"));
const AdminDatingProfile = lazy(() => import("@/pages/admin/AdminDatingProfile"));
const AdminMatches = lazy(() => import("@/pages/admin/AdminMatches"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminEventAnalytics = lazy(() => import("@/pages/admin/AdminEventAnalytics"));
const AdminSecurityReports = lazy(() => import("@/pages/admin/AdminSecurityReports"));
const AdminSecurityDashboard = lazy(() => import("@/pages/admin/AdminSecurityDashboard"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminReferrals = lazy(() => import("@/pages/admin/AdminReferrals"));
const AdminPhotos = lazy(() => import("@/pages/admin/AdminPhotos"));
const AdminAppeals = lazy(() => import("@/pages/admin/AdminAppeals"));
const AdminCircles = lazy(() => import("@/pages/admin/AdminCircles"));
const DatingIntakePage = lazy(() => import("@/pages/DatingIntakePage"));
const SlowDatingPage = lazy(() => import("@/pages/SlowDatingPage"));
const SlowDatingLandingPage = lazy(() => import("@/pages/SlowDatingLandingPage"));
const AppealPage = lazy(() => import("@/pages/AppealPage"));
const ConnectedCirclePage = lazy(() => import("@/pages/ConnectedCirclePage"));
const ConnectedCircleDirectoryPage = lazy(() => import("@/pages/ConnectedCircleDirectoryPage"));
const PortalBusiness = lazy(() => import("@/pages/portal/PortalBusiness"));
const AdminBusinesses = lazy(() => import("@/pages/admin/AdminBusinesses"));
const DateConfirmationPage = lazy(() => import("@/pages/DateConfirmationPage"));
const CirclesPage = lazy(() => import("@/pages/CirclesPage"));
const TheGentlemenPage = lazy(() => import("@/pages/circles/TheGentlemenPage"));
const TheLadiesSocietyPage = lazy(() => import("@/pages/circles/TheLadiesSocietyPage"));
const LesAmisPage = lazy(() => import("@/pages/circles/LesAmisPage"));
const HealthCheckPage = lazy(() => import("@/pages/HealthCheckPage"));
const PortalOnboarding = lazy(() => import("@/pages/portal/PortalOnboarding"));
const PortalPerks = lazy(() => import("@/pages/portal/PortalPerks"));
const PortalConcierge = lazy(() => import("@/pages/portal/PortalConcierge"));
const PortalEventCheckin = lazy(() => import("@/pages/portal/PortalEventCheckin"));
const AdminPerks = lazy(() => import("@/pages/admin/AdminPerks"));
const AdminConcierge = lazy(() => import("@/pages/admin/AdminConcierge"));

const queryClient = new QueryClient();

// Component that handles password recovery redirect
// When the user lands on the home page with recovery tokens, this detects
// the PASSWORD_RECOVERY event and navigates to the reset password page
function RecoveryRedirectHandler() {
  const { isRecoveryMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRecoveryMode) {
      console.log('Recovery mode detected, redirecting to reset password page');
      navigate('/auth/reset-password', { replace: true });
    }
  }, [isRecoveryMode, navigate]);

  return null;
}

// Slow Dating subdomain routes - focused experience for dating users
const SlowDatingRoutes = () => (
  <Routes>
    <Route path="/" element={<SlowDatingLandingPage />} />
    <Route path="/portal/onboarding" element={<PortalOnboarding />} />
    <Route path="/portal/slow-dating" element={<PortalLayout><PortalSlowDating /></PortalLayout>} />
    <Route path="/portal/match/:matchId" element={<PortalLayout><PortalMatchDetail /></PortalLayout>} />
    <Route path="/portal/profile" element={<PortalLayout><PortalProfile /></PortalLayout>} />
    <Route path="/portal/billing" element={<PortalLayout><PortalBilling /></PortalLayout>} />
    <Route path="/dating/apply" element={<Layout><DatingIntakePage /></Layout>} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/auth/callback" element={<AuthCallbackPage />} />
    <Route path="/auth/waiting" element={<AuthWaitingPage />} />
    <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
    <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
    <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
    <Route path="/confirm-date/:token" element={<DateConfirmationPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// Main domain routes - full website experience
const MainRoutes = () => (
  <Routes>
    {/* Public routes with main layout */}
    <Route path="/" element={<Layout><HomePage /></Layout>} />
    <Route path="/events" element={<Layout><EventsPage /></Layout>} />
    <Route path="/events/:id" element={<Layout><EventDetailPage /></Layout>} />
    <Route path="/membership" element={<Layout><MembershipPage /></Layout>} />
    <Route path="/gallery" element={<Layout><GalleryPage /></Layout>} />
    <Route path="/about" element={<Layout><AboutPage /></Layout>} />
    <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
    <Route path="/journal" element={<Layout><JournalPage /></Layout>} />
    <Route path="/journal/:id" element={<Layout><JournalPostPage /></Layout>} />
    <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
    <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
    <Route path="/rules" element={<Layout><CodeOfConductPage /></Layout>} />
    <Route path="/cookies" element={<Layout><CookiesPage /></Layout>} />
    <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
    <Route path="/slow-dating" element={<SlowDatingPage />} />
    <Route path="/founders-circle" element={<ConnectedCirclePage />} />
    <Route path="/founders-circle/directory" element={<ConnectedCircleDirectoryPage />} />
    {/* Redirects from old URLs for SEO */}
    <Route path="/connected-circle" element={<Navigate to="/founders-circle" replace />} />
    <Route path="/connected-circle/directory" element={<Navigate to="/founders-circle/directory" replace />} />
    <Route path="/business" element={<Layout><BusinessDirectoryPage /></Layout>} />
    <Route path="/directory/:slug" element={<BusinessLandingPage />} />
    <Route path="/circles" element={<CirclesPage />} />
    <Route path="/circles/the-gentlemen" element={<TheGentlemenPage />} />
    <Route path="/circles/the-ladies-society" element={<TheLadiesSocietyPage />} />
    <Route path="/circles/les-amis" element={<LesAmisPage />} />
    <Route path="/appeal" element={<Layout><AppealPage /></Layout>} />

    {/* Health check endpoint for deployment verification */}
    <Route path="/health" element={<HealthCheckPage />} />

    {/* Dev testing route for subdomain landing page */}
    <Route path="/dev/slowdating-landing" element={<SlowDatingLandingPage />} />

    {/* Auth routes */}
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/auth/callback" element={<AuthCallbackPage />} />
    <Route path="/auth/waiting" element={<AuthWaitingPage />} />
    <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

    {/* Date confirmation (public route with token) */}
    <Route path="/confirm-date/:token" element={<DateConfirmationPage />} />

    {/* Portal routes with portal layout */}
    <Route path="/portal/onboarding" element={<PortalOnboarding />} />
    <Route path="/portal" element={<PortalLayout><PortalDashboard /></PortalLayout>} />
    <Route path="/portal/profile" element={<PortalLayout><PortalProfile /></PortalLayout>} />
    <Route path="/portal/network" element={<PortalLayout><PortalNetwork /></PortalLayout>} />
    <Route path="/portal/connections" element={<PortalLayout><PortalConnections /></PortalLayout>} />
    <Route path="/portal/slow-dating" element={<PortalLayout><PortalSlowDating /></PortalLayout>} />
    <Route path="/portal/match/:matchId" element={<PortalLayout><PortalMatchDetail /></PortalLayout>} />
    <Route path="/portal/events" element={<PortalLayout><PortalEvents /></PortalLayout>} />
    <Route path="/portal/billing" element={<PortalLayout><PortalBilling /></PortalLayout>} />
    <Route path="/portal/referrals" element={<PortalLayout><PortalReferrals /></PortalLayout>} />
    <Route path="/portal/business" element={<PortalLayout><PortalBusiness /></PortalLayout>} />
    <Route path="/portal/perks" element={<PortalLayout><PortalPerks /></PortalLayout>} />
    <Route path="/portal/concierge" element={<PortalLayout><PortalConcierge /></PortalLayout>} />
    <Route path="/portal/checkin/:eventId/:code" element={<PortalEventCheckin />} />

    {/* Dating intake route */}
    <Route path="/dating/apply" element={<Layout><DatingIntakePage /></Layout>} />

    {/* Admin routes with admin layout */}
    <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
    <Route path="/admin/applications" element={<AdminLayout><AdminApplications /></AdminLayout>} />
    <Route path="/admin/members" element={<AdminLayout><AdminMembers /></AdminLayout>} />
    <Route path="/admin/leads" element={<AdminLayout><AdminLeads /></AdminLayout>} />
    <Route path="/admin/security" element={<AdminLayout><AdminSecurityReports /></AdminLayout>} />
    <Route path="/admin/security-dashboard" element={<AdminLayout><AdminSecurityDashboard /></AdminLayout>} />
    <Route path="/admin/dating" element={<AdminLayout><AdminDating /></AdminLayout>} />
    <Route path="/admin/dating/:id" element={<AdminLayout><AdminDatingProfile /></AdminLayout>} />
    <Route path="/admin/matches" element={<AdminLayout><AdminMatches /></AdminLayout>} />
    <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
    <Route path="/admin/event-analytics" element={<AdminLayout><AdminEventAnalytics /></AdminLayout>} />
    <Route path="/admin/events" element={<AdminLayout><AdminEvents /></AdminLayout>} />
    <Route path="/admin/photos" element={<AdminLayout><AdminPhotos /></AdminLayout>} />
    <Route path="/admin/connections" element={<AdminLayout><AdminConnections /></AdminLayout>} />
    <Route path="/admin/testimonials" element={<AdminLayout><AdminTestimonials /></AdminLayout>} />
    <Route path="/admin/content" element={<AdminLayout><AdminContent /></AdminLayout>} />
    <Route path="/admin/roles" element={<AdminLayout><AdminRoles /></AdminLayout>} />
    <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
    <Route path="/admin/referrals" element={<AdminLayout><AdminReferrals /></AdminLayout>} />
    <Route path="/admin/appeals" element={<AdminLayout><AdminAppeals /></AdminLayout>} />
    <Route path="/admin/circles" element={<AdminLayout><AdminCircles /></AdminLayout>} />
    <Route path="/admin/businesses" element={<AdminLayout><AdminBusinesses /></AdminLayout>} />
    <Route path="/admin/perks" element={<AdminLayout><AdminPerks /></AdminLayout>} />
    <Route path="/admin/concierge" element={<AdminLayout><AdminConcierge /></AdminLayout>} />

    <Route path="*" element={<Layout><NotFound /></Layout>} />
  </Routes>
);

import { HelmetProvider } from 'react-helmet-async';

const App = () => {
  // Determine which routes to render based on subdomain
  const showSlowDatingRoutes = isSlowDatingSubdomain();
  // Only show geo-redirect banner on .com domains (not on .ca)
  const showGeoRedirectBanner = !isCanadianDomain() && !showSlowDatingRoutes;

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <RecoveryRedirectHandler />
                  {/* Show geo-redirect banner for Canadian users on .com */}
                  {showGeoRedirectBanner && <CountryRedirectBanner />}
                  <Suspense fallback={<BrandedLoader />}>
                    {showSlowDatingRoutes ? <SlowDatingRoutes /> : <MainRoutes />}
                  </Suspense>
                  <SpeedInsights />
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
