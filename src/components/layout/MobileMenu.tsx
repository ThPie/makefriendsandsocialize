import { useState } from 'react';
import { X, Menu } from 'lucide-react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Events', to: '/events' },
  { label: 'Circles', to: '/circles' },
  { label: 'Membership', to: '/membership' },
  { label: 'Blog', to: '/journal' },
];

export const MobileMenu = ({ isTransparent }: { isTransparent: boolean }) => {
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();

  return (
    <div className="md:hidden flex items-center gap-3">
      {/* Avatar on mobile when logged in */}
      {user && (
        <TransitionLink to="/portal">
          <Avatar className="h-10 w-10 border-2 border-[hsl(var(--accent-gold))]/60">
            <AvatarImage src={profile?.avatar_urls?.[0]} />
            <AvatarFallback className="bg-primary/80 text-primary-foreground text-xs font-medium">
              {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'M'}{(profile?.last_name?.[0] || '').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </TransitionLink>
      )}

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
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-[85vw] max-w-[360px] bg-card border-l border-border flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <BrandLogo width={120} height={34} />
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-foreground hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col p-6 gap-1 flex-1">
          {navLinks.map((link) => (
            <TransitionLink
              key={link.label}
              to={link.to}
              onClick={() => setOpen(false)}
              className="py-3 px-2 text-lg font-display text-foreground hover:text-[hsl(var(--accent-gold))] transition-colors border-b border-border/40 last:border-0"
            >
              {link.label}
            </TransitionLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-6 border-t border-border flex flex-col gap-3">
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
