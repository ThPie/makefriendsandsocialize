import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CirclesMegamenu } from './CirclesMegamenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileMenu } from './MobileMenu';
import { cn } from '@/lib/utils';

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();

  // Don't show public header on portal/admin pages
  const isPortal = location.pathname.startsWith('/portal');
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth = location.pathname.startsWith('/auth');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide header on portal, admin, and auth pages
  if (isPortal || isAdmin || isAuth) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-250',
        'h-[60px] md:h-[68px]',
        scrolled
          ? 'dark:frosted-nav frosted-nav-light border-b border-border/40'
          : 'bg-transparent'
      )}
    >
      <div className="content-container h-full flex items-center justify-between">
        {/* Logo — far left */}
        <TransitionLink to="/" className="flex items-center">
          <BrandLogo width={140} height={40} forceWhite={!scrolled} />
        </TransitionLink>

        {/* Right side — minimal */}
        <div className="flex items-center gap-6 h-full">
          {/* Circles Megamenu */}
          <CirclesMegamenu isTransparent={!scrolled} />

          {/* Sign In — text link, desktop only */}
          {!user && (
            <TransitionLink
              to="/auth"
              className={cn(
                "hidden md:inline-block text-sm font-light transition-colors duration-150",
                !scrolled ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"
              )}
            >
              Sign In
            </TransitionLink>
          )}

          {/* If logged in, go to portal */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <TransitionLink
                to="/portal"
                className={cn(
                  "text-sm font-light transition-colors duration-150",
                  !scrolled ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"
                )}
              >
                Dashboard
              </TransitionLink>
              <TransitionLink to="/portal/profile">
                <Avatar className="h-8 w-8 border border-white/20 hover:opacity-80 transition-opacity">
                  <AvatarImage src={profile?.avatar_urls?.[0]} />
                  <AvatarFallback className="bg-primary/80 text-primary-foreground text-xs">
                    {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'M'}{(profile?.last_name?.[0] || '').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TransitionLink>
            </div>
          )}

          {/* Apply — gold pill button */}
          <Button
            asChild
            size="sm"
            className="rounded-full px-6 h-9 text-xs tracking-widest uppercase font-medium gold-fill border-0 hover:opacity-90 transition-opacity duration-150"
          >
            <TransitionLink to="/membership">
              Apply
            </TransitionLink>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle isTransparent={!scrolled} />

          {/* Mobile hamburger menu */}
          <MobileMenu isTransparent={!scrolled} />
        </div>
      </div>
    </header>
  );
};
