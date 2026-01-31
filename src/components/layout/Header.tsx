import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Mail, Building2, Crown, Globe, BookOpen, Quote, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import logoLight from '@/assets/logo-transparent.png';
import logoDark from '@/assets/logo-dark.png';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCapacitor } from '@/hooks/useCapacitor';

const navItems = [
  { label: 'Events', path: '/events', icon: Calendar },
  { label: 'Journal', path: '/journal', icon: BookOpen },
  { label: 'Founders Circle', path: '/founders-circle', icon: Building2 },
  { label: 'The Gentlemen', path: '/circles/the-gentlemen', icon: Crown },
  { label: 'Les Amis', path: '/circles/les-amis', icon: Globe },
  { label: 'Membership', path: '/membership', icon: Users },
  { label: 'Contact', path: '/contact', icon: Mail },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const { user, profile } = useAuth();
  const { resolvedTheme } = useTheme();
  const { isNative, isIOS } = useCapacitor();
  
  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;
  
  // Use light logo for dark theme OR transparent header, dark logo for light theme
  const currentLogo = !mounted || resolvedTheme === 'dark' || isTransparent ? logoLight : logoDark;

  const [scrollDepth, setScrollDepth] = useState(0);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      const first = profile.first_name?.[0] || '';
      const last = profile.last_name?.[0] || '';
      return (first + last).toUpperCase() || 'U';
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };
  
  const getFullName = () => {
    if (profile?.first_name || profile?.last_name) {
      return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    }
    return null;
  };
  
  const getAvatarUrl = () => {
    if (profile?.avatar_urls && profile.avatar_urls.length > 0) {
      return profile.avatar_urls[0];
    }
    return undefined;
  };

  // Debounced scroll handler to prevent flickering
  useEffect(() => {
    let rafId: number;
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        // Only update if scroll position changed significantly (debounce threshold)
        if (Math.abs(currentScrollY - lastScrollY) > 5 || currentScrollY <= 20) {
          setIsScrolled(currentScrollY > 20);
          const depth = Math.min(currentScrollY / 200, 1);
          setScrollDepth(depth);
          lastScrollY = currentScrollY;
        }
      });
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Fetch daily quote
  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        // Use local date (not UTC) so the quote matches the user's day.
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const { data, error } = await supabase
          .from('daily_quotes')
          .select('quote_text')
          .eq('quote_date', today)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching daily quote:', error);
          return;
        }

        if (data) {
          setDailyQuote(data.quote_text);
        }
      } catch (error) {
        console.error('Error fetching daily quote:', error);
      }
    };

    fetchDailyQuote();
  }, []);
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isTransparent 
          ? 'bg-gradient-to-b from-black/50 via-black/25 to-transparent' 
          : 'border-b border-border bg-background/95 backdrop-blur-md'
      }`}
      style={{
        // Add safe area padding for iOS notch/dynamic island in native apps
        paddingTop: isNative && isIOS ? 'env(safe-area-inset-top)' : undefined,
        boxShadow: isTransparent 
          ? 'none' 
          : `0 ${4 + scrollDepth * 8}px ${12 + scrollDepth * 20}px -${4 - scrollDepth * 2}px hsl(var(--foreground) / ${0.05 + scrollDepth * 0.1})`
      }}
    >
      <div className="mx-auto flex h-full items-center justify-between px-4 py-2 md:px-8 lg:px-12 xl:px-16">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={currentLogo} 
            alt="MakeFriends & Socialize" 
            className={`w-auto object-contain transition-all duration-300 ${
              isTransparent ? 'h-12 md:h-14' : 'h-10 md:h-12'
            }`}
          />
        </Link>

        {/* Desktop Navigation - xl breakpoint for better tablet support */}
        <div className="hidden flex-1 items-center justify-end gap-3 xl:flex">
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium leading-normal transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : isTransparent ? 'text-white/90' : 'text-foreground/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Theme Toggle */}
          <ThemeToggle isTransparent={isTransparent} />
          
          {/* Profile Avatar or Apply Button */}
          {user ? (
            <Link 
              to="/portal" 
              className="ml-2 transition-transform hover:scale-105"
              title="Go to your profile"
            >
              <Avatar className="h-10 w-10 border-2 border-primary/30 hover:border-primary transition-colors">
                <AvatarImage src={getAvatarUrl()} alt={getFullName() || 'Profile'} />
                <AvatarFallback className="bg-primary/20 text-primary font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button 
              asChild 
              variant="outline" 
              className={isTransparent ? "border-white/60 text-white hover:bg-white/10 hover:border-white" : ""}
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button - Animated Hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`relative z-50 flex items-center justify-center w-11 h-11 rounded-lg transition-colors xl:hidden pointer-events-auto ${
            isTransparent 
              ? 'text-white hover:bg-white/10 bg-black/20 backdrop-blur-sm' 
              : 'text-foreground hover:bg-muted bg-background/80'
          }`}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <div className="w-6 h-5 flex flex-col justify-center items-center">
            <span 
              className={`block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1.5'
              }`}
            />
            <span 
              className={`block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
              }`}
            />
            <span 
              className={`block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1.5'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu - Full Screen Slide Out */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm xl:hidden"
              style={{ zIndex: 9998 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Slide-out Panel - Opens from Right */}
            <motion.nav
              className="fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-card border-l border-border flex flex-col xl:hidden shadow-2xl overflow-hidden"
              style={{ zIndex: 9999 }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* Header with Logo and Theme Toggle */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <img 
                    src={mounted && resolvedTheme === 'light' ? logoDark : logoLight} 
                    alt="MakeFriends & Socialize" 
                    className="h-12 w-auto object-contain"
                  />
                </Link>
                <ThemeToggle />
              </div>
              
              {/* Profile Section for logged in users */}
              {user && (
                <motion.div 
                  className="px-6 py-4 border-b border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link 
                    to="/portal" 
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarImage src={getAvatarUrl()} alt={getFullName() || 'Profile'} />
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {getFullName() || 'Your Profile'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        View your dashboard
                      </p>
                    </div>
                    <User className="w-5 h-5 text-primary" />
                  </Link>
                </motion.div>
              )}

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-all duration-200 ${
                          location.pathname === item.path
                            ? 'bg-primary/15 text-primary'
                            : 'text-foreground hover:bg-muted hover:text-primary'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className={`w-5 h-5 ${
                          location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
              
              {/* Daily Quote Section */}
              {dailyQuote && (
                <motion.div 
                  className="px-6 py-4 border-t border-border bg-secondary/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                    <p className="font-serif italic text-sm text-muted-foreground leading-relaxed">
                      {dailyQuote}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Footer with CTA */}
              <motion.div 
                className="p-6 border-t border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button asChild variant="outline" className="w-full rounded-xl py-6 text-base font-semibold">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Exclusive membership for professionals
                </p>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
