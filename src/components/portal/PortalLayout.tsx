import { ReactNode, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useNativeAppContext } from '@/components/native/NativeAppProvider';
import { useAuth } from '@/contexts/AuthContext';
import { getTierDisplayName } from '@/lib/tier-utils';
import { useSubscription } from '@/hooks/useSubscription';

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
} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  House,
  SquaresFour,
  UserCircle,
  UsersThree,
  Handshake,
  HeartStraight,
  CalendarBlank,
  Gift,
  Crown,
  ShieldCheck,
  Buildings,
  Headset,
  SignOut,
  ArrowLeft,
} from '@phosphor-icons/react';
import { NotificationBell } from './NotificationBell';
import { TrialCountdownBanner } from './TrialCountdownBanner';
import { PageTransition } from '@/components/ui/page-transition';
import { NativePageTransition } from '@/components/native/NativePageTransition';
import { SwipeBack } from '@/components/native/SwipeBack';
import { BrandLogo } from '@/components/common/BrandLogo';
import { PendingMemberBanner } from './PendingMemberBanner';
import { PortalBreadcrumb } from './PortalBreadcrumb';
import { canAccessProtectedFeatures, getRestrictedRoutesForPending } from '@/lib/auth-redirect';
import { ADMIN_BASE } from '@/lib/route-paths';
const MobileDashboardNav = lazy(() => import('./MobileDashboardNav').then(module => ({ default: module.MobileDashboardNav })));
import { SkipLink } from '@/components/ui/skip-link';
import { PortalBottomNav } from './PortalBottomNav';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortalLayoutProps {
  children: ReactNode;
}

// Grouped navigation structure
const navGroups = [
  {
    label: 'Personal',
    items: [
      { title: 'Dashboard', url: '/portal', icon: SquaresFour, requiresApproval: false },
      { title: 'My Profile', url: '/portal/profile', icon: UserCircle, requiresApproval: false },
      { title: 'Connections', url: '/portal/connections', icon: Handshake, requiresApproval: true },
      { title: 'Slow Dating', url: '/portal/slow-dating', icon: HeartStraight, requiresApproval: true },
    ],
  },
  {
    label: 'Explore',
    items: [
      { title: 'The Network', url: '/portal/network', icon: UsersThree, requiresApproval: true },
      { title: 'Events', url: '/portal/events', icon: CalendarBlank, requiresApproval: false },
      { title: 'Perks', url: '/portal/perks', icon: Gift, requiresApproval: false },
      { title: 'Referrals', url: '/portal/referrals', icon: Gift, requiresApproval: false },
    ],
  },
  {
    label: 'Support',
    items: [
      { title: 'Concierge', url: '/portal/concierge', icon: Headset, requiresApproval: true },
      { title: 'Founder Profile', url: '/portal/business', icon: Buildings, requiresApproval: false },
      { title: 'Security', url: '/portal/security', icon: ShieldCheck, requiresApproval: false },
    ],
  },
];

export function PortalLayout({ children }: PortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isNative } = useNativeAppContext();
  const { user, profile, membership, applicationStatus, isLoading, isAdmin, signOut } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();

  const isApproved = canAccessProtectedFeatures({
    applicationStatus,
    membershipStatus: membership?.status || null,
  });
  const isPending = applicationStatus === 'pending' && !isApproved;
  const restrictedRoutes = getRestrictedRoutesForPending();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      navigate('/portal/onboarding');
      return;
    }
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

  if (!user) return null;

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user.email?.[0]?.toUpperCase() || 'M';

  const tierBadge = membership?.tier ? (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      membership.tier === 'founder'
        ? 'bg-primary/20 text-primary'
        : membership.tier === 'fellow'
          ? 'bg-accent/20 text-accent-foreground'
          : 'bg-muted text-muted-foreground'
    )}>
      {membership.tier === 'founder' && <Crown size={12} weight="duotone" />}
      {getTierDisplayName(membership.tier)}
    </span>
  ) : null;

  const TransitionComponent = isNative ? NativePageTransition : PageTransition;

  // ── Native App Layout ──────────────────────────────────────────────
  // No sidebar, no desktop header — just mobile header + bottom tabs
  if (isNative) {
    const isHome = location.pathname === '/portal';

    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Native Mobile Header */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border/20 bg-background/95 backdrop-blur-xl"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center gap-3">
            <BrandLogo className="h-7 w-auto" height={28} width={84} />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link to="/portal/profile">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_urls?.[0]} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-auto scroll-smooth scroll-touch">
          <SwipeBack disabled={isHome}>
            <div className="p-4 pb-24 space-y-6">
              {isPending && <PendingMemberBanner className="mb-4" />}
              <TrialCountdownBanner subscription={subscription} isLoading={subscriptionLoading} />

              <TransitionComponent>
                {children}
              </TransitionComponent>
            </div>
          </SwipeBack>
        </main>

        <PortalBottomNav />
      </div>
    );
  }

  // ── Web Layout (unchanged) ─────────────────────────────────────────
  return (
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
                className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/20 transition-colors text-sm font-medium"
              >
                <House size={16} weight="duotone" />
                <span>Back to Homepage</span>
              </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
              {navGroups.map((group) => (
                <SidebarGroup key={group.label} className="mb-2">
                  <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">
                    {group.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
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
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors duration-150 text-sm',
                                  isActive
                                    ? 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] font-medium border-l-2 border-[hsl(var(--accent-gold))]'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                                  isRestricted && 'opacity-40 cursor-not-allowed'
                                )}
                              >
                                <item.icon
                                  size={20}
                                  weight={isActive ? 'duotone' : 'regular'}
                                  className="flex-shrink-0"
                                />
                                <span>{item.title}</span>
                                {isRestricted && (
                                  <Crown size={12} weight="duotone" className="ml-auto text-[hsl(var(--accent-gold))]" />
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}

              {/* Admin Link */}
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    to={ADMIN_BASE}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/10 transition-colors text-sm font-medium"
                  >
                    <ShieldCheck size={20} weight="duotone" />
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
                className="w-full justify-start text-muted-foreground hover:text-foreground rounded-[10px]"
              >
                <SignOut size={20} weight="regular" className="mr-3" />
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

            {/* Mobile Header */}
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
              <div className="space-y-8">
                {isPending && <PendingMemberBanner className="mb-6" />}
                <TrialCountdownBanner subscription={subscription} isLoading={subscriptionLoading} />

                {location.pathname === '/portal' && (
                  <Suspense fallback={<div className="h-24 w-full bg-muted/20 animate-pulse rounded-lg mb-8" />}>
                    <MobileDashboardNav onSignOut={handleSignOut} className="mb-8" />
                  </Suspense>
                )}

                <div className={location.pathname === '/portal' ? 'hidden' : 'block mb-6'}>
                  <PortalBreadcrumb type="portal" />
                </div>

                <TransitionComponent>
                  {children}
                </TransitionComponent>
              </div>
            </div>

            <PortalBottomNav />
          </main>
        </div>
      </SidebarProvider>
    </Suspense>
  );
}
