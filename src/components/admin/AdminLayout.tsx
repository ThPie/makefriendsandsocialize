import { ReactNode, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ADMIN_BASE } from '@/lib/route-paths';
import { useAuth } from '@/contexts/AuthContext';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  LogOut,
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
  Headphones,
  ChevronDown,
  User,
  ArrowLeft,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';
import { MFAGuard } from './MFAGuard';
import { RateLimitIndicator } from './RateLimitIndicator';
import { PortalBreadcrumb } from '../portal/PortalBreadcrumb';
import { InactivityWarningModal } from '@/components/auth/InactivityWarningModal';
import { BrandLogo } from '@/components/common/BrandLogo';
import { SkipLink } from '@/components/ui/skip-link';
import { AdminCommandPalette, AdminCommandTrigger } from './AdminCommandPalette';

interface AdminLayoutProps {
  children: ReactNode;
}

// Sidebar items grouped into 4 sections
const sidebarSections = [
  {
    label: 'Users & Apps',
    items: [
      { title: 'Overview', url: ADMIN_BASE, icon: LayoutDashboard, sensitive: false, endpoint: null },
      { title: 'Applications', url: `${ADMIN_BASE}/applications`, icon: FileText, sensitive: true, endpoint: 'applications' },
      { title: 'Circle Applications', url: `${ADMIN_BASE}/circles`, icon: Users, sensitive: false, endpoint: null },
      { title: 'Members', url: `${ADMIN_BASE}/members`, icon: Users, sensitive: true, endpoint: 'members' },
      { title: 'Appeals', url: `${ADMIN_BASE}/appeals`, icon: Scale, sensitive: true, endpoint: 'applications' },
      { title: 'Founder Companies', url: `${ADMIN_BASE}/businesses`, icon: Users, sensitive: true, endpoint: 'businesses' },
    ],
  },
  {
    label: 'Engagement & Events',
    items: [
      { title: 'Events', url: `${ADMIN_BASE}/events`, icon: Calendar, sensitive: false, endpoint: null },
      { title: 'Event Analytics', url: `${ADMIN_BASE}/event-analytics`, icon: TrendingUp, sensitive: false, endpoint: null },
      { title: 'Event Photos', url: `${ADMIN_BASE}/photos`, icon: Image, sensitive: false, endpoint: null },
      { title: 'Slow Dating', url: `${ADMIN_BASE}/dating`, icon: HeartHandshake, sensitive: true, endpoint: 'dating' },
      { title: 'Review Queue', url: `${ADMIN_BASE}/dating/review`, icon: ClipboardList, sensitive: true, endpoint: 'dating' },
      { title: 'Matches', url: `${ADMIN_BASE}/matches`, icon: Heart, sensitive: true, endpoint: 'dating' },
      { title: 'Testimonials', url: `${ADMIN_BASE}/testimonials`, icon: Quote, sensitive: false, endpoint: null },
      { title: 'Concierge', url: `${ADMIN_BASE}/concierge`, icon: Headphones, sensitive: false, endpoint: null },
    ],
  },
  {
    label: 'Security & Safety',
    items: [
      { title: 'Security Reports', url: `${ADMIN_BASE}/security`, icon: ShieldAlert, sensitive: true, endpoint: 'security' },
      { title: 'Security Dashboard', url: `${ADMIN_BASE}/security-dashboard`, icon: Shield, sensitive: true, endpoint: 'security' },
      { title: 'Roles', url: `${ADMIN_BASE}/roles`, icon: Shield, sensitive: true, endpoint: 'security' },
    ],
  },
  {
    label: 'System Insights',
    items: [
      { title: 'Analytics', url: `${ADMIN_BASE}/analytics`, icon: TrendingUp, sensitive: false, endpoint: null },
      { title: 'Content', url: `${ADMIN_BASE}/content`, icon: Image, sensitive: false, endpoint: null },
      { title: 'Research', url: `${ADMIN_BASE}/research`, icon: Microscope, sensitive: false, endpoint: null },
      { title: 'Settings', url: `${ADMIN_BASE}/settings`, icon: Settings, sensitive: false, endpoint: null },
    ],
  },
];

// Flatten for lookups
const allMenuItems = sidebarSections.flatMap((s) => s.items);

