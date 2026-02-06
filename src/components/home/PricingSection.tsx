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
    color: 'from-zinc-500 to-zinc-400',
    glow: 'bg-zinc-500/5',
    border: 'border-border dark:border-white/10'
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
    color: 'from-amber-400 to-orange-500',
    glow: 'bg-amber-500/10',
    border: 'border-amber-500/30'
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
    color: 'from-primary to-emerald-600',
    glow: 'bg-primary/10',
    border: 'border-primary/30'
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
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-secondary/10 dark:bg-[#0a1f1a] relative overflow-hidden" id="membership">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className="mx-auto max-w-7xl relative z-10">
        {/* Membership Header */}
        <div className={`text-center mb-10 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1">
            Membership
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Pricing on <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-primary">your terms</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Whichever plan you pick, it's free until you love your matches. That's our promise.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex p-1 bg-secondary dark:bg-white/5 rounded-full border border-border dark:border-white/10">
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
              <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex justify-center mb-8">
          <div className="flex p-1 bg-secondary dark:bg-white/5 rounded-full border border-border dark:border-white/10 backdrop-blur-sm relative">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setActiveTab(tier.id as any)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative z-10",
                  activeTab === tier.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {activeTab === tier.id && (
                  <div className={cn(
                    "absolute inset-0 rounded-full shadow-lg transition-all duration-300 -z-10",
                    tier.id === 'insider' ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                      tier.id === 'patron' ? "bg-gradient-to-r from-primary to-emerald-600" :
                        "bg-foreground"
                  )} />
                )}
                {tier.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
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
                  "relative rounded-[2rem] p-8 border backdrop-blur-md transition-all duration-500 flex flex-col h-full group",
                  "bg-card dark:bg-white/[0.03] hover:bg-secondary/50 dark:hover:bg-white/[0.06]",
                  tier.border,
                  tier.popular ? "shadow-[0_0_40px_-10px_rgba(251,191,36,0.15)] ring-1 ring-amber-500/20" : "",
                  isMobileHidden ? "hidden md:flex" : "flex",
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
                  `transition-delay-${index * 100}`
                )}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-500/20 to-transparent pr-4 pt-4 rounded-tr-[2rem]">
                    <span className="inline-block px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={cn("font-display text-2xl font-bold mb-2 text-foreground")}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-display text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                      {displayPrice}
                    </span>
                    <span className="text-muted-foreground font-medium">{displayPeriod}</span>
                  </div>

                  {billingCycle === 'yearly' && tier.yearlyNote && (
                    <p className="text-xs text-amber-600 dark:text-amber-500/80 font-medium">{tier.yearlyNote}</p>
                  )}

                  <p className="text-muted-foreground text-sm mt-4 min-h-[40px]">
                    {tier.description}
                  </p>
                </div>

                {/* Divider with Gradient */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border dark:via-white/10 to-transparent mb-8" />

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {visibleFeatures.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 group/item">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        tier.popular ? "bg-amber-500/20 text-amber-600 dark:text-amber-500 group-hover/item:bg-amber-500 group-hover/item:text-black"
                          : tier.name === 'Patron' ? "bg-primary/20 text-primary"
                            : "bg-muted text-foreground dark:bg-white/10 dark:text-white"
                      )}>
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className="text-muted-foreground dark:text-zinc-300 text-sm font-medium leading-relaxed">{feature}</span>
                    </li>
                  ))}

                  {/* Missing Features */}
                  {visibleMissingFeatures && visibleMissingFeatures.length > 0 && (
                    <div className={cn(
                      "pt-4 opacity-50 transition-opacity hover:opacity-100",
                      !isExpanded && "opacity-40"
                    )}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3 pl-1">
                        Not Included
                      </p>
                      <ul className="space-y-3">
                        {visibleMissingFeatures.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <Lock className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground/70 text-sm">{feature}</span>
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
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 uppercase tracking-wider font-bold"
                  >
                    {isExpanded ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <span>Compare All Features</span>
                        <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "w-full rounded-xl py-6 text-base font-semibold shadow-xl transition-all duration-300 hover:scale-[1.02]",
                    tier.popular
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:from-amber-300 hover:to-orange-400 hover:shadow-amber-500/20"
                      : tier.name === 'Patron'
                        ? "bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary/90 hover:to-emerald-500 hover:shadow-primary/20"
                        : "bg-secondary dark:bg-white/10 text-foreground dark:text-white hover:bg-secondary/80 dark:hover:bg-white/20 border border-border dark:border-white/5"
                  )}
                >
                  <Link to={tier.href}>
                    {tier.cta}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Removed small value highlight cards per user request */}
      </div>
    </section>
  );
};
