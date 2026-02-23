import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const ethosItems = [
  { num: '01', title: 'Privacy First', description: 'Discretion is our currency. Your data is sovereign.' },
  { num: '02', title: 'Curated Events', description: 'Access to exclusive gatherings worldwide.' },
  { num: '03', title: 'Trusted Community', description: 'A vetted network of like-minded individuals.' },
  { num: '04', title: 'True Discourse', description: 'Meaningful conversations with peers.' },
];

export const EthosSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-background" id="ethos">
      <div ref={ref} className={`mx-auto max-w-[1200px] transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Section eyebrow + headline */}
        <div className="mb-16">
          <span className="section-label mb-3 block">Our Ethos</span>
          <h2 className="font-display text-4xl md:text-5xl font-normal text-foreground">
            What We <span className="italic text-[hsl(var(--gold))]">Stand For</span>
          </h2>
        </div>

        {/* Numbered rows */}
        <div className="divide-y divide-border">
          {ethosItems.map((item) => (
            <div
              key={item.num}
              className="flex items-start gap-6 md:gap-12 py-8 md:py-10 group"
            >
              {/* Number */}
              <span className="mono-accent text-[hsl(var(--gold))] shrink-0 mt-1">
                {item.num}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl md:text-2xl text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  {item.description}
                </p>
              </div>

              {/* Gold line accent */}
              <div className="hidden md:flex items-center self-center">
                <div className="w-10 h-px bg-[hsl(var(--gold))] opacity-30 group-hover:opacity-100 group-hover:w-16 transition-all duration-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
