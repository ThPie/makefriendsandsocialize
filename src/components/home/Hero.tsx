import { TransitionLink } from '@/components/ui/TransitionLink';
import { useSiteStats } from '@/hooks/useSiteStats';
import { useEffect, useState } from 'react';
import heroImage from '@/assets/founders-hero-new.jpg';

export const Hero = () => {
  const { data: stats } = useSiteStats();
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const target = stats?.memberCount || 0;
    if (target === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayCount(target);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [stats?.memberCount]);

  const avatars = stats?.avatarUrls?.slice(0, 4) || [];

  return (
    <div className="relative w-full min-h-screen bg-background">
      {/* Desktop: Split layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left 55% — Content */}
        <div className="w-[55%] flex flex-col justify-center px-12 lg:px-24 py-24">
          <div className="max-w-[480px]">
            <span className="section-label mb-4 block">Private Membership</span>

            <h1 className="font-display text-[72px] lg:text-[80px] leading-[0.95] font-normal text-foreground">
              Meaningful
            </h1>
            <h1 className="font-display text-[72px] lg:text-[80px] leading-[0.95] italic text-[hsl(var(--gold))]">
              Connection.
            </h1>

            <p className="text-lg font-light text-muted-foreground mt-6 max-w-[380px] leading-relaxed">
              A private digital sanctuary for the modern elite.
            </p>

            <div className="flex items-center gap-6 mt-10">
              <TransitionLink
                to="/membership"
                className="inline-flex items-center px-8 py-3.5 rounded-[10px] text-sm font-medium tracking-wider uppercase bg-[hsl(var(--gold))] text-background transition-colors duration-200 hover:bg-[hsl(var(--gold-light))]"
              >
                Apply for Membership
              </TransitionLink>
              <TransitionLink
                to="/auth"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Sign In
              </TransitionLink>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-12">
              <div className="flex -space-x-2.5">
                {avatars.length > 0 ? avatars.slice(0, 4).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border-2 border-background"
                  />
                )) : (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-surface border-2 border-background" />
                  ))
                )}
              </div>
              <span className="text-[13px] text-muted-foreground">
                {displayCount > 0 ? `${displayCount.toLocaleString()}+ members` : '1,000+ members'}
              </span>
            </div>
          </div>
        </div>

        {/* Right 45% — Photo */}
        <div className="w-[45%] relative">
          <img
            src={heroImage}
            alt="Members at an exclusive gathering"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Mobile: Full-bleed photo with overlay */}
      <div className="md:hidden relative min-h-screen flex flex-col justify-end pb-12 px-6">
        <img
          src={heroImage}
          alt="Members at an exclusive gathering"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A0F] via-[#071A0F]/50 to-transparent" />

        <div className="relative z-10">
          <span className="section-label mb-4 block text-white/50">Private Membership</span>

          <h1 className="font-display text-5xl leading-[0.95] font-normal text-white">
            Meaningful
          </h1>
          <h1 className="font-display text-5xl leading-[0.95] italic text-[hsl(var(--gold))]">
            Connection.
          </h1>

          <p className="text-base font-light text-white/60 mt-4 max-w-[320px]">
            A private digital sanctuary for the modern elite.
          </p>

          <div className="flex flex-col gap-3 mt-8">
            <TransitionLink
              to="/membership"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-[10px] text-sm font-medium tracking-wider uppercase bg-[hsl(var(--gold))] text-background"
            >
              Apply for Membership
            </TransitionLink>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2.5">
              {avatars.length > 0 ? avatars.slice(0, 3).map((url, i) => (
                <img key={i} src={url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-[#071A0F]" />
              )) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#071A0F]" />
                ))
              )}
            </div>
            <span className="text-[13px] text-white/50">
              {displayCount > 0 ? `${displayCount.toLocaleString()}+ members` : '1,000+ members'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
