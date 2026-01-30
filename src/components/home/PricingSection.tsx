import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles, Star, Lock, Heart, Gift, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const INITIAL_FEATURES_SHOWN = 4;
const tiers = [
  {
    name: 'Socialite',
    description: 'Your gateway to the Circle',
    price: 'Free',
    period: '',
    dailyPrice: null,
    features: [
      'Browse all public events',
      'Purchase event tickets',
      'Create a Connection Profile',
      'Hand-picked introductions ($19/reveal)',
      'Concierge support with paid reveals',
      'Les Amis French circle access',
    ],
    missingFeatures: [
      'Unlimited connection reveals',
      'Hand-picked introductions & matchmaking',
      'Invitation-only gatherings',
      'Discounts at partners & Club businesses',
      'Event discounts',
    ],
    cta: 'Get Started',
    href: '/auth',
    variant: 'outline' as const,
    popular: false,
    icon: Star,
  },
  {
    name: 'Insider',
    description: 'For those who seek more',
    price: '$1.63',
    period: '/day',
    billedNote: 'billed $49/mo',
    dailyPrice: 1.63,
    annualPrice: '$470/year (save 20%)',
    features: [
      'Unlimited connection reveals',
      'Hand-picked introductions & matchmaking',
      '20% off all paid events',
      'Invitation-only member gatherings',
      'Discounts at partners & Club businesses',
      'Connected Circle business directory',
      'Concierge support',
    ],
    missingFeatures: [
      '30% event discounts',
      'Bring a guest free',
      'List your business & get leads',
      'Priority introductions',
    ],
    cta: 'Start Free Trial',
    href: '/membership',
    variant: 'default' as const,
    popular: true,
    icon: Crown,
    trial: '30-day free trial',
  },
  {
    name: 'Patron',
    description: 'The ultimate experience',
    price: '$2.63',
    period: '/day',
    billedNote: 'billed $79/mo',
    dailyPrice: 2.63,
    annualPrice: '$758/year (save 20%)',
    features: [
      'Everything in Insider',
      '30% off all paid events',
      '+1 guest privileges at all events',
      'List your business & receive leads',
      'Priority introductions',
      'Featured in community newsletter',
      'Exclusive Patron dinners & experiences',
      'Concierge support',
    ],
    missingFeatures: [],
    cta: 'Start Free Trial',
    href: '/membership',
    variant: 'secondary' as const,
    popular: false,
    icon: Crown,
    trial: '30-day free trial',
    exclusivityNote: 'Limited availability',
  },
];

export const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [expandedTiers, setExpandedTiers] = useState<Record<number, boolean>>({});

  const toggleExpanded = (index: number) => {
    setExpandedTiers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-secondary/5" id="membership">
      <div ref={ref} className="mx-auto max-w-7xl">
        {/* Membership Header */}
        <div className={`text-center mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Membership
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Choose Your <span className="text-primary">Experience</span>
          </h2>
          <p className="text-foreground/80 text-base italic max-w-2xl mx-auto mb-4 border-l-2 border-primary pl-4 text-left">
            Make Friends & Socialize is a private social club — not a dating app.
            We create intentional connections through curated events, community, and introductions.
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free and upgrade when you're ready for the full Circle experience.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isExpanded = expandedTiers[index] || false;
            const visibleFeatures = isExpanded ? tier.features : tier.features.slice(0, INITIAL_FEATURES_SHOWN);
            const hasMoreFeatures = tier.features.length > INITIAL_FEATURES_SHOWN;
            const visibleMissingFeatures = isExpanded ? tier.missingFeatures : tier.missingFeatures?.slice(0, 2) || [];
            const hasMoreMissing = (tier.missingFeatures?.length || 0) > 2;

            return (
              <div
                key={index}
                className={cn(
                  "relative bg-card rounded-2xl p-8 border transition-all duration-500 hover:-translate-y-2 hover:shadow-elegant scroll-animate",
                  `scroll-animate-delay-${index + 1}`,
                  isVisible ? 'visible' : '',
                  tier.popular
                    ? 'border-primary shadow-elegant'
                    : 'border-border/50'
                )}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium z-10 whitespace-nowrap">
                    Most Popular
                  </span>
                )}

                <div className="text-center mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
                    tier.popular ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      tier.popular ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {tier.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display text-4xl font-bold text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  {tier.billedNote && (
                    <p className="text-xs text-muted-foreground mt-1">{tier.billedNote}</p>
                  )}
                  {tier.annualPrice && (
                    <p className="text-xs text-primary mt-1">{tier.annualPrice}</p>
                  )}
                  {tier.trial && (
                    <Badge variant="secondary" className="mt-2">
                      {tier.trial}
                    </Badge>
                  )}
                </div>

                {/* Included Features */}
                <ul className="space-y-3 mb-4">
                  {visibleFeatures.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Missing Features (Grayscale with Lock) - Only show when expanded or first 2 */}
                {visibleMissingFeatures && visibleMissingFeatures.length > 0 && (
                  <div className={cn(
                    "border-t border-border/50 pt-4 mb-4",
                    !isExpanded && "opacity-70"
                  )}>
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-3 font-medium">
                      Upgrade to unlock
                    </p>
                    <ul className="space-y-2">
                      {visibleMissingFeatures.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Lock className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground/50 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* See More / See Less Button */}
                {(hasMoreFeatures || hasMoreMissing) && (
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
                  >
                    {isExpanded ? (
                      <>
                        <span>See less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>See all benefits</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                <Button
                  asChild
                  variant={tier.variant}
                  className="w-full rounded-full"
                >
                  <Link to={tier.href}>{tier.cta}</Link>
                </Button>

                {/* Exclusivity note for Patron */}
                {tier.exclusivityNote && (
                  <p className="text-xs text-muted-foreground mt-3 text-center italic">
                    {tier.exclusivityNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Value Highlights */}
        <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto scroll-animate scroll-animate-delay-4 ${isVisible ? 'visible' : ''}`}>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Slow Dating</p>
              <p className="text-sm text-muted-foreground">Curated matchmaking</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Partner Perks</p>
              <p className="text-sm text-muted-foreground">Exclusive discounts</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Business Leads</p>
              <p className="text-sm text-muted-foreground">Patrons get qualified leads</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
