import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import AuthWaitingPage from "@/pages/AuthWaitingPage";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import PortalProfile from "@/pages/portal/PortalProfile";
import PortalNetwork from "@/pages/portal/PortalNetwork";
import PortalConnections from "@/pages/portal/PortalConnections";
import PortalEvents from "@/pages/portal/PortalEvents";
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
import DatingIntakePage from "@/pages/DatingIntakePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              
              {/* Auth routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/waiting" element={<AuthWaitingPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/waiting" element={<AuthWaitingPage />} />
              
              {/* Portal routes with portal layout */}
              <Route path="/portal" element={<PortalLayout><PortalDashboard /></PortalLayout>} />
              <Route path="/portal/profile" element={<PortalLayout><PortalProfile /></PortalLayout>} />
              <Route path="/portal/network" element={<PortalLayout><PortalNetwork /></PortalLayout>} />
              <Route path="/portal/connections" element={<PortalLayout><PortalConnections /></PortalLayout>} />
              <Route path="/portal/events" element={<PortalLayout><PortalEvents /></PortalLayout>} />
              
              {/* Dating intake route */}
              <Route path="/dating/apply" element={<DatingIntakePage />} />
              
              {/* Admin routes with admin layout */}
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/applications" element={<AdminLayout><AdminApplications /></AdminLayout>} />
              <Route path="/admin/members" element={<AdminLayout><AdminMembers /></AdminLayout>} />
              <Route path="/admin/dating" element={<AdminLayout><AdminDating /></AdminLayout>} />
              <Route path="/admin/dating/:id" element={<AdminLayout><AdminDatingProfile /></AdminLayout>} />
              <Route path="/admin/events" element={<AdminLayout><AdminEvents /></AdminLayout>} />
              <Route path="/admin/connections" element={<AdminLayout><AdminConnections /></AdminLayout>} />
              <Route path="/admin/testimonials" element={<AdminLayout><AdminTestimonials /></AdminLayout>} />
              <Route path="/admin/content" element={<AdminLayout><AdminContent /></AdminLayout>} />
              <Route path="/admin/roles" element={<AdminLayout><AdminRoles /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
              
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
