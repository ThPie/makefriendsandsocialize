import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const steps = [
  {
    number: '01',
    title: 'Apply',
    description: 'Submit your membership application. Every applicant is personally reviewed to ensure alignment with our community values.',
  },
  {
    number: '02',
    title: 'Connect',
    description: 'Once approved, explore curated events, join circles, and begin meeting members who share your interests and ambitions.',
  },
  {
    number: '03',
    title: 'Belong',
    description: 'Experience the full spectrum of membership — from intimate dinners and group outings to intentional dating and business networking.',
  },
];

export const WhyChooseSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-spacing bg-background" id="how-it-works">
      <div ref={ref} className="content-container">
        {/* Header */}
        <div className="section-header">
          <span className="eyebrow block mb-3 text-[hsl(var(--accent-gold))]">How It Works</span>
          <h2 className="font-display text-3xl md:text-[44px] text-foreground leading-[1.1]">
            Three Simple <span className="italic text-[hsl(var(--accent-gold))]">Steps</span>
          </h2>
        </div>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:grid grid-cols-3 gap-12 relative">
          {/* Gold dashed connecting line */}
          <div className="absolute top-12 left-[16%] right-[16%] h-px border-t border-dashed border-[hsl(var(--accent-gold))]/40" />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              {/* Large background number */}
              <div className="font-display text-[96px] leading-none text-[hsl(var(--accent-gold))]/10 select-none mb-[-40px] relative z-0">
                {step.number}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-light text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-[280px] mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden flex flex-col relative pl-10">
          {/* Gold vertical bar */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-[hsl(var(--accent-gold))]/30" />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative pb-10 last:pb-0 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Step dot */}
              <div className="absolute left-[-28px] top-1 w-6 h-6 rounded-full border-2 border-[hsl(var(--accent-gold))] bg-background flex items-center justify-center">
                <span className="font-mono-accent text-[9px] text-[hsl(var(--accent-gold))]">{step.number}</span>
              </div>

              <h3 className="text-lg font-light text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
