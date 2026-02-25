import { useEffect, useState } from 'react';

const pillars = [
  {
    number: '01',
    title: 'Authentic Connection',
    description: 'We foster genuine relationships through thoughtfully curated experiences that bring together like-minded individuals.',
  },
  {
    number: '02',
    title: 'Curated Excellence',
    description: 'Every event, every gathering, every moment is designed with intention — because quality matters more than quantity.',
  },
  {
    number: '03',
    title: 'Privacy & Trust',
    description: 'A vetted community built on mutual respect, discretion, and shared values. Your space, your pace.',
  },
  {
    number: '04',
    title: 'Meaningful Growth',
    description: 'Beyond networking — we create environments where personal and professional growth happen naturally.',
  },
];

export const EthosSection = () => {
  const [visibleItems, setVisibleItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleItems((prev) => ({ ...prev, [index]: true }));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const elements = document.querySelectorAll('.ethos-pillar');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 md:py-32 bg-background relative z-10 w-full flex flex-col items-center">
      <div className="content-container w-full">

        {/* Centralized section header */}
        <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto flex flex-col items-center">
          <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))]">Our Ethos</span>
          <h2 className="font-display text-4xl md:text-[56px] text-foreground leading-[1.1]">
            What We Stand For
          </h2>
        </div>

        {/* 4-column grid layout as originally requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 w-full">
          {pillars.map((pillar, i) => {
            const isVisible = visibleItems[i];

            return (
              <div
                key={pillar.number}
                className="ethos-pillar flex flex-col"
                data-index={i}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono text-[hsl(var(--accent-gold))] font-mono-accent text-lg">
                    {pillar.number}
                  </span>
                  {/* The animated gold line */}
                  <div className="flex-grow h-px bg-[hsl(var(--accent-gold))] opacity-40 overflow-hidden relative">
                    <div
                      className="absolute inset-0 bg-[hsl(var(--accent-gold))] origin-left"
                      style={{
                        transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                        // Stagger the animation so they appear one by one
                        transitionDelay: `${i * 200}ms`
                      }}
                    />
                  </div>
                </div>

                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground font-light leading-[1.7]">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
