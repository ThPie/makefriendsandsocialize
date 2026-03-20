import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useUpgrade } from '@/contexts/UpgradeContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CirclesMegamenu } from './CirclesMegamenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileMenu } from './MobileMenu';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuth();
  const { openUpgrade } = useUpgrade();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { resolvedTheme } = useTheme();

  // Don't show public header on portal/admin pages
  const isPortal = location.pathname.startsWith('/portal');
  const isAdmin = location.pathname.startsWith('/cx');
  const isAuth = location.pathname.startsWith('/auth');

  // In light mode, always force opaque header so logo/nav are visible
  const isLightMode = resolvedTheme === 'light';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide header on portal, admin, and auth pages
  if (isPortal || isAdmin || isAuth) return null;

  // In light mode, never use transparent styling; in dark mode, transparent until scrolled
  // Transparent header: on homepage when not scrolled (both light and dark mode)
  const isTransparent = !scrolled && isHomePage;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-250',
        'h-[60px] md:h-[68px]',
        isTransparent
          ? 'bg-transparent'
          : 'dark:frosted-nav frosted-nav-light border-b border-border/40'
      )}
    >
      <div className="content-container h-full flex items-center justify-between">
        {/* Logo — far left */}
        <TransitionLink to="/" className="flex items-center">
          <BrandLogo width={140} height={40} forceWhite={isTransparent} />
        </TransitionLink>

        {/* Right side — minimal */}
        <div className="flex items-center gap-6 h-full">
          {/* Circles Megamenu */}
          <CirclesMegamenu isTransparent={isTransparent} />

          {/* Desktop nav links */}
          {['Events', 'Membership', 'Blog', 'Soul Maps'].map((label) => {
            const href = label === 'Soul Maps' ? '/soul-maps' : `/${label.toLowerCase()}`;
            // Logged-in users clicking "Membership" get the in-app upgrade modal
            if (label === 'Membership' && user) {
              return (
                <button
                  key={label}
                  onClick={openUpgrade}
                  className={cn(
                    "hidden lg:inline-block text-sm font-light transition-colors duration-150 bg-transparent border-none cursor-pointer",
                    isTransparent ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              );
            }
            return (
              <TransitionLink
                key={label}
                to={href}
                className={cn(
                  "hidden lg:inline-block text-sm font-light transition-colors duration-150",
                  isTransparent ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"
                )}
              >
                {label}
              </TransitionLink>
            );
          })}

          {/* Sign In — text link, desktop only */}
          {!user && (
            <TransitionLink
              to="/auth"
              className={cn(
                "hidden lg:inline-block text-sm font-light transition-colors duration-150",
                isTransparent ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"
              )}
            >
              Sign In
            </TransitionLink>
          )}

          {/* If logged in, show avatar */}
          {user && (
            <TransitionLink to="/portal" className="hidden lg:block">
              <Avatar className="h-11 w-11 border-2 border-[hsl(var(--accent-gold))]/60 hover:border-[hsl(var(--accent-gold))] transition-colors">
                <AvatarImage src={profile?.avatar_urls?.[0] || user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/80 text-primary-foreground text-sm font-medium">
                  {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'M'}{(profile?.last_name?.[0] || '').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TransitionLink>
          )}

          {/* Theme Toggle */}
          <ThemeToggle isTransparent={isTransparent} />

          {/* Mobile hamburger menu */}
          <MobileMenu isTransparent={isTransparent} />
        </div>
      </div>
    </header>
  );
};
