import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useTheme } from 'next-themes';
import logoLight from '@/assets/logo-transparent.png';
import logoDark from '@/assets/logo-dark.png';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navLinks = [
  { label: 'Events', path: '/events' },
  { label: 'Circles', path: '/circles' },
  { label: 'Membership', path: '/membership' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const { user, profile } = useAuth();
  const { resolvedTheme } = useTheme();

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  const currentLogo = !mounted || resolvedTheme === 'dark' || isTransparent ? logoLight : logoDark;

  useEffect(() => {
    setMounted(true);
  }, []);

  const getUserInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      const first = profile.first_name?.[0] || '';
      const last = profile.last_name?.[0] || '';
      return (first + last).toUpperCase() || 'U';
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getAvatarUrl = () => {
    const raw = profile?.avatar_urls?.[0];
    if (!raw) return undefined;
    if (raw.startsWith('http')) return raw;
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(raw);
    return data.publicUrl;
  };

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 60);
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: isTransparent
          ? 'transparent'
          : 'rgba(7, 26, 15, 0.85)',
        backdropFilter: isTransparent ? 'none' : 'blur(24px)',
        WebkitBackdropFilter: isTransparent ? 'none' : 'blur(24px)',
        borderBottom: isTransparent ? 'none' : '1px solid hsl(var(--border))',
      }}
    >
      <div className="mx-auto flex items-center justify-between px-6 md:px-12 h-[60px] md:h-[68px] max-w-[1200px]">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={currentLogo}
            alt="MakeFriends & Socialize"
            className="h-8 md:h-10 w-auto object-contain"
          />
        </Link>

        {/* Center Nav Links — Desktop only */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <TransitionLink
              key={item.path}
              to={item.path}
              className={`text-sm font-normal transition-colors duration-200 ${
                location.pathname === item.path
                  ? 'text-[hsl(var(--gold))]'
                  : isTransparent
                    ? 'text-white/70 hover:text-white'
                    : 'text-[hsl(var(--foreground))]/70 hover:text-[hsl(var(--foreground))]'
              }`}
            >
              {item.label}
            </TransitionLink>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/portal" title="Go to your profile">
              <Avatar className="h-9 w-9 border border-[hsl(var(--border))]">
                <AvatarImage src={getAvatarUrl()} alt="Profile" />
                <AvatarFallback className="bg-[hsl(var(--surface))] text-[hsl(var(--foreground))] text-xs font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <>
              {/* Sign In — Desktop only, text link */}
              <TransitionLink
                to="/auth"
                className={`hidden md:inline text-sm font-normal transition-colors duration-200 ${
                  isTransparent
                    ? 'text-white/70 hover:text-white'
                    : 'text-[hsl(var(--foreground))]/70 hover:text-[hsl(var(--foreground))]'
                }`}
              >
                Sign In
              </TransitionLink>

              {/* Apply — Gold pill */}
              <TransitionLink
                to="/membership"
                className="inline-flex items-center px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase bg-[hsl(var(--gold))] text-background transition-colors duration-200 hover:bg-[hsl(var(--gold-light))]"
              >
                Apply
              </TransitionLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
