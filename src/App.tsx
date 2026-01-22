import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/components/layout/Layout";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { isSlowDatingSubdomain } from "@/lib/subdomain-utils";

import HomePage from "@/pages/HomePage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import MembershipPage from "@/pages/MembershipPage";
import GalleryPage from "@/pages/GalleryPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import JournalPage from "@/pages/JournalPage";
import JournalPostPage from "@/pages/JournalPostPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import CodeOfConductPage from "@/pages/CodeOfConductPage";
import CookiesPage from "@/pages/CookiesPage";
import FAQPage from "@/pages/FAQPage";
import NotFound from "@/pages/NotFound";
import BusinessDirectoryPage from "@/pages/BusinessDirectoryPage";
import AuthPage from "@/pages/AuthPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import AuthWaitingPage from "@/pages/AuthWaitingPage";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import PortalProfile from "@/pages/portal/PortalProfile";
import PortalNetwork from "@/pages/portal/PortalNetwork";
import PortalConnections from "@/pages/portal/PortalConnections";
import PortalEvents from "@/pages/portal/PortalEvents";
import PortalSlowDating from "@/pages/portal/PortalSlowDating";
import PortalMatchDetail from "@/pages/portal/PortalMatchDetail";
import PortalReferrals from "@/pages/portal/PortalReferrals";
import PortalBilling from "@/pages/portal/PortalBilling";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminApplications from "@/pages/admin/AdminApplications";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminConnections from "@/pages/admin/AdminConnections";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminContent from "@/pages/admin/AdminContent";
import AdminRoles from "@/pages/admin/AdminRoles";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminDating from "@/pages/admin/AdminDating";
import AdminDatingProfile from "@/pages/admin/AdminDatingProfile";
import AdminMatches from "@/pages/admin/AdminMatches";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminEventAnalytics from "@/pages/admin/AdminEventAnalytics";
import AdminSecurityReports from "@/pages/admin/AdminSecurityReports";
import AdminSecurityDashboard from "@/pages/admin/AdminSecurityDashboard";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import AdminPhotos from "@/pages/admin/AdminPhotos";
import AdminAppeals from "@/pages/admin/AdminAppeals";
import AdminCircles from "@/pages/admin/AdminCircles";
import DatingIntakePage from "@/pages/DatingIntakePage";
import SlowDatingPage from "@/pages/SlowDatingPage";
import SlowDatingLandingPage from "@/pages/SlowDatingLandingPage";
import AppealPage from "@/pages/AppealPage";
import ConnectedCirclePage from "@/pages/ConnectedCirclePage";
import ConnectedCircleDirectoryPage from "@/pages/ConnectedCircleDirectoryPage";
import PortalBusiness from "@/pages/portal/PortalBusiness";
import AdminBusinesses from "@/pages/admin/AdminBusinesses";
import DateConfirmationPage from "@/pages/DateConfirmationPage";
import CirclesPage from "@/pages/CirclesPage";
import TheGentlemenPage from "@/pages/circles/TheGentlemenPage";
import LesAmisPage from "@/pages/circles/LesAmisPage";
import HealthCheckPage from "@/pages/HealthCheckPage";

const queryClient = new QueryClient();

// Slow Dating subdomain routes - focused experience for dating users
const SlowDatingRoutes = () => (
  <Routes>
    <Route path="/" element={<SlowDatingLandingPage />} />
    <Route path="/portal/slow-dating" element={<PortalLayout><PortalSlowDating /></PortalLayout>} />
    <Route path="/portal/match/:matchId" element={<PortalLayout><PortalMatchDetail /></PortalLayout>} />
    <Route path="/portal/profile" element={<PortalLayout><PortalProfile /></PortalLayout>} />
    <Route path="/portal/billing" element={<PortalLayout><PortalBilling /></PortalLayout>} />
    <Route path="/dating/apply" element={<Layout><DatingIntakePage /></Layout>} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/auth/callback" element={<AuthCallbackPage />} />
    <Route path="/auth/waiting" element={<AuthWaitingPage />} />
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
    <Route path="/connected-circle" element={<ConnectedCirclePage />} />
    <Route path="/connected-circle/directory" element={<ConnectedCircleDirectoryPage />} />
    <Route path="/business" element={<Layout><BusinessDirectoryPage /></Layout>} />
    <Route path="/circles" element={<CirclesPage />} />
    <Route path="/circles/the-gentlemen" element={<TheGentlemenPage />} />
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
    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
    
    {/* Date confirmation (public route with token) */}
    <Route path="/confirm-date/:token" element={<DateConfirmationPage />} />
    
    {/* Portal routes with portal layout */}
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
    
    <Route path="*" element={<Layout><NotFound /></Layout>} />
  </Routes>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <ScrollToTop />
              {isSlowDatingSubdomain() ? <SlowDatingRoutes /> : <MainRoutes />}
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
