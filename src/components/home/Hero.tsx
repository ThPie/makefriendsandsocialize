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

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
            Curated Events,<br />
            <span className="text-white">
              Meaningful Connections
            </span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl leading-relaxed font-light">
            A private social club for professionals seeking genuine friendships, intentional networking, and authentic dating experiences.
          </p>
        </div>

        {/* COMPACT CARD - Avatars + Join Text + Apply Button */}
        <div className="inline-flex flex-wrap items-center gap-4 bg-black/60 border border-white/10 rounded-full pl-2 pr-2 py-2 w-fit backdrop-blur-sm">
          {/* Avatars */}
          <div className="flex -space-x-3 shrink-0 pl-2">
            {avatars.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-10 h-10 rounded-full border border-white/20 object-cover"
                loading="lazy"
              />
            ))}
          </div>

          {/* Join Text */}
          <span className="text-white text-sm sm:text-base font-medium whitespace-nowrap px-2">
            Join {displayCount > 0 ? displayCount.toLocaleString() : '—'}+ members
          </span>

          {/* Apply Button */}
          <Button
            size="sm"
            asChild
            className="rounded-full bg-white text-black hover:bg-white/90 font-medium px-6 h-10 shrink-0"
          >
            <Link to="/membership">
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
