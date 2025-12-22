import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const EthosSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20" id="about">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className={`rounded-2xl bg-card px-8 py-16 md:px-16 md:py-20 border border-border scroll-animate ${isVisible ? 'visible' : ''}`}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-card-foreground md:text-4xl">
              The <span className="text-primary">Society's</span> Ethos
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
