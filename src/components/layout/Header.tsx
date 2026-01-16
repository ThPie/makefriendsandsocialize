import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Mail, Building2, Crown, Globe } from 'lucide-react';
import logo from '@/assets/logo-transparent.png';

import { BookOpen } from 'lucide-react';

const navItems = [
  { label: 'Events', path: '/events', icon: Calendar },
  { label: 'Journal', path: '/journal', icon: BookOpen },
  { label: 'Business', path: '/connected-circle', icon: Building2 },
  { label: 'The Gentlemen', path: '/circles/the-gentlemen', icon: Crown },
  { label: 'Les Amis', path: '/circles/les-amis', icon: Globe },
  { label: 'Membership', path: '/membership', icon: Users },
  { label: 'Contact', path: '/contact', icon: Mail },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  const [scrollDepth, setScrollDepth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const depth = Math.min(window.scrollY / 200, 1);
      setScrollDepth(depth);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isTransparent 
          ? 'bg-gradient-to-b from-black/50 via-black/25 to-transparent' 
          : 'border-b border-border bg-background/95 backdrop-blur-md'
      }`}
      style={{
        boxShadow: isTransparent 
          ? 'none' 
          : `0 ${4 + scrollDepth * 8}px ${12 + scrollDepth * 20}px -${4 - scrollDepth * 2}px hsl(var(--foreground) / ${0.05 + scrollDepth * 0.1})`
      }}
    >
      <div className="mx-auto flex h-full items-center justify-between px-4 py-2 md:px-8 lg:px-12 xl:px-16">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="MakeFriends & Socialize" 
            className={`w-auto object-contain transition-all duration-300 ${
              isTransparent ? 'h-14 md:h-16' : 'h-10 md:h-12'
            }`}
          />
        </Link>

        {/* Desktop Navigation - xl breakpoint for better tablet support */}
        <div className="hidden flex-1 items-center justify-end gap-4 xl:flex">
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
          <Button asChild>
            <Link to="/membership">Apply to Join</Link>
          </Button>
        </div>

        {/* Mobile Menu Button - Animated Hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`relative flex items-center justify-center w-11 h-11 rounded-lg transition-colors xl:hidden ${
            isTransparent ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Slide-out Panel - Opens from Right */}
            <motion.nav
              className="fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-card border-l border-border z-50 flex flex-col xl:hidden shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* Header with Logo */}
              <div className="p-6 border-b border-border">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <img 
                    src={logo} 
                    alt="MakeFriends & Socialize" 
                    className="h-12 w-auto object-contain"
                  />
                </Link>
              </div>
              
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
              
              {/* Footer with CTA */}
              <motion.div 
                className="p-6 border-t border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button asChild className="w-full rounded-xl py-6 text-base font-semibold">
                  <Link to="/membership" onClick={() => setIsMenuOpen(false)}>
                    Apply to Join
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
