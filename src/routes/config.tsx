import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy imports for all pages
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
const ThePartnersPage = lazy(() => import("@/pages/circles/ThePartnersPage"));
const ThePursuitsPage = lazy(() => import("@/pages/circles/ThePursuitsPage"));
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
const TheExchangePage = lazy(() => import("@/pages/circles/TheExchangePage"));
const HostApplicationPage = lazy(() => import("@/pages/HostApplicationPage"));
const HealthCheckPage = lazy(() => import("@/pages/HealthCheckPage"));
const PortalOnboarding = lazy(() => import("@/pages/portal/PortalOnboarding"));
const PortalPerks = lazy(() => import("@/pages/portal/PortalPerks"));
const PortalConcierge = lazy(() => import("@/pages/portal/PortalConcierge"));
const PortalEventCheckin = lazy(() => import("@/pages/portal/PortalEventCheckin"));
const AdminPerks = lazy(() => import("@/pages/admin/AdminPerks"));
const AdminConcierge = lazy(() => import("@/pages/admin/AdminConcierge"));
const AdminDatingReview = lazy(() => import("@/pages/admin/AdminDatingReview"));
const AdminResearch = lazy(() => import("@/pages/admin/AdminResearch"));
const PortalSecurity = lazy(() => import("@/pages/portal/PortalSecurity"));
const SoulMapsPage = lazy(() => import("@/pages/SoulMapsPage"));
const SoulMapsQuizPage = lazy(() => import("@/pages/SoulMapsQuizPage"));

