import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { EventCountdown } from './EventCountdown';
import { useSiteStats } from '@/hooks/useSiteStats';
import { useEffect, useState } from 'react';

/**
 * Full-screen Hero with:
 * - Video background covering entire viewport (100dvh)
 * - Minimal, modern typography
 * - Larger member avatars + EventCountdown
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      </div>

      {/* CONTENT */}
      <div
        className="relative flex min-h-[calc(100vh-81px)] w-full flex-col items-center justify-center px-6 py-20 text-center md:px-10"
        role="img"
        aria-label="An elegant evening social gathering with people mingling in a softly lit, luxurious room."
      >
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-8 animate-fade-in">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
            A Private Social Club for <span className="text-gradient font-display italic">Authentic Connections</span>
          </h1>
          <p className="max-w-2xl text-lg font-normal leading-relaxed text-white/90 md:text-xl drop-shadow-md">
            Weekly curated events. Vetted members. Genuine friendships.
          </p>

          <Button size="lg" asChild className="animate-fade-in mt-2" style={{ animationDelay: '0.15s' }}>
            <Link to="/membership">Start Your Application</Link>
          </Button>

          {/* Member Avatars - Larger Size */}
          {avatars.length > 0 && (
            <div className="flex items-center gap-4 mt-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <div className="flex -space-x-4">
                {avatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Member ${i + 1}`}
                    className="w-14 h-14 rounded-full border-3 border-white/80 shadow-lg ring-2 ring-black/10 object-cover transition-transform hover:scale-110 hover:z-10"
                    loading="lazy"
                  />
                ))}
                {displayCount > 5 && (
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold border-3 border-white/80 shadow-lg">
                    +{(displayCount - 5).toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-bold text-white drop-shadow-md">
                  {displayCount.toLocaleString()}+ Members
                </span>
                <span className="text-sm text-white/80 drop-shadow-sm">Join our community</span>
              </div>
            </div>
          )}

          {/* Event Countdown */}
          <div className="mt-8">
            <EventCountdown />
          </div>
        </div>
      </div>
    </section>
  );
};
