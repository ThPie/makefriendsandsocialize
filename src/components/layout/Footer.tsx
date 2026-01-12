import { Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '@/assets/logo.png';
import havnLogo from '@/assets/havn-logo.png';
import maisonPierreLogo from '@/assets/maison-pierre-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    toast({
      title: 'Welcome to our community!',
      description: 'You have successfully subscribed to our newsletter.',
    });
    
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <footer className="w-full border-t border-border bg-background transition-colors duration-300">
      <div className="w-full px-6 py-12 md:px-10 md:py-16 lg:px-16 xl:px-20">
        {/* Newsletter Section */}
        <div className="mx-auto max-w-7xl mb-12 pb-12 border-b border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
              Stay Connected
            </h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to receive exclusive updates, event invitations, and community news.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-full px-5"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-6"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        {/* Partners & Brands Section */}
        <div className="mx-auto max-w-7xl mb-12 pb-12 border-b border-border">
          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
            {/* HAVN - Venue Partner */}
            <div className="flex flex-col items-center text-center group">
              <p className="text-muted-foreground/60 text-xs mb-4">Our Venue Partner</p>
              <a 
                href="https://joinhavn.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-10 w-28 flex items-center justify-center mb-4"
              >
                <img
                  src={havnLogo}
                  alt="HAVN"
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain filter brightness-0 invert opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                />
              </a>
              <p className="text-muted-foreground text-sm max-w-xs">
                A design-forward coworking space for founders, creatives, and builders.
              </p>
            </div>
            
            {/* The Maison Pierre - In-house Brand */}
            <div className="flex flex-col items-center text-center group">
              <p className="text-muted-foreground/60 text-xs mb-4">Our In-House Brand</p>
              <a 
                href="https://themaisonpierre.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-10 w-28 flex items-center justify-center mb-4"
              >
                <img
                  src={maisonPierreLogo}
                  alt="The Maison Pierre"
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                />
              </a>
              <p className="text-muted-foreground text-sm max-w-xs">
                Timeless elegance in bespoke tailoring—where clothing becomes an extension of self.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Make Friends and Socialize" 
              loading="lazy"
              decoding="async"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>
          
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/gallery" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link to="/journal" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Journal
            </Link>
            <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              FAQ
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

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="TikTok"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mx-auto max-w-7xl mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Make Friends and Socialize. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