// Slow Dating subdomain routes
export const SlowDatingRoutes = () => (
    <Routes>
        <Route path="/" element={<SlowDatingLandingPage />} />
        <Route path="/portal/onboarding" element={<PortalOnboarding />} />
        <Route path="/portal/slow-dating" element={<PortalLayout><PortalSlowDating /></PortalLayout>} />
        <Route path="/portal/match/:matchId" element={<PortalLayout><PortalMatchDetail /></PortalLayout>} />
        <Route path="/portal/profile" element={<PortalLayout><PortalProfile /></PortalLayout>} />
        <Route path="/portal/billing" element={<PortalLayout><PortalBilling /></PortalLayout>} />
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

// Main domain routes
export const MainRoutes = () => (
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
        <Route path="/slow-dating" element={<Layout><SlowDatingPage /></Layout>} />
        <Route path="/founders-circle" element={<Layout><ConnectedCirclePage /></Layout>} />
        <Route path="/founders-circle/directory" element={<Layout><ConnectedCircleDirectoryPage /></Layout>} />
        {/* Redirects from old URLs for SEO */}
        <Route path="/blog" element={<Navigate to="/journal" replace />} />
        <Route path="/blog/:id" element={<Navigate to="/journal" replace />} />
        <Route path="/connected-circle" element={<Navigate to="/founders-circle" replace />} />
        <Route path="/connected-circle/directory" element={<Navigate to="/founders-circle/directory" replace />} />
        {/* Connected Circle / Founders Circle Routing */}
        <Route path="/circles" element={<Layout><CirclesPage /></Layout>} />
        <Route path="/circles/the-gentlemen" element={<Layout><TheGentlemenPage /></Layout>} />
        <Route path="/circles/the-ladies-society" element={<Layout><TheLadiesSocietyPage /></Layout>} />
        <Route path="/circles/les-amis" element={<Layout><LesAmisPage /></Layout>} />
        <Route path="/circles/the-partners" element={<Layout><ThePartnersPage /></Layout>} />
        <Route path="/circles/couples-circle" element={<Layout><ThePartnersPage /></Layout>} />
        <Route path="/circles/the-pursuits" element={<Layout><ThePursuitsPage /></Layout>} />
        <Route path="/circles/active-outdoor" element={<Layout><ThePursuitsPage /></Layout>} />
        <Route path="/circles/the-exchange" element={<Layout><TheExchangePage /></Layout>} />
        <Route path="/become-a-host" element={<Layout><HostApplicationPage /></Layout>} />
        <Route path="/appeal" element={<Layout><AppealPage /></Layout>} />
        <Route path="/soul-maps" element={<Layout><SoulMapsPage /></Layout>} />
        <Route path="/soul-maps/attachment-style" element={<Layout><SoulMapsQuizPage /></Layout>} />

        {/* Health check endpoint for deployment verification */}
        <Route path="/health" element={<HealthCheckPage />} />

        {/* Dev testing route for subdomain landing page */}
        {import.meta.env.DEV && (
            <Route path="/dev/slowdating-landing" element={<SlowDatingLandingPage />} />
        )}

        {/* Auth routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/waiting" element={<AuthWaitingPage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Date confirmation (public route with token) */}
        <Route path="/confirm-date/:token" element={<DateConfirmationPage />} />

        {/* Portal routes with portal layout — ProtectedRoute blocks rendering until auth confirmed */}
        <Route path="/portal/onboarding" element={<ProtectedRoute><PortalOnboarding /></ProtectedRoute>} />
        <Route path="/portal" element={<ProtectedRoute><PortalLayout><PortalDashboard /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/profile" element={<ProtectedRoute><PortalLayout><PortalProfile /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/network" element={<ProtectedRoute><PortalLayout><PortalNetwork /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/connections" element={<ProtectedRoute><PortalLayout><PortalConnections /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/slow-dating" element={<ProtectedRoute><PortalLayout><PortalSlowDating /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/match/:matchId" element={<ProtectedRoute><PortalLayout><PortalMatchDetail /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/events" element={<ProtectedRoute><PortalLayout><PortalEvents /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/billing" element={<ProtectedRoute><PortalLayout><PortalBilling /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/referrals" element={<ProtectedRoute><PortalLayout><PortalReferrals /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/business" element={<ProtectedRoute><PortalLayout><PortalBusiness /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/perks" element={<ProtectedRoute><PortalLayout><PortalPerks /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/concierge" element={<ProtectedRoute><PortalLayout><PortalConcierge /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/security" element={<ProtectedRoute><PortalLayout><PortalSecurity /></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/checkin/:eventId/:code" element={<ProtectedRoute><PortalEventCheckin /></ProtectedRoute>} />

        {/* Dating intake route */}
        <Route path="/dating/apply" element={<Layout><DatingIntakePage /></Layout>} />

        {/* Admin routes with admin layout — ProtectedRoute requireAdmin blocks non-admin access */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute requireAdmin><AdminLayout><AdminApplications /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/members" element={<ProtectedRoute requireAdmin><AdminLayout><AdminMembers /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute requireAdmin><AdminLayout><AdminLeads /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/security" element={<ProtectedRoute requireAdmin><AdminLayout><AdminSecurityReports /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/security-dashboard" element={<ProtectedRoute requireAdmin><AdminLayout><AdminSecurityDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/dating" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDating /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/dating/:id" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDatingProfile /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/matches" element={<ProtectedRoute requireAdmin><AdminLayout><AdminMatches /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/event-analytics" element={<ProtectedRoute requireAdmin><AdminLayout><AdminEventAnalytics /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute requireAdmin><AdminLayout><AdminEvents /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/photos" element={<ProtectedRoute requireAdmin><AdminLayout><AdminPhotos /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/connections" element={<ProtectedRoute requireAdmin><AdminLayout><AdminConnections /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/testimonials" element={<ProtectedRoute requireAdmin><AdminLayout><AdminTestimonials /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute requireAdmin><AdminLayout><AdminContent /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/roles" element={<ProtectedRoute requireAdmin><AdminLayout><AdminRoles /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/referrals" element={<ProtectedRoute requireAdmin><AdminLayout><AdminReferrals /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/appeals" element={<ProtectedRoute requireAdmin><AdminLayout><AdminAppeals /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/circles" element={<ProtectedRoute requireAdmin><AdminLayout><AdminCircles /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/businesses" element={<ProtectedRoute requireAdmin><AdminLayout><AdminBusinesses /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/perks" element={<ProtectedRoute requireAdmin><AdminLayout><AdminPerks /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/concierge" element={<ProtectedRoute requireAdmin><AdminLayout><AdminConcierge /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/dating/review" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDatingReview /></AdminLayout></ProtectedRoute>} />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
);
