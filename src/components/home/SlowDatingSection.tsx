import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Picture } from '@/components/ui/picture';
import slowDatingImage from '@/assets/slow-dating.jpg';
import slowDatingImageWebp from '@/assets/slow-dating.webp';

export const SlowDatingSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="w-full px-6 py-16 md:px-10 md:py-24 lg:px-16 xl:px-20 bg-secondary/5" id="dating">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className={`relative overflow-hidden rounded-2xl aspect-[4/3] lg:aspect-square scroll-animate ${isVisible ? 'visible' : ''}`}>
            <Picture
              src={slowDatingImage}
              webpSrc={slowDatingImageWebp}
              alt="Elegant couple enjoying a sophisticated moment"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full h-full"
              imgClassName="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 to-transparent pointer-events-none" />
          </div>

          {/* Content */}
          <div className={`flex flex-col justify-center scroll-animate scroll-animate-delay-2 ${isVisible ? 'visible' : ''}`}>
            <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-4">By Invitation Only</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight">
              Private <span className="text-gradient">Introductions</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
              For select members seeking meaningful connections beyond our social gatherings, 
              we offer a discreet introduction service. No algorithms, no profiles—just 
              thoughtful, human-facilitated introductions.
            </p>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
              This premium service is available exclusively to established members 
              and operates entirely through personal consultation with our team.
            </p>
            <div>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 min-h-[48px]">
                <Link to="/contact">Inquire Privately</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
