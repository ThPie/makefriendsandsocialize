import { Button } from '@/components/ui/button';
import { Check, PartyPopper, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const benefits = [
  {
    id: 'access',
    title: 'Exclusive Access',
    description: 'Gain entry to our private, members-only events, from intimate soirées to grand galas, held in the most sought-after venues.',
    Icon: PartyPopper,
  },
  {
    id: 'networking',
    title: 'Curated Networking',
    description: 'Connect with a diverse and influential community of leaders, innovators, and connoisseurs from various fields.',
    Icon: Users,
  },
  {
    id: 'experiences',
    title: 'Bespoke Experiences',
    description: 'Enjoy meticulously planned experiences that cater to a refined palate, from gourmet dining to unique cultural engagements.',
    Icon: Sparkles,
  },
];

export const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-secondary/5" id="membership">
      <div ref={ref} className="mx-auto max-w-7xl">
        {/* Pricing Header */}
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-20 md:mb-28">
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

        {/* Benefit Cards - Dark Section */}
        <div className={`bg-secondary rounded-2xl p-8 md:p-12 lg:p-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.id} 
                className={`group flex flex-col items-center gap-5 text-center p-6 rounded-xl transition-all duration-300 hover:bg-secondary-foreground/5 scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] group-hover:scale-110">
                  <benefit.Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-secondary-foreground italic transition-colors duration-300 group-hover:text-primary">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-secondary-foreground/70 transition-colors duration-300 group-hover:text-secondary-foreground/90">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
