import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Benefit } from '@/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const tiers = [
  {
    name: 'Patron',
    description: 'Perfect for getting started',
    price: '$99',
    period: '/month',
    features: [
      'Access to weekly events',
      '1 guest per event',
      'Community app access',
      'Member newsletter',
      'Early event notifications',
    ],
    cta: 'Get Started',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Fellow',
    description: 'For the social enthusiast',
    price: '$249',
    period: '/month',
    features: [
      'Everything in Patron',
      '2 guests per event',
      'Priority reservations',
      'Exclusive member dinners',
      'Matchmaking introductions',
      'VIP event access',
    ],
    cta: 'Join Now',
    variant: 'default' as const,
    popular: true,
  },
  {
    name: 'Founder',
    description: 'Ultimate membership experience',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Fellow',
      'Unlimited guests',
      'Private event hosting',
      'Concierge service',
      'Global chapter access',
      'Founding member benefits',
    ],
    cta: 'Contact Us',
    variant: 'secondary' as const,
    popular: false,
  },
];

const benefits: Benefit[] = [
  {
    id: 'access',
    title: 'Exclusive Access',
    description: 'Gain entry to our private, members-only events, from intimate soirées to grand galas, held in the most sought-after venues.',
    iconName: 'celebration',
  },
  {
    id: 'networking',
    title: 'Curated Networking',
    description: 'Connect with a diverse and influential community of leaders, innovators, and connoisseurs from various fields.',
    iconName: 'groups',
  },
  {
    id: 'experiences',
    title: 'Bespoke Experiences',
    description: 'Enjoy meticulously planned experiences that cater to a refined palate, from gourmet dining to unique cultural engagements.',
    iconName: 'auto_awesome',
  },
];

export const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-secondary/5" id="membership">
      <div ref={ref} className="mx-auto max-w-7xl">
        {/* Privileges of Membership */}
        <div className={`mx-auto max-w-4xl text-center mb-16 md:mb-20 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            The Privileges of Membership
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Joining The Gathering Society opens the door to a world of unparalleled
            experiences and connections.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-20 md:mb-28">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.id} 
              className={`flex flex-col items-center gap-4 text-center group scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <span className="material-symbols-outlined text-3xl">
                  {benefit.iconName}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className={`text-center mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Membership
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the membership that fits your lifestyle and start connecting today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-2xl p-8 border transition-all duration-300 hover-lift scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''} ${
                tier.popular
                  ? 'border-primary shadow-elegant'
                  : 'border-border/50'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              )}

              <div className="text-center mb-6">
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
                <Link to="/membership">{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
