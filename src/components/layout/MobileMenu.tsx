import { useState, useEffect } from 'react';
import { X, Menu, Home, Calendar, Users, Heart, Newspaper, Mail, HelpCircle, ChevronDown, Instagram, Facebook, Linkedin } from 'lucide-react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { TikTokIcon } from '@/components/common/TikTokIcon';

import lesAmisImg from '@/assets/les-amis-hero-new.webp';
import gentlemenImg from '@/assets/gentlemen-hero-new.webp';
import couplesCircleImg from '@/assets/circles/couples-circle-hero.png';
import activeOutdoorImg from '@/assets/active-outdoor-hero-new.jpg';

const womenSocietyImg = 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=400&auto=format&fit=crop';

const navLinks = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Events', to: '/events', icon: Calendar },
  { label: 'Membership', to: '/membership', icon: Heart },
  { label: 'Blog', to: '/journal', icon: Newspaper },
  { label: 'Contact', to: '/contact', icon: Mail },
  { label: 'FAQ', to: '/faq', icon: HelpCircle },
];

const circleItems = [
  { label: 'The Gentlemen', to: '/circles/the-gentlemen', image: gentlemenImg },
  { label: 'The Ladies Society', to: '/circles/the-ladies-society', image: womenSocietyImg },
  { label: 'Les Amis', to: '/circles/les-amis', image: lesAmisImg },
  { label: "Couple's Circle", to: '/circles/couples-circle', image: couplesCircleImg },
  { label: 'Active & Outdoor', to: '/circles/active-outdoor', image: activeOutdoorImg },
  { label: 'The Exchange', to: '/circles/the-exchange', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop' },
];

const socialLinks = [
  { href: 'https://www.instagram.com/makefriendsandsocialize/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.facebook.com/profile.php?id=61575868888590', icon: Facebook, label: 'Facebook' },
  { href: 'https://www.tiktok.com/@makefriendsandsocialize', icon: TikTokIcon, label: 'TikTok' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
];

export const MobileMenu = ({ isTransparent }: { isTransparent: boolean }) => {
  const [open, setOpen] = useState(false);
  const [circlesOpen, setCirclesOpen] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<string | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('daily_quotes')
      .select('quote_text')
      .eq('quote_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.quote_text) {
          setDailyQuote(data.quote_text);
        } else {
          // Fallback: get the latest quote
          supabase
            .from('daily_quotes')
            .select('quote_text')
            .order('quote_date', { ascending: false })
            .limit(1)
            .maybeSingle()
            .then(({ data: latest }) => {
              setDailyQuote(latest?.quote_text || '"The only way to have a friend is to be one." — Ralph Waldo Emerson');
            });
        }
      });
  }, []);

  return (
    <div className="md:hidden flex items-center gap-3">

      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "w-10 h-10 flex items-center justify-center transition-colors",
          isTransparent ? "text-white" : "text-foreground"
        )}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-[85vw] max-w-[360px] bg-card border-l border-border flex flex-col transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            {user ? (
              <TransitionLink to="/portal" onClick={() => setOpen(false)}>
                <Avatar className="h-10 w-10 border-2 border-[hsl(var(--accent-gold))]/60">
                  <AvatarImage src={profile?.avatar_urls?.[0]} />
                  <AvatarFallback className="bg-primary/80 text-primary-foreground text-xs font-medium">
                    {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'M'}{(profile?.last_name?.[0] || '').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TransitionLink>
            ) : (
              <BrandLogo width={120} height={34} />
            )}
            {user && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{profile?.first_name || 'Member'}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Member</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-foreground hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Nav links */}
          <nav className="flex flex-col p-5 gap-0.5">
            {navLinks.map((link) => (
              <TransitionLink
                key={link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-3 px-3 text-base font-medium text-foreground hover:text-[hsl(var(--accent-gold))] hover:bg-accent/50 rounded-xl transition-colors duration-150"
              >
                <link.icon className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} />
                {link.label}
              </TransitionLink>
            ))}

            {/* Circles dropdown */}
            <button
              onClick={() => setCirclesOpen(!circlesOpen)}
              className="flex items-center justify-between py-3 px-3 text-base font-medium text-foreground hover:text-[hsl(var(--accent-gold))] hover:bg-accent/50 rounded-xl transition-colors duration-150 w-full"
            >
              <span className="flex items-center gap-3">
                <Users className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.5} />
                Circles
              </span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", circlesOpen && "rotate-180")} />
            </button>

            {/* Circles sub-menu */}
            <div className={cn(
              "overflow-hidden transition-all duration-200",
              circlesOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="flex flex-col gap-2 pl-2 pr-1 py-2">
                {circleItems.map((circle) => (
                  <TransitionLink
                    key={circle.label}
                    to={circle.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border hover:border-[hsl(var(--accent-gold))]/40 transition-colors duration-150 group"
                  >
                    <img
                      src={circle.image}
                      alt={circle.label}
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                    />
                    <span className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--accent-gold))] transition-colors">
                      {circle.label}
                    </span>
                  </TransitionLink>
                ))}
                <TransitionLink
                  to="/circles"
                  onClick={() => setOpen(false)}
                  className="text-center text-xs text-[hsl(var(--accent-gold))] uppercase tracking-widest font-medium py-2 hover:underline"
                >
                  View All Circles
                </TransitionLink>
              </div>
            </div>
          </nav>

          {/* Social media */}
          <div className="px-5 py-4 border-t border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Follow Us</p>
            <div className="flex items-center gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--accent-gold))] hover:border-[hsl(var(--accent-gold))]/40 transition-colors duration-150"
                  aria-label={s.label}
                >
                  <s.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Daily Quote */}
          {dailyQuote && (
            <div className="px-5 py-4 border-t border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Daily Quote</p>
              <p className="text-sm text-[hsl(var(--accent-gold))] italic font-display leading-relaxed">
                &ldquo;{dailyQuote}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="p-5 border-t border-border flex flex-col gap-3 shrink-0">
          {user ? (
            <TransitionLink
              to="/portal"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center rounded-full h-11 text-sm tracking-widest uppercase font-medium bg-[hsl(var(--accent-gold))] text-white hover:opacity-90 transition-opacity"
            >
              Dashboard
            </TransitionLink>
          ) : (
            <>
              <TransitionLink
                to="/membership"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center rounded-full h-11 text-sm tracking-widest uppercase font-medium bg-[hsl(var(--accent-gold))] text-white hover:opacity-90 transition-opacity"
              >
                Become Member
              </TransitionLink>
              <TransitionLink
                to="/auth"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center rounded-full h-11 text-sm tracking-widest uppercase font-medium border border-border text-foreground hover:bg-accent transition-colors"
              >
                Sign In
              </TransitionLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
