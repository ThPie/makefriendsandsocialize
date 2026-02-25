import { ReactNode, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTierDisplayName } from '@/lib/tier-utils';
import { useSubscription } from '@/hooks/useSubscription';

// Import sidebar components directly — they're small and needed immediately for layout
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
} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  User,
  Users,
  Heart,
  Calendar,
  LogOut,
  Loader2,
  Crown,
  Shield,
  Home,
  Gift,
  Mail
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { TrialCountdownBanner } from './TrialCountdownBanner';
import { PageTransition } from '@/components/ui/page-transition';
import { BrandLogo } from '@/components/common/BrandLogo';
import { PendingMemberBanner } from './PendingMemberBanner';
import { PortalBreadcrumb } from './PortalBreadcrumb';
import { canAccessProtectedFeatures, getRestrictedRoutesForPending } from '@/lib/auth-redirect';
const MobileDashboardNav = lazy(() => import('./MobileDashboardNav').then(module => ({ default: module.MobileDashboardNav })));
import { SkipLink } from '@/components/ui/skip-link';
import { PortalBottomNav } from './PortalBottomNav';

interface PortalLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Dashboard', url: '/portal', icon: LayoutDashboard, requiresApproval: false },
  { title: 'My Profile', url: '/portal/profile', icon: User, requiresApproval: false },
  { title: 'The Network', url: '/portal/network', icon: Users, requiresApproval: true },
  { title: 'Connections', url: '/portal/connections', icon: Heart, requiresApproval: true },
  { title: 'Intentional Connections', url: '/portal/slow-dating', icon: Heart, requiresApproval: true },
  { title: 'Founder Profile', url: '/portal/business', icon: Users, requiresApproval: false },
  { title: 'Events', url: '/portal/events', icon: Calendar, requiresApproval: false },
  { title: 'Perks', url: '/portal/perks', icon: Gift, requiresApproval: false },
  { title: 'Concierge', url: '/portal/concierge', icon: Crown, requiresApproval: true },
  { title: 'Referrals', url: '/portal/referrals', icon: Gift, requiresApproval: false },
];

export function PortalLayout({ children }: PortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, membership, applicationStatus, isLoading, isAdmin, signOut } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();

  // Memoize menu items to prevent re-creation on every render
  const memoizedMenuItems = useMemo(() => menuItems, []);

  const isApproved = canAccessProtectedFeatures({
    applicationStatus,
    membershipStatus: membership?.status || null,
  });
  const isPending = applicationStatus === 'pending' && !isApproved;
  const restrictedRoutes = getRestrictedRoutesForPending();

  useEffect(() => {
    // ProtectedRoute already guarantees user is authenticated.
    // These are business-logic redirects only.

    // Check if onboarding is complete first
    if (!isLoading && profile && !profile.onboarding_completed) {
      navigate('/portal/onboarding');
      return;
    }

    // If pending and trying to access restricted routes, redirect
    if (!isLoading && user && isPending && restrictedRoutes.includes(location.pathname)) {
      navigate('/portal');
    }
  }, [user, profile, applicationStatus, isLoading, navigate, isPending, location.pathname]);

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

  if (!user) {
    return null;
  }

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user.email?.[0]?.toUpperCase() || 'M';

  const tierBadge = membership?.tier ? (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${membership.tier === 'founder'
      ? 'bg-primary/20 text-primary'
      : membership.tier === 'fellow'
        ? 'bg-accent/20 text-accent-foreground'
        : 'bg-muted text-muted-foreground'
      }`}>
      {membership.tier === 'founder' && <Crown className="h-3 w-3" />}
      {getTierDisplayName(membership.tier)}
    </span>
  ) : null;

  return (
    <>

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <SkipLink />
            <Sidebar className="border-r border-border" aria-label="Portal Sidebar">
              <SidebarHeader className="p-4 border-b border-border">
                <Link to="/" className="block mb-3">
                  <BrandLogo className="h-10 w-auto" width={120} height={40} />
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/20 transition-colors text-sm font-medium"
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Website</span>
                </Link>
              </SidebarHeader>

              <SidebarContent className="p-4">
                {/* Profile Section */}
                <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_urls?.[0]} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.first_name || 'Member'}
                    </p>
                    {tierBadge}
                  </div>
                </div>

                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {memoizedMenuItems.map((item) => {
                        const isActive = location.pathname === item.url;
                        const isPatronRestricted = (item.url === '/portal/network' || item.url === '/portal/connections')
                          && membership?.tier === 'patron';
                        const isPendingRestricted = item.requiresApproval && isPending;
                        const isRestricted = isPatronRestricted || isPendingRestricted;

                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                              <Link
                                to={isRestricted ? '#' : item.url}
                                onClick={(e) => isRestricted && e.preventDefault()}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                  ? 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                  } ${isRestricted ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <item.icon className="h-5 w-5" />
                                <span>{item.title}</span>
                                {isRestricted && (
                                  <Crown className="h-3 w-3 ml-auto text-[hsl(var(--accent-gold))]" />
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {/* Admin Link */}
                {isAdmin && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/10 transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </div>
                )}
              </SidebarContent>

              {/* Sign Out */}
              <div className="p-4 mt-auto border-t border-border">
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

            <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
              {/* Desktop Top Bar */}
              <header className="hidden md:flex items-center justify-between h-20 px-8 border-b border-border bg-background/95 backdrop-blur z-40">
                <div className="flex-1" />

                <div className="flex items-center gap-6 ml-4">
                  <NotificationBell />
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Mail className="h-5 w-5" />
                  </Button>

                  <div className="h-8 w-px bg-border/50 mx-2" />

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-medium leading-none">{profile?.first_name || 'Member'}</p>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold text-[10px]">
                        {getTierDisplayName(membership?.tier)} Member
                      </p>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={profile?.avatar_urls?.[0]} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </header>

              {/* Mobile Header — Stitch style */}
              <header
                className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b border-border/30 bg-background/95 backdrop-blur-lg md:hidden"
                style={{ paddingTop: 'var(--safe-top, 0px)' }}
              >
                <div className="flex items-center gap-3">
                  <Link to="/" className="flex items-center gap-2">
                    <BrandLogo className="h-8 w-auto" height={32} width={96} />
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src={profile?.avatar_urls?.[0]} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </header>

              <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 scroll-smooth scroll-touch pb-bottom-nav md:pb-8 lg:pb-8">
                <div className="max-w-[1200px] mx-auto space-y-8">
                  {/* Pending Member Banner */}
                  {isPending && <PendingMemberBanner className="mb-6" />}

                  {/* Trial Countdown Banner */}
                  <TrialCountdownBanner subscription={subscription} isLoading={subscriptionLoading} />

                  {/* Mobile Dashboard Navigation */}
                  {location.pathname === '/portal' && (
                    <Suspense fallback={<div className="h-24 w-full bg-muted/20 animate-pulse rounded-lg mb-8" />}>
                      <MobileDashboardNav onSignOut={handleSignOut} className="mb-8" />
                    </Suspense>
                  )}

                  {/* Breadcrumb Navigation */}
                  <div className={location.pathname === '/portal' ? 'hidden' : 'block mb-6'}>
                    <PortalBreadcrumb type="portal" />
                  </div>

                  <PageTransition>
                    {children}
                  </PageTransition>
                </div>
              </div>

              {/* Mobile Bottom Navigation */}
              <PortalBottomNav />
            </main>
          </div>
        </SidebarProvider>
      </Suspense>
    </>
  );
}
