import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/common/BrandLogo';
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
      { label: "Intentional Connections", href: "/slow-dating" },
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
  return (
    <footer className="w-full bg-background border-t border-border py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1200px] mx-auto">

        {/* Top: Logo + tagline spanning left, links right */}
        <div className="hidden md:grid grid-cols-12 gap-8 mb-16">
          {/* Logo area */}
          <div className="col-span-4">
            <BrandLogo width={140} height={42} />
            <p className="text-[13px] text-muted-foreground mt-4 max-w-[280px] leading-relaxed">
              A private community for meaningful connections and curated experiences.
            </p>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="col-span-2 flex flex-col space-y-5">
              <h3 className="section-label">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
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
        <div className="md:hidden mb-12">
          <div className="mb-8">
            <BrandLogo width={120} height={36} />
          </div>
          <Accordion type="single" collapsible className="w-full">
            {Object.values(footerLinks).map((section) => (
              <AccordionItem key={section.title} value={section.title} className="border-b border-border">
                <AccordionTrigger className="section-label py-4 hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col space-y-3 pb-4">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.href}
                          className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm pl-2 block"
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

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Make Friends and Socialize LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="https://www.facebook.com/profile.php?id=61575868888590" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--gold))] transition-colors duration-200" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/makefriendsandsocialize/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--gold))] transition-colors duration-200" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--gold))] transition-colors duration-200" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
