import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled 
          ? 'border-border bg-background/95 backdrop-blur-md shadow-sm' 
          : 'border-transparent bg-secondary/95 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-full items-center justify-between px-6 py-3 lg:px-10">
        {/* Left Nav - Desktop */}
        <nav className="hidden lg:flex items-center gap-6 flex-1">
          {leftNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.path
                  ? 'text-primary'
                  : isScrolled ? 'text-foreground/80' : 'text-secondary-foreground/80'
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
            className="h-10 md:h-12 w-auto object-contain"
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
                  : isScrolled ? 'text-foreground/80' : 'text-secondary-foreground/80'
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
            className={`flex items-center justify-center rounded-md p-2 transition-colors ${
              isScrolled ? 'text-foreground hover:bg-muted' : 'text-secondary-foreground hover:bg-secondary-foreground/10'
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
        <div className="absolute left-0 top-full w-full border-b border-border bg-background p-6 lg:hidden shadow-xl flex flex-col gap-4 animate-fade-in">
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
          <Button asChild className="w-full mt-2 rounded-full">
            <Link to="/membership">Become a Member</Link>
          </Button>
        </div>
      )}
    </header>
  );
};
