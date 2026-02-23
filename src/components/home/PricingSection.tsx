import { Check, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { TIER_BENEFITS } from '@/lib/stripe-products';

const INITIAL_FEATURES_SHOWN = 4;

export const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({});
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const toggleExpanded = (id: string) => {
    setExpandedTiers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tiers = [
    { id: 'socialite', data: TIER_BENEFITS.socialite, cta: 'Get Started', href: '/auth', popular: false },
    { id: 'insider', data: TIER_BENEFITS.insider, cta: 'Start Free Trial', href: '/membership', popular: true, trial: '30-day free trial' },
    { id: 'patron', data: TIER_BENEFITS.patron, cta: 'Start Free Trial', href: '/membership', popular: false, trial: '30-day free trial' },
  ];

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-background" id="membership">
      <div ref={ref} className={`mx-auto max-w-[1200px] transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        <div className="text-center mb-12">
          <span className="section-label mb-3 block">Membership</span>
          <h2 className="font-display text-4xl md:text-5xl font-normal text-foreground mb-4">
            Pricing on <span className="italic text-[hsl(var(--gold))]">Your Terms</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Whichever plan you pick, it's free until you love your matches.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex p-1 bg-surface rounded-full border border-border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                billingCycle === 'monthly'
                  ? "bg-[hsl(var(--gold))] text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2",
                billingCycle === 'yearly'
                  ? "bg-[hsl(var(--gold))] text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <span className="text-[10px] bg-[hsl(var(--gold-light))] text-background px-2 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards — Insider elevated */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto items-start">
          {tiers.map((tier) => {
            const { data } = tier;
            const isExpanded = expandedTiers[tier.id] || false;
            const features = data.features || [];
            const missingFeatures = data.missingFeatures || [];
            const visibleFeatures = isExpanded ? features : features.slice(0, INITIAL_FEATURES_SHOWN);
            const visibleMissing = isExpanded ? missingFeatures : [];
            const hasMore = features.length > INITIAL_FEATURES_SHOWN || missingFeatures.length > 0;

            let displayPrice = 'Free';
            let displayPeriod = '';
            if ('monthlyPrice' in data && data.monthlyPrice > 0) {
              const priceValue = billingCycle === 'yearly' ? data.annualPrice : data.monthlyPrice;
              displayPrice = `$${priceValue}`;
              displayPeriod = billingCycle === 'yearly' ? '/yr' : '/mo';
            }

            return (
              <div
                key={tier.id}
                className={cn(
                  "relative flex flex-col gap-6 rounded-2xl p-8 transition-all duration-200",
                  tier.popular
                    ? "bg-[hsl(var(--surface-raised))] border border-[hsl(var(--gold))] md:-mt-6 md:pb-14"
                    : "bg-surface border border-border",
                  // On mobile, show Insider first via order
                  tier.popular ? "order-first md:order-none" : ""
                )}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="absolute -top-3 right-6 z-10 -rotate-2">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[hsl(var(--gold))] text-background">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-foreground text-lg font-display mb-4">{data.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[56px] leading-none text-foreground">
                      {displayPrice}
                    </span>
                    <span className="text-muted-foreground text-base">{displayPeriod}</span>
                  </div>
                  {billingCycle === 'yearly' && 'annualSavings' in data && (
                    <p className="text-xs text-[hsl(var(--gold))] mt-1">billed yearly (save {data.annualSavings})</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-3">{data.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {visibleFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <Check className="h-4 w-4 text-[hsl(var(--gold))] shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {visibleMissing.map((feature, i) => (
                    <li key={`m-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground line-through opacity-50">
                      <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {hasMore && (
                  <button
                    onClick={() => toggleExpanded(tier.id)}
                    className="flex items-center justify-center gap-1 text-sm text-[hsl(var(--gold))] hover:text-[hsl(var(--gold-light))] transition-colors"
                  >
                    {isExpanded ? <><span>See less</span><ChevronUp className="w-4 h-4" /></> : <><span>See all benefits</span><ChevronDown className="w-4 h-4" /></>}
                  </button>
                )}

                <TransitionLink
                  to={tier.href}
                  className={cn(
                    "flex items-center justify-center w-full h-12 rounded-[10px] text-sm font-medium tracking-wider uppercase transition-colors duration-200",
                    tier.popular
                      ? "bg-[hsl(var(--gold))] text-background hover:bg-[hsl(var(--gold-light))]"
                      : "border border-border text-foreground hover:bg-surface-raised hover:border-[hsl(var(--gold))]/40"
                  )}
                >
                  {tier.cta}
                </TransitionLink>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
