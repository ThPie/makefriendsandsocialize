import { Heart, Sparkles, Calendar } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: Heart,
    title: 'Vetted, Like-Minded Members',
    description: 'Every member is personally reviewed to ensure a community of ambitious, warm, and interesting people.',
  },
  {
    icon: Sparkles,
    title: 'Thoughtfully Designed Events',
    description: 'From intimate dinners to cultural outings—each gathering is crafted to spark genuine conversation.',
  },
  {
    icon: Calendar,
    title: 'Weekly Gatherings, Year-Round',
    description: 'Multiple events each week ensure you always have opportunities to meet new friends.',
  },
];

export const WhyChooseSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="why">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`text-center mb-12 md:mb-16 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Why Members <span className="text-primary">Choose Us</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A private community for professionals who value depth over volume.
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
