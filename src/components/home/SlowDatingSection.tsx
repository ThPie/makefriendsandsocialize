import { TransitionLink } from '@/components/ui/TransitionLink';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ArrowRight } from 'lucide-react';

const steps = [
  { num: '01', title: 'Join the Waitlist', description: 'Create your profile and join a community of like-minded individuals looking for meaningful connections.' },
  { num: '02', title: 'Screening Process', description: 'Our team verifies every member to ensure safety, authenticity, and high-quality matches for everyone.' },
  { num: '03', title: 'Get Matched', description: 'Receive curated matches hand-picked by our matchmakers, not algorithms, based on deep compatibility.' },
];

export const SlowDatingSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-spacing bg-background" id="dating">
      <div ref={ref} className={`content-container transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        <div className="section-header">
          <span className="section-label mb-3 block">How It Works</span>
          <h2 className="font-display text-4xl md:text-5xl font-normal text-foreground mb-4">
            Our Simple <span className="italic text-[hsl(var(--accent-gold))]">Process</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            No swiping, just genuine introductions through a human-centric approach.
          </p>
        </div>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:grid grid-cols-3 gap-8 relative">
          {/* Connecting dashed line */}
          <div className="absolute top-12 left-[16%] right-[16%] h-px border-t border-dashed border-[hsl(var(--accent-gold))]/30" />

          {steps.map((step) => (
            <div key={step.num} className="relative text-center px-4">
              {/* Large background number */}
              <div className="font-display text-[96px] leading-none text-[hsl(var(--accent-gold))]/[0.08] select-none mb-[-40px]">
                {step.num}
              </div>
              <h3 className="text-xl font-light text-foreground mb-3 relative z-10">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden relative pl-8">
          {/* Vertical gold line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-[hsl(var(--accent-gold))]/20" />

          <div className="space-y-10">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                {/* Dot */}
                <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-[hsl(var(--accent-gold))] border-2 border-background" />
                <span className="mono-accent text-[hsl(var(--accent-gold))] mb-2 block">{step.num}</span>
                <h3 className="text-lg font-light text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <TransitionLink
            to="/dating/apply"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[10px] text-sm font-medium tracking-wider uppercase bg-[hsl(var(--accent-gold))] text-background transition-colors duration-200 hover:bg-[hsl(var(--accent-gold-light))]"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </TransitionLink>
        </div>
      </div>
    </section>
  );
};
