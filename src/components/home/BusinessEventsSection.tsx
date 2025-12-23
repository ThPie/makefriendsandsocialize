import { Briefcase, Users, Presentation, Handshake } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const businessFeatures = [
  {
    icon: Briefcase,
    title: 'Founder Mixers',
    description: 'Connect with fellow entrepreneurs in an intimate setting designed for meaningful conversations.',
  },
  {
    icon: Users,
    title: 'Industry Roundtables',
    description: 'Join curated discussions with peers from your sector to share insights and opportunities.',
  },
  {
    icon: Presentation,
    title: 'Pitch & Learn Nights',
    description: 'Present your ideas and receive feedback from experienced founders and investors.',
  },
  {
    icon: Handshake,
    title: 'Partnership Dinners',
    description: 'Exclusive dinners that bring together complementary businesses for collaboration.',
  },
];

export const BusinessEventsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-muted/30" id="business">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`text-center mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-3">
            For Entrepreneurs
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Business <span className="text-primary">Networking Events</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Exclusive gatherings designed for founders, executives, and business owners to forge partnerships and grow together.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {businessFeatures.map((feature, index) => (
            <div
              key={index}
              className={`group bg-card rounded-2xl p-6 shadow-elegant border border-border/50 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className={`text-center scroll-animate ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.5s' }}>
          <Button size="lg" asChild className="rounded-full">
            <Link to="/events">Explore Business Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
