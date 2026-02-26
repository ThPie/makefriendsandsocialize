import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const pillars = [
  {
    title: 'Authentic Connection',
    description: 'We foster genuine relationships through thoughtfully curated experiences that bring together like-minded individuals.'
  },
  {
    title: 'Curated Excellence',
    description: 'Every event, every gathering, every moment is designed with intention — because quality matters more than quantity.'
  },
  {
    title: 'Privacy & Trust',
    description: 'A vetted community built on mutual respect, discretion, and shared values. Your space, your pace.'
  },
  {
    title: 'Meaningful Growth',
    description: 'Beyond networking — we create environments where personal and professional growth happen naturally.'
  }
];

export const EthosSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-0 bg-background relative z-10 w-full border-t border-border">
      {/* Desktop: inline 4-col row */}
      <div className="hidden md:grid grid-cols-4 content-container">
        {pillars.map((pillar, i) => (
          <div
            key={pillar.title}
            className={`py-8 px-6 lg:px-8 flex flex-col gap-2 ${i < pillars.length - 1 ? 'border-r border-border' : ''} transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <h3 className="font-display text-lg text-foreground leading-tight">{pillar.title}</h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">{pillar.description}</p>
          </div>
        ))}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <div className="flex">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className={`min-w-[75vw] snap-center py-6 px-6 flex flex-col gap-2 ${i < pillars.length - 1 ? 'border-r border-border' : ''}`}
            >
              <h3 className="font-display text-lg text-foreground leading-tight">{pillar.title}</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
