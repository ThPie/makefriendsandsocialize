import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';
import logo from '@/assets/logo.png';

const leftNavItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Journal', path: '/journal' },
];

const rightNavItems = [
  { label: 'Gallery', path: '/gallery' },
  { label: 'Membership', path: '/membership' },
  { label: 'Contact', path: '/contact' },
];

const allNavItems = [...leftNavItems, ...rightNavItems];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 pt-4">
      {/* Ambient Glow Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[100px] transition-opacity duration-500 ${
            isScrolled ? 'opacity-30' : 'opacity-50'
          }`}
          style={{
            background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.4) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Floating Header Container */}
      <div 
        className={`relative mx-auto max-w-6xl rounded-2xl border transition-all duration-500 ${
          isScrolled 
            ? 'bg-secondary/95 backdrop-blur-xl border-border/50 shadow-lg shadow-primary/10' 
            : 'bg-secondary/80 backdrop-blur-md border-secondary-foreground/10'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left Nav - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 flex-1">
            {leftNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-secondary-foreground/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Centered Logo */}
          <Link to="/" className="flex items-center justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <img 
              src={logo} 
              alt="MakeFriends & Socialize" 
              className={`h-10 md:h-12 w-auto object-contain transition-all duration-300 ${
                resolvedTheme === 'light' ? 'invert' : ''
              }`}
            />
          </Link>

          {/* Right Nav - Desktop */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-end">
            {rightNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-secondary-foreground/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
            <Button asChild size="sm" className="rounded-full px-5">
              <Link to="/membership">Become a Member</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center rounded-md p-2 text-secondary-foreground hover:bg-secondary-foreground/10 transition-colors"
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
          <div className="lg:hidden border-t border-border/30 p-6 flex flex-col gap-4 animate-fade-in">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-lg font-medium text-left transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-secondary-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="w-full mt-2 rounded-full">
              <Link to="/membership">Become a Member</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
