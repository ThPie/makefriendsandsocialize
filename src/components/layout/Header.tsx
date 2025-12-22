import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';
import logoDark from '@/assets/logo.png';
import logoLight from '@/assets/logo-light.png';

const leftNavItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Events', path: '/events' },
];

const rightNavItems = [
  { label: 'Journal', path: '/journal' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Membership', path: '/membership' },
  { label: 'Contact', path: '/contact' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  
  // Use light logo when header is transparent (over video), themed logo when scrolled
  const logo = isScrolled 
    ? (resolvedTheme === 'dark' ? logoDark : logoLight)
    : logoDark; // Always use dark/light logo when over video (transparent header)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Ensure correct initial state on load/refresh
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const allNavItems = [...leftNavItems, ...rightNavItems];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled 
          ? 'border-border bg-background/95 backdrop-blur-md shadow-sm' 
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full items-center justify-between px-6 py-3 md:px-10 lg:px-16 xl:px-20">
        
        {/* Desktop Navigation - Left */}
        <nav className="hidden lg:flex items-center gap-6 flex-1">
          {leftNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium leading-normal transition-colors hover:text-primary ${
                location.pathname === item.path
                  ? 'text-primary'
                  : isScrolled ? 'text-foreground/80' : 'text-white/90'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Centered Logo */}
        <Link to="/" className="flex items-center justify-center">
          <img 
            src={logo} 
            alt="MakeFriends & Socialize" 
            className={`w-auto object-contain transition-all duration-300 ${
              isScrolled ? 'h-14 md:h-16' : 'h-16 md:h-20 lg:h-24'
            }`}
          />
        </Link>

        {/* Desktop Navigation - Right */}
        <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
          <nav className="flex items-center gap-6">
            {rightNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium leading-normal transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : isScrolled ? 'text-foreground/80' : 'text-white/90'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center justify-center rounded-md p-2 transition-colors ${
              isScrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-border bg-background p-6 lg:hidden shadow-xl flex flex-col gap-4 animate-slide-in-from-top">
          {allNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-lg font-medium text-left transition-colors ${
                location.pathname === item.path
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