// Routes that require MFA verification
const SENSITIVE_ROUTES = allMenuItems
  .filter((item) => item.sensitive)
  .map((item) => item.url);

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isLoading, signOut } = useAuth();

  // Determine if current page requires MFA
  const requiresMFA = useMemo(() => {
    return SENSITIVE_ROUTES.some((route) => location.pathname.startsWith(route));
  }, [location.pathname]);

  // Determine current endpoint for rate limiting
  const currentEndpoint = useMemo(() => {
    const currentItem = allMenuItems.find(
      (item) => location.pathname.startsWith(item.url) && item.url !== ADMIN_BASE
    );
    return currentItem?.endpoint || null;
  }, [location.pathname]);

  // Which sections should be open by default (the one containing the active route)
  const defaultOpenSections = useMemo(() => {
    const openSet = new Set<string>();
    for (const section of sidebarSections) {
      if (section.items.some((item) => location.pathname === item.url || (item.url !== ADMIN_BASE && location.pathname.startsWith(item.url)))) {
        openSet.add(section.label);
      }
    }
    // Always open the first section if nothing matches
    if (openSet.size === 0) openSet.add(sidebarSections[0].label);
    return openSet;
  }, [location.pathname]);

  // Inactivity logout
  const { showWarning, remainingSeconds, dismissWarning } = useInactivityLogout({
    timeoutMinutes: 120,
    warningMinutes: 5,
    onLogout: () => {
      signOut();
      navigate('/auth');
    },
    enabled: !!user && isAdmin,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-muted mx-auto" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const userInitial = user.email?.charAt(0).toUpperCase() || 'A';

  return (
    <>
      <InactivityWarningModal
        isOpen={showWarning}
        remainingSeconds={remainingSeconds}
        onStayLoggedIn={dismissWarning}
        onLogoutNow={handleSignOut}
      />
      <AdminCommandPalette />

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
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-medium"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Homepage</span>
                </Link>
                <Link
                  to="/portal"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Member Portal</span>
                </Link>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-2 overflow-y-auto">
              {sidebarSections.map((section) => (
                <AdminSidebarSection
                  key={section.label}
                  label={section.label}
                  items={section.items}
                  currentPath={location.pathname}
                  defaultOpen={defaultOpenSections.has(section.label)}
                />
              ))}
            </SidebarContent>

            <div className="p-3 mt-auto border-t border-border space-y-2">
              {currentEndpoint && (
                <div className="px-2">
                  <RateLimitIndicator endpoint={currentEndpoint} compact />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Sidebar>

          <main id="main-content" className="flex-1 overflow-auto flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 flex items-center h-14 px-4 border-b border-border bg-background/95 backdrop-blur gap-3">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center">
                <SidebarTrigger />
              </div>

              {/* Global Search */}
              <div className="flex-1 flex items-center justify-center">
                <AdminCommandTrigger className="w-full max-w-sm" />
              </div>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-xs text-muted-foreground max-w-[140px] truncate">
                      {user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/portal/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`${ADMIN_BASE}/settings`)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            <div className="flex-1 p-6 md:p-8 lg:p-10">
              <PortalBreadcrumb type="admin" />
              <PageTransition>
                <MFAGuard requireMFA={requiresMFA}>
                  {children}
                </MFAGuard>
              </PageTransition>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}

// Collapsible sidebar section
interface AdminSidebarSectionProps {
  label: string;
  items: typeof sidebarSections[0]['items'];
  currentPath: string;
  defaultOpen: boolean;
}

function AdminSidebarSection({ label, items, currentPath, defaultOpen }: AdminSidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Check if any item in this section is active
  const hasActiveItem = items.some(
    (item) => currentPath === item.url || (item.url !== ADMIN_BASE && currentPath.startsWith(item.url))
  );

  return (
    <Collapsible open={isOpen || hasActiveItem} onOpenChange={setIsOpen}>
      <SidebarGroup>
        <CollapsibleTrigger className="w-full">
          <SidebarGroupLabel className="flex items-center justify-between px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground cursor-pointer">
            <span>{label}</span>
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${
                isOpen || hasActiveItem ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = currentPath === item.url;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors text-[13px] ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
