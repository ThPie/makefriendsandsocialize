import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* Logo */}
      <div className="mb-10">
        <BrandLogo width={140} height={40} />
      </div>

      {/* Decorative number */}
      <p className="font-display text-[120px] leading-none font-bold text-[hsl(var(--accent-gold))]/20 select-none">
        404
      </p>

      <h1 className="mt-4 font-display text-3xl md:text-4xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground text-base leading-relaxed">
        The page you're looking for doesn't exist or may have been moved. Let's get you back to where you belong.
      </p>

      {/* Navigation options */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold-foreground))] px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Return to Home
        </Link>
        <Link
          to="/events"
          className="inline-flex items-center justify-center rounded-full border border-border text-foreground px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
        >
          Browse Events
        </Link>
        <Link
          to="/membership"
          className="inline-flex items-center justify-center rounded-full border border-border text-foreground px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
        >
          Membership
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Link to="/about" className="hover:text-foreground transition-colors">About Us</Link>
        <Link to="/circles" className="hover:text-foreground transition-colors">Circles</Link>
        <Link to="/gallery" className="hover:text-foreground transition-colors">Gallery</Link>
        <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
      </div>
    </div>
  );
};

export default NotFound;
