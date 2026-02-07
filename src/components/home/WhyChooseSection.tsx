import { Heart, Gem, Calendar, Briefcase } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: Heart,
    title: 'Vetted, Like-Minded Members',
    description: 'Every member is personally reviewed to ensure a community of ambitious, warm, and interesting people.',
  },
  {
    icon: Gem,
    title: 'Thoughtfully Designed Events',
    description: 'From intimate dinners to cultural outings—each gathering is crafted to spark genuine conversation.',
  },
  {
    icon: Calendar,
    title: 'Weekly Gatherings, Year-Round',
    description: 'Multiple events each week ensure you always have opportunities to meet new friends.',
  },
  {
    icon: Briefcase,
    title: 'Business Networking',
    description: 'Connect with founders, executives, and entrepreneurs at events designed to foster partnerships.',
  },
];

export const WhyChooseSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-muted/30" id="why">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`mb-12 md:mb-20 scroll-animate ${isVisible ? 'visible' : ''}`}>
          <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4 block">
            Our Ethos
          </span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 max-w-3xl">
            Cultivating <span className="italic text-primary">meaningful</span> connection in a digital world.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed font-light">
            We curate spaces where ambition meets distinct character, fostering a private community for professionals who value depth over volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group flex flex-col items-start p-6 rounded-2xl transition-all duration-500 hover:bg-background/50 border border-transparent hover:border-border/60 scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
