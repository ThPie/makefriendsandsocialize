import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Clock, Shield, Sparkles, ArrowRight } from 'lucide-react';
import slowDatingImage from '@/assets/slow-dating-new.jpg';

export const SlowDatingSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    {
      id: '01',
      title: 'Join the Waitlist',
      description: 'Create your profile and join a community of like-minded individuals looking for meaningful connections.',
      icon: Clock,
    },
    {
      id: '02',
      title: 'Screening Process',
      description: 'Our team verifies every member to ensure safety, authenticity, and high-quality matches for everyone.',
      icon: Shield,
    },
    {
      id: '03',
      title: 'Get Matched',
      description: 'Receive curated matches hand-picked by our matchmakers, not algorithms, based on deep compatibility.',
      icon: Sparkles,
    },
  ];

  return (
    <section className="w-full bg-background py-20 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden" id="dating">
      <div ref={ref} className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left Column: Header & Intro */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 w-fit mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium text-primary tracking-wider uppercase">How It Works</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
              Our Simple <br /> <span className="text-primary">Process</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-md">
              Our mission is to facilitate meaningful connections through a human-centric approach. No swiping, just genuine introductions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="rounded-full text-base px-8 h-14">
                <TransitionLink to="/dating/apply">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </TransitionLink>
              </Button>
            </div>

            {/* Image Card */}
            <div className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-lg shadow-2xl border border-white/10 group">
              <img
                src={slowDatingImage}
                alt="Slow Dating Process"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 text-white p-4">
                <p className="font-medium text-lg">The Experience</p>
                <p className="text-sm text-white/80">Hand-selected just for you</p>
              </div>
            </div>
          </div>

          {/* Right Column: Steps Timeline */}
          <div className="relative flex flex-col justify-center">
            {/* Vertical Dashed Line */}
            <div className="absolute left-8 lg:left-8 top-12 bottom-12 w-px border-l-2 border-dashed border-primary/20 hidden md:block"></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex gap-8 group">

                  {/* Icon Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary transition-colors duration-300 shadow-sm">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 pt-2">
                    <div className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-8 hover:bg-card hover:border-primary/20 transition-all duration-300">
                      <span className="text-primary text-xs font-bold tracking-widest uppercase mb-2 block">
                        Step — {step.id}
                      </span>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
