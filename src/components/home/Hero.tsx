import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { EventCountdown } from './EventCountdown';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Full-screen Hero with:
 * - Video background covering entire viewport (100dvh)
 * - Left-aligned modern layout
 * - Larger member avatars + EventCountdown in bottom card
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

  const avatars = stats?.avatarUrls?.slice(0, 5) || [];

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
      <div className="relative z-10 flex flex-col justify-between min-h-screen min-h-[100dvh] px-6 md:px-12 lg:px-20 pt-[env(safe-area-inset-top)] pb-safe">
        {/* TOP SECTION - Tagline & CTA (Left aligned) */}
        <div className="flex flex-col justify-center flex-1 max-w-3xl pt-16 md:pt-20">
          <p className="text-white/60 text-sm md:text-base font-medium mb-3 uppercase tracking-widest">
            Join Make Friends & Socialize — Where Quality Meets Community
          </p>

          <div className="mb-8">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-6 text-base shadow-lg group"
            >
              <Link to="/membership">
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* BOTTOM SECTION - Headline + Countdown Card */}
        <div className="pb-12 md:pb-16 lg:pb-20">
          <div className="max-w-4xl mb-10">
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

          {/* COUNTDOWN CARD with Avatars */}
          <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
            {/* Event Countdown */}
            <EventCountdown />

            {/* Avatars - Larger Size */}
            {avatars.length > 0 && (
              <div className="flex -space-x-3 ml-0 sm:ml-4 border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-6">
                {avatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Member ${i + 1}`}
                    className="w-12 h-12 rounded-full border-2 border-white/50 object-cover shadow-lg transition-transform hover:scale-110 hover:z-10"
                    loading="lazy"
                  />
                ))}
                {displayCount > 5 && (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold border-2 border-white/50 shadow-lg">
                    +{(displayCount - 5).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
