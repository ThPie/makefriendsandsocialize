import { ReactNode, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  LogOut,
  Loader2,
  ArrowLeft,
  Headphones,
  Shield,
  ShieldAlert,
  Calendar,
  Image,
  Settings,
  UserCog,
  Quote,
  HeartHandshake,
  TrendingUp,
  Home,
  Target,
  Gift,
  Scale,
  ClipboardList,
  Microscope,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';
import { MFAGuard } from './MFAGuard';
import { RateLimitIndicator } from './RateLimitIndicator';
import { PortalBreadcrumb } from '../portal/PortalBreadcrumb';
import { InactivityWarningModal } from '@/components/auth/InactivityWarningModal';
import { BrandLogo } from '@/components/common/BrandLogo';
import { SkipLink } from '@/components/ui/skip-link';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard, sensitive: false, endpoint: null },
  { title: 'Applications', url: '/admin/applications', icon: FileText, sensitive: true, endpoint: 'applications' },
  { title: 'Circle Applications', url: '/admin/circles', icon: Users, sensitive: false, endpoint: null },
  { title: 'Members', url: '/admin/members', icon: Users, sensitive: true, endpoint: 'members' },
  { title: 'Appeals', url: '/admin/appeals', icon: Scale, sensitive: true, endpoint: 'applications' },
  { title: 'Referrals', url: '/admin/referrals', icon: Gift, sensitive: true, endpoint: 'referrals' },
  { title: 'Founder Companies', url: '/admin/businesses', icon: Users, sensitive: true, endpoint: 'businesses' },
  { title: 'Lead Generation', url: '/admin/leads', icon: Target, sensitive: true, endpoint: 'leads' },
  { title: 'Security Reports', url: '/admin/security', icon: ShieldAlert, sensitive: true, endpoint: 'security' },
  { title: 'Security Dashboard', url: '/admin/security-dashboard', icon: Shield, sensitive: true, endpoint: 'security' },
  { title: 'Introductions', url: '/admin/dating', icon: HeartHandshake, sensitive: true, endpoint: 'dating' },
  { title: 'Review Queue', url: '/admin/dating/review', icon: ClipboardList, sensitive: true, endpoint: 'dating' },
  { title: 'Matches', url: '/admin/matches', icon: Heart, sensitive: true, endpoint: 'dating' },
  { title: 'Analytics', url: '/admin/analytics', icon: TrendingUp, sensitive: false, endpoint: null },
  { title: 'Events', url: '/admin/events', icon: Calendar, sensitive: false, endpoint: null },
  { title: 'Event Analytics', url: '/admin/event-analytics', icon: TrendingUp, sensitive: false, endpoint: null },
  { title: 'Event Photos', url: '/admin/photos', icon: Image, sensitive: false, endpoint: null },
  { title: 'Connections', url: '/admin/connections', icon: UserCog, sensitive: false, endpoint: null },
  { title: 'Testimonials', url: '/admin/testimonials', icon: Quote, sensitive: false, endpoint: null },
  { title: 'Concierge', url: '/admin/concierge', icon: Headphones, sensitive: false, endpoint: null },
  { title: 'Content', url: '/admin/content', icon: Image, sensitive: false, endpoint: null },
  { title: 'Research', url: '/admin/research', icon: Microscope, sensitive: false, endpoint: null },
  { title: 'Roles', url: '/admin/roles', icon: Shield, sensitive: true, endpoint: 'security' },
  { title: 'Settings', url: '/admin/settings', icon: Settings, sensitive: false, endpoint: null },
];

// Routes that require MFA verification
const SENSITIVE_ROUTES = [
  '/admin/applications',
  '/admin/members',
  '/admin/appeals',
  '/admin/referrals',
  '/admin/businesses',
  '/admin/leads',
  '/admin/security',
  '/admin/security-dashboard',
  '/admin/dating',
  '/admin/dating/review',
  '/admin/matches',
  '/admin/roles',
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isLoading, signOut } = useAuth();

  // Determine if current page requires MFA
  const requiresMFA = useMemo(() => {
    return SENSITIVE_ROUTES.some(route => location.pathname.startsWith(route));
  }, [location.pathname]);

  // Determine current endpoint for rate limiting
  const currentEndpoint = useMemo(() => {
    const currentItem = menuItems.find(item => location.pathname.startsWith(item.url) && item.url !== '/admin');
    return currentItem?.endpoint || null;
  }, [location.pathname]);

  // Inactivity logout - 2 hours for admin (longer due to complex work)
  const { showWarning, remainingSeconds, dismissWarning } = useInactivityLogout({
    timeoutMinutes: 120,
    warningMinutes: 5,
    onLogout: () => {
      signOut();
      navigate('/auth');
    },
    enabled: !!user && isAdmin,
  });
  // Note: ProtectedRoute (requireAdmin) already guarantees user is authenticated
  // and has admin privileges. No useEffect redirect needed.

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-muted mx-auto" />
          <div className="h-3 w-24 rounded bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <>
      {/* Inactivity Warning Modal */}
      <InactivityWarningModal
        isOpen={showWarning}
        remainingSeconds={remainingSeconds}
        onStayLoggedIn={dismissWarning}
        onLogoutNow={handleSignOut}
      />

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <SkipLink />
          <Sidebar className="border-r border-border" aria-label="Admin Sidebar">
            <SidebarHeader className="p-4 border-b border-border">
              <Link to="/" className="flex items-center gap-3 mb-3">
                <BrandLogo className="h-10 w-auto" width={120} height={40} />
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </Link>
              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/20 transition-colors text-sm font-medium"
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Website</span>
                </Link>
                <Link
                  to="/portal"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Portal</span>
                </Link>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => {
                      const isActive = location.pathname === item.url;

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <Link
                              to={item.url}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${isActive
                                ? 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border-l-2 border-[hsl(var(--accent-gold))] font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span className="flex-1">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

            </SidebarContent>

            <div className="p-4 mt-auto border-t border-border">
              {currentEndpoint && (
                <div className="mb-3 px-2">
                  <RateLimitIndicator endpoint={currentEndpoint} compact />
                </div>
              )}
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </Sidebar>

          <main id="main-content" className="flex-1 overflow-auto">
            <header className="sticky top-0 z-40 flex items-center h-16 px-4 border-b border-border bg-background/95 backdrop-blur md:hidden">
              <SidebarTrigger />
              <BrandLogo className="ml-3 h-8 w-auto" height={32} width={96} />
              <Shield className="ml-2 h-4 w-4 text-[hsl(var(--accent-gold))]" />
            </header>

            <div className="p-6 md:p-8 lg:p-10">
              <div>
                {/* Breadcrumb Navigation */}
                <PortalBreadcrumb type="admin" />

                <PageTransition>
                  <MFAGuard requireMFA={requiresMFA}>
                    {children}
                  </MFAGuard>
                </PageTransition>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
