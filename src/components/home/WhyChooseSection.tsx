import { Heart, Sparkles, Calendar } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: Heart,
    title: 'Genuine Connections',
    description: 'Meet like-minded individuals in a warm, welcoming environment designed for authentic relationships.',
  },
  {
    icon: Sparkles,
    title: 'Curated Experiences',
    description: 'Every event is thoughtfully crafted to spark conversation and create lasting memories.',
  },
  {
    icon: Calendar,
    title: 'Regular Events',
    description: 'Weekly gatherings ensure you always have opportunities to expand your social circle.',
  },
];

export const WhyChooseSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`text-center mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Why Choose Our Community?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover what makes MakeFriends the premier destination for meaningful social connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-card rounded-2xl p-8 shadow-elegant border border-border/50 transition-all duration-500 card-animate scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
