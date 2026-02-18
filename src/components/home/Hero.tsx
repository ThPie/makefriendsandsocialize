import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowRight, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

const videoQualitySources = [
  { quality: 'low' as const, src: '/videos/hero-1.mp4', type: 'video/mp4' },
  { quality: 'high' as const, src: '/videos/hero-1.mp4', type: 'video/mp4' },
];

export const Hero = () => {
  const { data: stats } = useSiteStats();
  const [displayCount, setDisplayCount] = useState(0);

  // Animated counter for member count
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
    <section className="relative w-full min-h-screen min-h-[100dvh] overflow-hidden flex items-center justify-center">
      {/* FULL SCREEN VIDEO BACKGROUND */}
      <div className="absolute inset-0 -top-[env(safe-area-inset-top)] bg-black">
        <AdaptiveVideo
          qualitySources={videoQualitySources}
          loop={true}
          preloadStrategy="metadata"
          showPosterOnSlowConnection={false}
          className="h-full w-full object-cover scale-[1.02] opacity-60"
        />
      </div>

      {/* Dark Overlay for better text contrast */}
      <div className="absolute inset-0 bg-[#0a1f0f]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f0f] via-transparent to-black/30" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-12 max-w-4xl mx-auto pt-20">

        {/* MEMBERS ONLY PILL */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#0a1f0f]/80 backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
          <span className="text-[#d4af37] text-xs font-medium tracking-[0.2em] uppercase">
            Members Only
          </span>
        </div>

        {/* HEADING */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8 font-normal drop-shadow-lg">
          Experience <br />
          <span className="text-[#d4af37] italic">Meaningful</span> <br />
          Connection
        </h1>

        {/* SUBTITLE */}
        <p className="text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed font-light mb-10 drop-shadow-md">
          A private digital sanctuary for the discerning few. Connect, converse, and cultivate your circle.
        </p>

        {/* CTA BUTTON */}
        <Button
          size="lg"
          asChild
          className="rounded-full bg-[#d4af37] text-[#0a1f0f] hover:bg-[#b5952f] font-bold text-sm md:text-base px-10 h-14 tracking-wider uppercase mb-12 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105"
        >
          <Link to="/membership">
            Apply For Membership
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        {/* SOCIAL PROOF */}
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div className="flex -space-x-4">
            {avatars.length > 0 ? avatars.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-12 h-12 rounded-full border-2 border-[#0a1f0f] object-cover"
                loading="lazy"
              />
            )) : (
              // Fallback avatars if none loaded
              [1, 2, 3].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0a1f0f] bg-white/10 backdrop-blur-md" />
              ))
            )}
            <div className="w-12 h-12 rounded-full border-2 border-[#0a1f0f] bg-[#d4af37] flex items-center justify-center text-[#0a1f0f] font-bold text-xs z-10">
              {displayCount > 0 ? `${(displayCount / 1000).toFixed(1)}k+` : '150+'}
            </div>
          </div>
          <p className="text-white/60 text-xs tracking-widest uppercase font-medium">
            Join our curated community
          </p>
        </div>
      </div>
    </section>
  );
};
