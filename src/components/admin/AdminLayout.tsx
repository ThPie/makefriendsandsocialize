import { ReactNode, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Lock,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';
import { MFAGuard } from './MFAGuard';
import { RateLimitIndicator } from './RateLimitIndicator';
import logo from '@/assets/logo-transparent.png';

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
  { title: 'Businesses', url: '/admin/businesses', icon: Users, sensitive: true, endpoint: 'businesses' },
  { title: 'Lead Generation', url: '/admin/leads', icon: Target, sensitive: true, endpoint: 'leads' },
  { title: 'Security Reports', url: '/admin/security', icon: ShieldAlert, sensitive: true, endpoint: 'security' },
  { title: 'Security Dashboard', url: '/admin/security-dashboard', icon: Shield, sensitive: true, endpoint: 'security' },
  { title: 'Introductions', url: '/admin/dating', icon: HeartHandshake, sensitive: true, endpoint: 'dating' },
  { title: 'Matches', url: '/admin/matches', icon: Heart, sensitive: true, endpoint: 'dating' },
  { title: 'Analytics', url: '/admin/analytics', icon: TrendingUp, sensitive: false, endpoint: null },
  { title: 'Events', url: '/admin/events', icon: Calendar, sensitive: false, endpoint: null },
  { title: 'Event Analytics', url: '/admin/event-analytics', icon: TrendingUp, sensitive: false, endpoint: null },
  { title: 'Photos', url: '/admin/photos', icon: Image, sensitive: false, endpoint: null },
  { title: 'Connections', url: '/admin/connections', icon: UserCog, sensitive: false, endpoint: null },
  { title: 'Testimonials', url: '/admin/testimonials', icon: Quote, sensitive: false, endpoint: null },
  { title: 'Content', url: '/admin/content', icon: Image, sensitive: false, endpoint: null },
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

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
    
    if (!isLoading && user && !isAdmin) {
      navigate('/portal');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-3 mb-3">
              <img src={logo} alt="Make Friends & Socialize" width={120} height={40} loading="lazy" decoding="async" className="h-10 w-auto" />
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </Link>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
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
                    
                    const isSensitive = item.sensitive;
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.url}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="flex-1">{item.title}</span>
                            {isSensitive && <Lock className="h-3 w-3 text-muted-foreground" />}
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

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 flex items-center h-16 px-4 border-b border-border bg-background/95 backdrop-blur md:hidden">
            <SidebarTrigger />
            <img src={logo} alt="Make Friends & Socialize" className="ml-3 h-8 w-auto" />
            <Shield className="ml-2 h-4 w-4 text-primary" />
          </header>

          <div className="p-6 md:p-8 lg:p-10">
            <PageTransition>
              <MFAGuard requireMFA={requiresMFA}>
                {children}
              </MFAGuard>
            </PageTransition>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
