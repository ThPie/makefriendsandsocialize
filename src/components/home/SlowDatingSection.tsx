import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Picture } from '@/components/ui/picture';
import slowDatingImage from '@/assets/slow-dating.webp';

export const SlowDatingSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-secondary/5" id="dating">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className={`relative overflow-hidden rounded-2xl aspect-[4/3] lg:aspect-square scroll-animate ${isVisible ? 'visible' : ''}`}>
            <img
              src={slowDatingImage}
              alt="Elegant couple enjoying a sophisticated moment"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 to-transparent pointer-events-none" />
          </div>

          {/* Content */}
          <div className={`flex flex-col justify-center scroll-animate scroll-animate-delay-2 ${isVisible ? 'visible' : ''}`}>
            <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-4">A Member Privilege</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight">
              Slow <span className="text-gradient">Dating</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
              The Club facilitates meaningful connections between members who share values and interests. 
              Our team provides thoughtful, human-facilitated introductions—no algorithms, no profiles.
            </p>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
              This exclusive service is a benefit of your membership, 
              available through personal consultation with our concierge team.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 min-h-[48px] bg-dating-terracotta hover:bg-dating-terracotta/90 text-white">
                <Link to="/slow-dating">Discover Connections</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 min-h-[48px]">
                <Link to="/dating/apply">Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
