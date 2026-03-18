import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight, Sparkles, Users, Heart, Headphones } from 'lucide-react';
import { getTierDisplayName } from '@/lib/tier-utils';

interface PremiumPaywallProps {
  title: string;
  description: string;
  features: string[];
  currentTier?: string;
  icon?: 'network' | 'concierge' | 'connections' | 'founder';
}

const ICON_MAP = {
  network: Users,
  concierge: Headphones,
  connections: Heart,
  founder: Sparkles,
};

/** Blurred preview background content to hint at what's behind the paywall */
const PreviewContent = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
    <div className="grid grid-cols-3 gap-4 p-6 opacity-40">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
          <div className="h-8 w-full bg-muted rounded-lg mt-2" />
        </div>
      ))}
    </div>
  </div>
);

export function PremiumPaywall({ title, description, features, currentTier, icon = 'network' }: PremiumPaywallProps) {
  const Icon = ICON_MAP[icon];

  return (
    <div className="relative min-h-[60vh] rounded-2xl overflow-hidden border border-border bg-card">
      {/* Blurred preview background */}
      <PreviewContent />
      <div className="absolute inset-0 backdrop-blur-md bg-background/70" />

      {/* Upgrade overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-[60vh] p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[hsl(var(--accent-gold))]/10 border border-[hsl(var(--accent-gold))]/20 flex items-center justify-center">
            <Icon className="h-10 w-10 text-[hsl(var(--accent-gold))]" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl md:text-3xl text-foreground">{title}</h1>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>

          {/* Features list */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 text-left space-y-3">
            <p className="text-sm font-semibold text-foreground uppercase tracking-wider">
              What you'll unlock
            </p>
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Crown className="h-4 w-4 text-[hsl(var(--accent-gold))] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="w-full rounded-full bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-white uppercase tracking-widest text-xs font-bold h-12">
            <TransitionLink to="/membership">
              Upgrade to Premium
              <ArrowRight className="ml-2 h-4 w-4" />
            </TransitionLink>
          </Button>

          {/* Current tier */}
          {currentTier && (
            <p className="text-xs text-muted-foreground">
              Current membership: <span className="text-foreground font-medium">{getTierDisplayName(currentTier)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
