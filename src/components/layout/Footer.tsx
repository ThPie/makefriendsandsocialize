import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-12 w-full border-t border-border bg-background transition-colors duration-300">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:px-10 md:py-12">
        {/* Logo */}
        <Link to="/" className="flex cursor-pointer flex-col gap-0 group select-none">
          <div className="flex items-baseline">
            <span className="font-sans text-2xl font-light tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
              MakeFriends
            </span>
            <div className="ml-1 h-3 w-3 rounded-full bg-gradient-to-br from-primary to-amber-600 shadow-sm"></div>
          </div>
          <div className="flex items-center gap-2 -mt-1.5 pl-0.5">
            <span className="font-display text-lg font-bold italic text-primary">&</span>
            <span className="font-sans text-[0.65rem] font-medium tracking-[0.25em] uppercase text-muted-foreground group-hover:tracking-[0.3em] transition-all">
              socialize
            </span>
          </div>
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
