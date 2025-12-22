import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';
import logoDark from '@/assets/logo.png';
import logoLight from '@/assets/logo-light.png';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Events', path: '/events' },
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
  
  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;
  
  // Use light logo when header is transparent (over video), themed logo when scrolled/inner pages
  const logo = isTransparent 
    ? logoDark 
    : (resolvedTheme === 'dark' ? logoDark : logoLight);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ${
        isTransparent 
          ? 'border-transparent bg-gradient-to-b from-black/50 via-black/25 to-transparent' 
          : 'border-border bg-background/95 backdrop-blur-md shadow-sm'
      }`}
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

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-end gap-6 lg:flex">
          <nav className="flex items-center gap-6">
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link to="/membership">Become a Member</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted transition-colors"
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
          {navItems.map((item) => (
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
          <Button asChild className="w-full mt-2">
            <Link to="/membership">Become a Member</Link>
          </Button>
        </div>
      )}
    </header>
  );
};
