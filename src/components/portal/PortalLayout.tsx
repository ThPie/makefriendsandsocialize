import { ReactNode, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  SidebarTrigger,
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
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { TrialCountdownBanner } from './TrialCountdownBanner';
import { PageTransition } from '@/components/ui/page-transition';
import logo from '@/assets/logo-transparent.png';

interface PortalLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Dashboard', url: '/portal', icon: LayoutDashboard },
  { title: 'My Profile', url: '/portal/profile', icon: User },
  { title: 'The Network', url: '/portal/network', icon: Users },
  { title: 'Connections', url: '/portal/connections', icon: Heart },
  { title: 'Slow Dating', url: '/portal/slow-dating', icon: Heart },
  { title: 'My Business', url: '/portal/business', icon: Users },
  { title: 'Events', url: '/portal/events', icon: Calendar },
  { title: 'Referrals', url: '/portal/referrals', icon: Gift },
];

export function PortalLayout({ children }: PortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, membership, applicationStatus, isLoading, isAdmin, signOut } = useAuth();
  const { subscription } = useSubscription();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
    
    // If application is pending, redirect to waiting page
    if (!isLoading && user && applicationStatus === 'pending') {
      navigate('/auth/waiting');
    }
  }, [user, applicationStatus, isLoading, navigate]);

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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      membership.tier === 'founder' 
        ? 'bg-primary/20 text-primary'
        : membership.tier === 'fellow'
        ? 'bg-accent/20 text-accent-foreground'
        : 'bg-muted text-muted-foreground'
    }`}>
      {membership.tier === 'founder' && <Crown className="h-3 w-3" />}
      {membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)}
    </span>
  ) : null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 border-b border-border">
            <Link to="/" className="block mb-3">
              <img src={logo} alt="Make Friends & Socialize" className="h-10 w-auto" />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
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
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    const isRestricted = (item.url === '/portal/network' || item.url === '/portal/connections') 
                      && membership?.tier === 'patron';
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.url}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            } ${isRestricted ? 'opacity-50' : ''}`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                            {isRestricted && (
                              <Crown className="h-3 w-3 ml-auto text-primary" />
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
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

        <main className="flex-1 overflow-auto">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b border-border bg-background/95 backdrop-blur md:hidden">
            <div className="flex items-center">
              <SidebarTrigger />
              <img src={logo} alt="Make Friends & Socialize" className="ml-3 h-8 w-auto" />
            </div>
            <NotificationBell />
          </header>

          {/* Desktop Notification Bell */}
          <div className="hidden md:flex fixed top-4 right-8 z-50">
            <NotificationBell />
          </div>

          <div className="p-8 md:p-12 lg:p-16">
            {/* Trial Countdown Banner */}
            <TrialCountdownBanner />
            
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
