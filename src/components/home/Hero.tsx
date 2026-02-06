import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Full-screen Hero with:
 * - Video background covering entire viewport (100dvh)
 * - Left-aligned modern layout
 * - Single Apply Now button in bottom card
 */

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
    <section className="relative w-full min-h-screen min-h-[100dvh] overflow-hidden">
      {/* FULL SCREEN VIDEO BACKGROUND */}
      <div className="absolute inset-0 -top-[env(safe-area-inset-top)] bg-black">
        <AdaptiveVideo
          qualitySources={videoQualitySources}
          loop={true}
          preloadStrategy="metadata"
          showPosterOnSlowConnection={false}
          className="h-full w-full object-cover scale-[1.02]"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col justify-end min-h-screen min-h-[100dvh] px-6 md:px-12 lg:px-20 pt-[env(safe-area-inset-top)] pb-12 md:pb-16 lg:pb-20">
        {/* HEADLINE SECTION */}
        <div className="max-w-4xl mb-8">
          {/* Tagline above title */}
          <p className="text-white/60 text-sm md:text-base font-medium mb-4 uppercase tracking-widest">
            Where Quality Meets Community
          </p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Curated Events,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              Meaningful Connections
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl leading-relaxed">
            A private social club for professionals seeking genuine friendships, intentional networking, and authentic dating experiences.
          </p>
        </div>

        {/* COMPACT CARD - Avatars + Join Text + Apply Button */}
        <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 w-fit">
          {/* Avatars */}
          <div className="flex -space-x-2 shrink-0">
            {avatars.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white/60 object-cover shadow-md"
                loading="lazy"
              />
            ))}
          </div>

          {/* Join Text */}
          <span className="text-white text-sm sm:text-base font-medium whitespace-nowrap">
            Join {displayCount > 0 ? displayCount.toLocaleString() : '—'}+ members
          </span>

          {/* Apply Button */}
          <Button
            size="sm"
            asChild
            className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-4 sm:px-5 shrink-0"
          >
            <Link to="/membership">
              Apply Now
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
