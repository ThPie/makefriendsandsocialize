import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Explorer',
    description: 'Start your journey',
    price: 'Free',
    period: '',
    features: [
      'Browse all events',
      'Purchase event tickets',
      'Create a Connection Profile',
      'AI-assisted curated introductions',
      '$10 per connection reveal',
    ],
    cta: 'Get Started',
    href: '/auth',
    variant: 'outline' as const,
    popular: false,
    icon: Star,
  },
  {
    name: 'Member',
    description: 'For intentional connectors',
    price: '$59',
    period: '/month',
    annualPrice: '$499/year (save 30%)',
    features: [
      'Unlimited connection reveals',
      '20% off paid events',
      'Complimentary members-only gatherings',
      'Founders Circle access',
      'Member badge',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/membership',
    variant: 'default' as const,
    popular: true,
    icon: Sparkles,
    trial: '7-day free trial',
  },
  {
    name: 'Fellow',
    description: 'The ultimate experience',
    price: '$89.99',
    period: '/month',
    annualPrice: '$899/year (save 17%)',
    features: [
      'Everything in Member',
      '30% off paid events',
      'Bring one guest to all events',
      'List your business in the Circle',
      'Featured in the community newsletter',
      'Priority introductions',
      'Invitation-only Fellow dinners & experiences',
    ],
    cta: 'Start Free Trial',
    href: '/membership',
    variant: 'secondary' as const,
    popular: false,
    icon: Crown,
    trial: '7-day free trial',
    exclusivityNote: 'Limited availability',
  },
];

export const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();

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
            Start free and upgrade when you're ready to unlock the full community experience.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
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
                  {tier.annualPrice && (
                    <p className="text-xs text-primary mt-1">{tier.annualPrice}</p>
                  )}
                  {tier.trial && (
                    <Badge variant="secondary" className="mt-2">
                      {tier.trial}
                    </Badge>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={tier.variant}
                  className="w-full rounded-full"
                >
                  <Link to={tier.href}>{tier.cta}</Link>
                </Button>

                {/* Exclusivity note for Fellow */}
                {tier.exclusivityNote && (
                  <p className="text-xs text-muted-foreground mt-3 text-center italic">
                    {tier.exclusivityNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
