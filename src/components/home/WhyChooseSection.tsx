import { ShieldCheck, Star, CalendarClock, Handshake } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: ShieldCheck,
    title: 'Vetted, Like-Minded Members',
    description: 'Every member is personally reviewed to ensure a community of ambitious, warm, and interesting people.',
  },
  {
    icon: Star,
    title: 'Thoughtfully Designed Events',
    description: 'From intimate dinners to cultural outings—each gathering is crafted to spark genuine conversation.',
  },
  {
    icon: CalendarClock,
    title: 'Weekly Gatherings, Year-Round',
    description: 'Multiple events each week ensure you always have opportunities to meet new friends.',
  },
  {
    icon: Handshake,
    title: 'Business Networking',
    description: 'Connect with founders, executives, and entrepreneurs at events designed to foster partnerships.',
  },
];

export const WhyChooseSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-muted/30" id="why">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Column: Text Content */}
          <div className={`flex flex-col items-start scroll-animate ${isVisible ? 'visible' : ''}`}>
            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4 block">
              Our Ethos
            </span>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight">
              Cultivating <span className="italic text-primary">meaningful</span> connection in a digital world.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-light max-w-xl">
              We curate spaces where ambition meets distinct character, fostering a private community for professionals who value depth over volume.
            </p>

            <div className="mt-8 h-px w-24 bg-primary/30"></div>
          </div>

          {/* Right Column: 2x2 Grid of Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl transition-all duration-500 hover:bg-background/50 border border-transparent hover:border-border/60 hover:shadow-sm scroll-animate scroll-animate-delay-${index + 1} ${isVisible ? 'visible' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4 sm:mb-5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
