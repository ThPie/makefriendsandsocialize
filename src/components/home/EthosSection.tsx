import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useParallax } from '@/hooks/useParallax';

export const EthosSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const decorOffset = useParallax({ speed: 0.08, direction: 'up' });

  return (
    <section className="relative w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 overflow-hidden" id="about">
      {/* Parallax Decorative Background */}
      <div 
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl will-change-transform"
        style={{ transform: `translateY(${decorOffset}px)` }}
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-secondary/5 blur-3xl will-change-transform"
        style={{ transform: `translateY(${decorOffset * -0.7}px)` }}
        aria-hidden="true"
      />

      <div ref={ref} className="relative mx-auto max-w-7xl">
        <div className={`rounded-2xl bg-card px-8 py-16 md:px-16 md:py-20 border border-border scroll-animate ${isVisible ? 'visible' : ''}`}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-card-foreground md:text-4xl">
              The Society's Ethos
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Our purpose is to bring together discerning individuals in settings that
              inspire, fostering meaningful connections and creating unforgettable
              moments. We are dedicated to the art of gathering, where every detail
              is curated to celebrate exclusivity and community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
