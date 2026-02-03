import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowRight, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Full-screen Hero with:
 * - Video background covering entire viewport (including mobile status bar area via safe-area-inset)
 * - Minimal, modern typography
 * - Integrated social proof (avatars + member count)
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
      {/* 
        FULL SCREEN VIDEO BACKGROUND 
        Uses 100dvh (dynamic viewport height) for true full-screen on mobile.
        Negative margin pulls into notch/status bar area on modern phones.
      */}
      <div className="absolute inset-0 -top-[env(safe-area-inset-top)] bg-black">
        <AdaptiveVideo
          qualitySources={videoQualitySources}
          loop={true}
          preloadStrategy="metadata"
          showPosterOnSlowConnection={false}
          className="h-full w-full object-cover scale-[1.02]"
        />
        {/* Gradient Overlay - subtle vignette style */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen min-h-[100dvh] px-6 md:px-12 lg:px-20 pt-[env(safe-area-inset-top)] pb-safe">
        {/* TOP SECTION - Tagline & CTA (Left aligned like reference) */}
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

        {/* BOTTOM SECTION - Headline + Social Proof */}
        <div className="pb-12 md:pb-16 lg:pb-20 max-w-4xl">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Curated Events,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              Meaningful Connections
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl leading-relaxed mb-8">
            A private social club for professionals seeking genuine friendships, intentional networking, and authentic dating experiences.
          </p>

          {/* SOCIAL PROOF CARD (Inspired by reference - "Refer a friends" style) */}
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3">
            <div>
              <p className="text-white font-semibold text-sm">Share with friends</p>
              <p className="text-white/60 text-xs">Get 10% off when they join</p>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 gap-2 rounded-full px-4">
              <Share2 className="h-4 w-4" />
              Share Link
            </Button>
            <div className="flex -space-x-2 ml-2">
              {avatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-white/30 object-cover"
                  loading="lazy"
                />
              ))}
              {displayCount > 4 && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold border-2 border-white/30">
                  +{(displayCount - 4).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
