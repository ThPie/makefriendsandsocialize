import { ReactNode, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTierDisplayName } from '@/lib/tier-utils';
import { useSubscription } from '@/hooks/useSubscription';

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

  const memoizedMenuItems = useMemo(() => menuItems, []);

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
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--gold))]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user.email?.[0]?.toUpperCase() || 'M';

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--gold))]" /></div>}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <SkipLink />
          <Sidebar className="border-r border-border bg-surface" aria-label="Portal Sidebar">
            {/* Logo */}
            <SidebarHeader className="p-6 border-b border-border">
              <Link to="/" className="block">
                <BrandLogo className="h-8 w-auto" width={96} height={32} />
              </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4 flex-1">
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
                              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-colors duration-200 text-sm ${
                                isActive
                                  ? 'text-foreground'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                              } ${isRestricted ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              {/* Gold active bar */}
                              {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[hsl(var(--gold))]" />
                              )}
                              <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                              <span>{item.title}</span>
                              {isRestricted && (
                                <Crown className="h-3 w-3 ml-auto text-[hsl(var(--gold))]" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Admin Section */}
              {isAdmin && (
                <div className="mt-6 pt-4">
                  <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    — Admin —
                  </p>
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-200"
                  >
                    <Shield className="h-5 w-5" strokeWidth={1.5} />
                    <span>Admin Dashboard</span>
                  </Link>
                </div>
              )}
            </SidebarContent>

            {/* Bottom: Avatar + Name + Tier + Sign Out */}
            <div className="mt-auto border-t border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={profile?.avatar_urls?.[0]} />
                  <AvatarFallback className="bg-surface-raised text-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.first_name || 'Member'}
                  </p>
                  {membership?.tier && (
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                      {getTierDisplayName(membership.tier)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-muted-foreground hover:text-foreground h-9 px-3 text-sm"
              >
                <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Sign Out
              </Button>
            </div>
          </Sidebar>

          <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Desktop Top Bar — 64px */}
            <header className="hidden md:flex items-center justify-between h-16 px-8 border-b border-border bg-background">
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <NotificationBell />
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
                  <Mail className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-border mx-1" />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium leading-none text-foreground">{profile?.first_name || 'Member'}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium mt-1">
                      {getTierDisplayName(membership?.tier)} Member
                    </p>
                  </div>
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={profile?.avatar_urls?.[0]} />
                    <AvatarFallback className="bg-surface text-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            {/* Mobile Header */}
            <header
              className="sticky top-0 z-40 flex items-center justify-between h-[60px] px-4 border-b border-border bg-background md:hidden"
              style={{ paddingTop: 'var(--safe-top, 0px)' }}
            >
              <Link to="/" className="flex items-center">
                <BrandLogo className="h-7 w-auto" height={28} width={84} />
              </Link>
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={profile?.avatar_urls?.[0]} />
                  <AvatarFallback className="bg-surface text-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6 md:p-8 lg:p-12 scroll-smooth scroll-touch pb-24 md:pb-8 lg:pb-12">
              <div className="max-w-[1200px] mx-auto space-y-8">
                {isPending && <PendingMemberBanner className="mb-6" />}
                <TrialCountdownBanner subscription={subscription} isLoading={subscriptionLoading} />

                {location.pathname === '/portal' && (
                  <Suspense fallback={<div className="h-24 w-full bg-surface animate-pulse rounded-[12px] mb-8" />}>
                    <MobileDashboardNav onSignOut={handleSignOut} className="mb-8" />
                  </Suspense>
                )}

                <div className={location.pathname === '/portal' ? 'hidden' : 'block mb-6'}>
                  <PortalBreadcrumb type="portal" />
                </div>

                <PageTransition>
                  {children}
                </PageTransition>
              </div>
            </div>

            <PortalBottomNav />
          </main>
        </div>
      </SidebarProvider>
    </Suspense>
  );
}
