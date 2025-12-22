import { Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '@/assets/logo.png';
import havnLogo from '@/assets/havn-logo.png';
import maisonPierreLogo from '@/assets/maison-pierre-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

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

        {/* Partners Section */}
        <div className="mx-auto max-w-7xl mb-12 pb-12 border-b border-border">
          <p className="text-muted-foreground/60 text-xs text-center mb-8">
            Our Partners
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-16">
            {/* HAVN */}
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-40 flex items-center justify-center mb-4">
                <img
                  src={havnLogo}
                  alt="HAVN"
                  className="max-h-full max-w-full object-contain filter brightness-0 invert opacity-80"
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                A design-forward coworking space for founders, creatives, and builders.
              </p>
            </div>
            
            {/* The Maison Pierre */}
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-40 flex items-center justify-center mb-4">
                <img
                  src={maisonPierreLogo}
                  alt="The Maison Pierre"
                  className="max-h-full max-w-full object-contain opacity-90"
                />
              </div>
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
              alt="MakeFriends & Socialize" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>
          
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/gallery" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link to="/journal" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Journal
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
      </div>
    </footer>
  );
};
