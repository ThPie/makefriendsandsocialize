import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export const Footer = () => {
  return (
    <footer className="mt-12 w-full border-t border-border bg-background transition-colors duration-300">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:px-10 md:py-12">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="MakeFriends & Socialize" 
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>
        
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Contact
          </Link>
          <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Terms
          </Link>
          <Link to="/rules" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Our Rules
          </Link>
          <Link to="/cookies" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Cookies
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © 2024 MakeFriends. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
