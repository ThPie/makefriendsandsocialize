import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Facebook, Instagram, Linkedin, ChevronDown, Send } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { DailyQuote } from '@/components/common/DailyQuote';
import { TikTokIcon } from '@/components/common/TikTokIcon';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const footerLinks = {
  experience: {
    title: "THE EXPERIENCE",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Events", href: "/events" },
      { label: "Membership", href: "/membership" },
      { label: "Concierge", href: "/contact" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  circles: {
    title: "CIRCLES",
    links: [
      { label: "The Gentlemen", href: "/circles/the-gentlemen" },
      { label: "The Ladies Society", href: "/circles/the-ladies-society" },
      { label: "Les Amis", href: "/circles/les-amis" },
      { label: "Couple's Circle", href: "/circles/couples-circle" },
      { label: "Active & Outdoor", href: "/circles/active-outdoor" },
      { label: "Founders Circle", href: "/founders-circle" },
      { label: "Slow Dating", href: "/slow-dating" },
    ],
  },
  inquiries: {
    title: "INQUIRIES",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/journal" },
      { label: "Partnerships", href: "/contact" },
      { label: "Become a Host", href: "/become-a-host" },
    ],
  },
  legal: {
    title: "LEGAL",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "House Rules", href: "/rules" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
};

const FooterCollapsible = ({ section }: { section: { title: string; links: { label: string; href: string }[] } }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-left">
        <span className="eyebrow text-[hsl(var(--accent-gold))] text-xs">{section.title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        <ul className="flex flex-col gap-2.5">
          {section.links.map((link) => (
            <li key={link.label}>
              <Link to={link.href} className="text-muted-foreground hover:text-[hsl(var(--accent-gold))] transition-colors duration-150 text-sm">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast({ title: 'Please agree to receive updates', variant: 'destructive' });
      return;
    }
    const trimmed = email.trim();
    if (!trimmed || trimmed.length > 255) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: trimmed, source: 'footer', is_active: true });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'You\'re already subscribed!', description: 'Thank you for being part of our community.' });
      } else {
        toast({ title: 'Something went wrong', description: 'Please try again later.', variant: 'destructive' });
      }
      return;
    }

    toast({ title: 'Welcome to the community!', description: 'You\'ll receive our latest updates.' });
    setEmail('');
    setAgreed(false);

    // Send confirmation email & sync to Mailchimp (fire & forget)
    try {
      await Promise.allSettled([
        supabase.functions.invoke('send-newsletter-confirmation', {
          body: { email: trimmed },
        }),
        supabase.functions.invoke('sync-mailchimp-subscriber', {
          body: { email: trimmed },
        }),
      ]);
    } catch (err) {
      console.error('Post-subscribe tasks error:', err);
    }
  };

  return (
    <div className="w-full py-6 border-t border-border">
      <div className="max-w-md mx-auto text-center">
        <p className="eyebrow text-[hsl(var(--accent-gold))] text-xs mb-2">STAY CONNECTED</p>
        <p className="text-sm text-muted-foreground mb-4">Curated updates on events, circles & community stories.</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="flex-1 bg-card border-border"
          />
          <button
            type="submit"
            disabled={loading || !agreed}
            className="h-11 px-5 rounded-md bg-[hsl(var(--accent-gold))] text-white text-sm font-medium tracking-wide uppercase hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Subscribe</span>
          </button>
        </form>
        <label className="flex items-center gap-2 mt-3 text-left cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
            className="accent-[hsl(var(--accent-gold))] w-4 h-4 shrink-0 self-start mt-0.5"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I agree to receive newsletters and updates. View our{' '}
            <a href="/privacy" className="text-[hsl(var(--accent-gold))] underline">Privacy Policy</a>{' '}
            and{' '}
            <a href="/terms" className="text-[hsl(var(--accent-gold))] underline">Terms of Service</a>.
            <span className="text-destructive ml-1">*</span>
          </span>
        </label>
      </div>
    </div>
  );
};

export const Footer = () => {
  return (
    <footer className="w-full bg-background text-foreground transition-colors duration-200">
      <div className="content-container pt-24 pb-12">

        {/* ── Mobile layout ── */}
        <div className="flex flex-col items-center gap-6">
          <BrandLogo width={160} height={48} />
          <p className="text-[13px] text-muted-foreground leading-relaxed text-center max-w-[280px]">
            A private sanctuary for meaningful connection, curated events, and genuine friendships.
          </p>
          <div className="w-full max-w-2xl mx-auto mt-4">
            {Object.values(footerLinks).map((section) => (
              <FooterCollapsible key={section.title} section={section} />
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <NewsletterForm />

        {/* Daily Quote */}
        <DailyQuote />

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Make Friends and Socialize LLC. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              📍 Salt Lake City, Utah, USA
            </p>
          </div>
          <div className="flex items-center gap-5">
            <a href="https://www.facebook.com/profile.php?id=61575868888590" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150" aria-label="Facebook">
              <Facebook className="h-5 w-5" strokeWidth={1.5} />
            </a>
            <a href="https://www.instagram.com/makefriendsandsocialize/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150" aria-label="Instagram">
              <Instagram className="h-5 w-5" strokeWidth={1.5} />
            </a>
            <a href="https://www.tiktok.com/@makefriendsandsocialize" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150" aria-label="TikTok">
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors duration-150" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
