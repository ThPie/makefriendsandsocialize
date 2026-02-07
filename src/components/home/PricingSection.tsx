import { Button } from '@/components/ui/button';
import { Check, Crown, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const INITIAL_FEATURES_SHOWN = 4;
const tiers = [
  {
    name: 'Socialite',
    id: 'socialite',
    description: 'Your gateway to the Circle',
    monthlyPrice: 'Free',
    yearlyPrice: 'Free',
    period: '',
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
    glow: 'bg-muted/5',
    border: 'border-border/60'
  },
  {
    name: 'Insider',
    id: 'insider',
    description: 'For those who seek more',
    monthlyPrice: '$49',
    yearlyPrice: '$470',
    period: '/mo',
    yearlyNote: 'billed yearly (save 20%)',
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
    trial: '30-day free trial',
    glow: 'bg-primary/10',
    border: 'border-primary/40'
  },
  {
    name: 'Patron',
    id: 'patron',
    description: 'The ultimate experience',
    monthlyPrice: '$79',
    yearlyPrice: '$758',
    period: '/mo',
    yearlyNote: 'billed yearly (save 20%)',
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
    cta: 'Join Waitlist',
    href: '/membership',
    variant: 'secondary' as const,
    popular: false,
    trial: '30-day free trial',
    exclusivityNote: 'Limited availability',
    glow: 'bg-[hsl(var(--accent-gold))]/10',
    border: 'border-[hsl(var(--accent-gold))]/30'
  },
];

export const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [expandedTiers, setExpandedTiers] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'socialite' | 'insider' | 'patron'>('insider');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const toggleExpanded = (index: number) => {
    setExpandedTiers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-background" id="membership">
      <div ref={ref} className="mx-auto max-w-7xl relative z-10">
        {/* Membership Header */}
        <div className={`text-center mb-10 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1">
            Membership
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Pricing on <span className="text-primary">your terms</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Whichever plan you pick, it's free until you love your matches. That's our promise.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex p-1 bg-muted/50 rounded-full border border-border/60">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                billingCycle === 'monthly'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                billingCycle === 'yearly'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <span className="text-xs bg-[hsl(var(--accent-gold))] text-foreground px-2 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex justify-center mb-8">
          <div className="flex p-1 bg-muted/50 rounded-full border border-border/60">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setActiveTab(tier.id as any)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative z-10",
                  activeTab === tier.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tier.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            const isMobileHidden = activeTab !== tier.id;

            const isExpanded = expandedTiers[index] || false;
            const visibleFeatures = isExpanded ? tier.features : tier.features.slice(0, INITIAL_FEATURES_SHOWN);
            const hasMoreFeatures = tier.features.length > INITIAL_FEATURES_SHOWN;
            const visibleMissingFeatures = isExpanded ? tier.missingFeatures : [];
            const hasMoreMissing = (tier.missingFeatures?.length || 0) > 0;

            const displayPrice = billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
            const displayPeriod = tier.monthlyPrice === 'Free' ? '' : (billingCycle === 'yearly' ? '/yr' : '/mo');

            return (
              <div
                key={index}
                className={cn(
                  "relative flex flex-col gap-6 rounded-2xl p-8 transition-all duration-300",
                  tier.popular
                    ? "bg-card border-2 border-primary shadow-sm"
                    : "bg-card border border-border/60 hover:border-primary/40",
                  isMobileHidden ? "hidden md:flex" : "flex",
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className={cn("flex flex-col gap-2", tier.popular ? "mt-2" : "")}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-foreground text-lg font-bold font-display">{tier.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1.5 text-foreground mt-2">
                    <span className="text-5xl font-black leading-tight tracking-tight font-display">
                      {displayPrice}
                    </span>
                    <span className="text-muted-foreground text-sm font-medium">{displayPeriod}</span>
                  </div>

                  {billingCycle === 'yearly' && tier.yearlyNote && (
                    <p className="text-xs text-primary font-medium">{tier.yearlyNote}</p>
                  )}

                  <p className="text-sm text-muted-foreground mt-2">
                    {tier.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-4 flex-1">
                  {visibleFeatures.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 text-sm text-foreground">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}

                  {/* Missing Features */}
                  {visibleMissingFeatures && visibleMissingFeatures.length > 0 && (
                    <div className={cn(
                      "border-t border-border/50 pt-4 mb-4",
                      !isExpanded && "opacity-70"
                    )}>
                      <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-3 font-medium">
                        Upgrade to unlock
                      </p>
                      <ul className="space-y-3">
                        {visibleMissingFeatures.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3 text-sm text-muted-foreground/50">
                            <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </ul>

                {/* See More Toggle */}
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

                {/* CTA Button */}
                <Button
                  asChild
                  variant={tier.popular ? 'default' : 'secondary'}
                  className="w-full rounded-full min-h-[48px]"
                >
                  <Link to={tier.href}>
                    {tier.cta}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
