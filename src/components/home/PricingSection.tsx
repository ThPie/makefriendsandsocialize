import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { TIER_BENEFITS } from '@/lib/stripe-products';

export const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const tiers = [
    {
      id: 'socialite',
      data: TIER_BENEFITS.socialite,
      cta: 'Get Started',
      href: '/auth',
      popular: false,
      style: 'default' as const,
    },
    {
      id: 'insider',
      data: TIER_BENEFITS.insider,
      cta: 'Start Free Trial',
      href: '/membership',
      popular: true,
      style: 'featured' as const,
      trial: '30-day free trial',
    },
    {
      id: 'patron',
      data: TIER_BENEFITS.patron,
      cta: 'Start Free Trial',
      href: '/membership',
      popular: false,
      style: 'premium' as const,
      trial: '30-day free trial',
    }
  ];

  return (
    <section className="section-spacing bg-background" id="membership">
      <div ref={ref} className="content-container">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="eyebrow block mb-3">Membership</span>
          <h2 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1] mb-4">
            Invest in <span className="italic">Connection</span>
          </h2>
          <p className="text-muted-foreground text-base font-light max-w-lg mx-auto">
            Choose the membership that fits your lifestyle. All plans include a 30-day free trial.
          </p>
        </div>

        {/* Controls Container */}
        <div className="flex flex-col items-center justify-center mb-12 gap-6">
          {/* Billing toggle */}
          <div className="flex p-1 bg-card rounded-full border border-border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                billingCycle === 'monthly'
                  ? "gold-fill"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                billingCycle === 'yearly'
                  ? "gold-fill"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <span className="text-[10px] bg-[hsl(var(--accent-gold))]/20 text-[hsl(var(--accent-gold))] px-2 py-0.5 rounded-full font-medium">-20%</span>
            </button>
          </div>

          {/* Features toggle */}
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="flex items-center gap-2 text-sm text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] transition-colors group"
          >
            <span className="font-light tracking-wide uppercase">{showAllFeatures ? "Hide details" : "See all details"}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showAllFeatures ? "rotate-180" : "group-hover:translate-y-0.5")} />
          </button>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
          {tiers.map((tier, index) => {
            const { data } = tier;
            const features = data.features || [];
            const missingFeatures = data.missingFeatures || [];

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
                  "relative flex flex-col rounded-2xl p-8 transition-all duration-700",
                  // Insider is tallest — elevated 24px
                  tier.popular
                    ? "bg-popover border border-[hsl(var(--accent-gold))] md:pb-12 md:-mt-6"
                    : tier.style === 'premium'
                      ? "bg-card border border-border"
                      : "bg-card border border-border",
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {/* Popular badge — rotated */}
                {tier.popular && (
                  <div className="absolute -top-3 right-6 z-10 -rotate-2">
                    <span className="inline-block px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] font-medium rounded-full gold-fill">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier name */}
                <h3 className="text-foreground text-base font-light mb-4">
                  {data.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-display text-[56px] leading-none text-foreground tracking-tight">
                    {displayPrice}
                  </span>
                  <span className="text-base text-muted-foreground">{displayPeriod}</span>
                </div>

                {billingCycle === 'yearly' && 'annualSavings' in data && (
                  <p className="text-xs text-[hsl(var(--accent-gold))] font-medium mb-4">
                    billed yearly (save {data.annualSavings})
                  </p>
                )}

                <p className="text-sm text-muted-foreground font-light mb-auto">
                  {data.description}
                </p>

                {/* Features (Conditionally Visible) */}
                <div
                  className={cn(
                    "transition-all duration-500 ease-in-out overflow-hidden",
                    showAllFeatures ? "max-h-[800px] opacity-100 mt-8 mb-8" : "max-h-0 opacity-0 mt-0 mb-8"
                  )}
                >
                  <ul className="space-y-3 flex-1">
                    {features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm text-foreground">
                        <Check className="h-4 w-4 text-[hsl(var(--accent-gold))] flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <span className="font-light">{feature}</span>
                      </li>
                    ))}
                    {/* Missing features — struck through, muted */}
                    {missingFeatures.map((feature, fi) => (
                      <li key={`m-${fi}`} className="flex items-start gap-3 text-sm text-[hsl(var(--text-muted))]">
                        <Check className="h-4 w-4 flex-shrink-0 mt-0.5 opacity-30" strokeWidth={1.5} />
                        <span className="font-light line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  className={cn(
                    "w-full rounded-[10px] h-12 text-sm tracking-wide transition-opacity duration-150",
                    tier.popular
                      ? "gold-fill hover:opacity-90"
                      : "bg-card border border-border text-foreground hover:bg-accent"
                  )}
                >
                  <TransitionLink to={tier.href}>
                    {tier.cta}
                  </TransitionLink>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
