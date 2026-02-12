import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import logoLight from '@/assets/logo-transparent.png';
import logoDark from '@/assets/logo-dark.png';
import { AppStoreBadges } from '@/components/dating/AppStoreBadges';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const footerLinks = {
  experience: {
    title: "THE EXPERIENCE",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Membership", href: "/membership" },
      { label: "Concierge", href: "/contact" },
      { label: "Gallery", href: "/gallery" },
    ]
  },
  community: {
    title: "COMMUNITY",
    links: [
      { label: "Events", href: "/events" },
      { label: "Founders Circle", href: "/founders-circle" },
      { label: "Slow Dating", href: "/slow-dating" },
      { label: "Business Directory", href: "/business" },
    ]
  },
  inquiries: {
    title: "INQUIRIES",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Journal", href: "/journal" },
      { label: "Partnerships", href: "/contact" },
    ]
  },
  legal: {
    title: "LEGAL",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "House Rules", href: "/rules" },
      { label: "Cookie Policy", href: "/cookies" },
    ]
  }
};

export const Footer = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLogo = mounted && resolvedTheme === 'light' ? logoDark : logoLight;

  return (
    <footer className="w-full bg-background border-t border-border text-foreground py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col items-center">

        {/* Main Header */}
        <div className="text-center mb-16 md:mb-24 space-y-6">
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-widest uppercase">
            MAKE FRIENDS & SOCIALIZE
          </h2>
        </div>

        {/* Desktop Layout (Grid) */}
        <div className="hidden md:grid grid-cols-4 gap-8 w-full max-w-6xl mb-16 px-4">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="flex flex-col space-y-6">
              <h4 className="font-display font-bold text-sm tracking-widest uppercase text-muted-foreground">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile Layout (Accordion) */}
        <div className="md:hidden w-full mb-12">
          <Accordion type="single" collapsible className="w-full">
            {Object.values(footerLinks).map((section) => (
              <AccordionItem key={section.title} value={section.title} className="border-b-muted">
                <AccordionTrigger className="font-display font-bold text-sm tracking-widest uppercase py-4 text-muted-foreground">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col space-y-3 pb-4">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.href}
                          className="text-muted-foreground hover:text-primary transition-colors text-sm pl-2 block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Social Icons & Copyright */}
        <div className="w-full flex flex-col items-center space-y-8 pt-8 border-t border-border/40">
          {/* Social Media Icons */}
          <div className="flex items-center gap-6">
            <a
              href="https://www.facebook.com/profile.php?id=61575868888590"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/makefriendsandsocialize/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          <div className="flex flex-col items-center gap-4">
            <AppStoreBadges comingSoon={true} />
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Make Friends and Socialize LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
