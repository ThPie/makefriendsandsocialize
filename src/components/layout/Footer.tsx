import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/common/BrandLogo';
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
      { label: "The Partners Circle", href: "/circles/the-partners" },
      { label: "The Pursuits Club", href: "/circles/the-pursuits" },
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
    <footer className="w-full bg-background text-foreground transition-colors duration-200">
      {/* Main content */}
      <div className="content-container pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Logo + tagline — spans 4 cols on desktop, full width on mobile */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <BrandLogo width={160} height={48} />
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
              A private sanctuary for meaningful connection, curated events, and genuine friendships.
            </p>
          </div>

          {/* Link columns — 2x2 grid on mobile, 4 cols on desktop */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h3 className="eyebrow text-[hsl(var(--accent-gold))]">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-[hsl(var(--accent-gold))] transition-colors duration-150 text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Make Friends and Socialize LLC. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-5">
            <a
              href="https://www.facebook.com/profile.php?id=61575868888590"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[hsl(var(--accent-gold))] transition-colors duration-150"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://www.instagram.com/makefriendsandsocialize/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[hsl(var(--accent-gold))] transition-colors duration-150"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[hsl(var(--accent-gold))] transition-colors duration-150"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
