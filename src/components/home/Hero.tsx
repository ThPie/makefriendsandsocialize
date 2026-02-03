import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowRight, Users, TrendingUp, Calendar, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Full-screen Hero with:
 * - Video background covering entire viewport (including mobile status bar area via safe-area-inset)
 * - Minimal, modern typography
 * - Integrated stats grid (Members, Joined, Events, Rating)
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

  const statsGrid = [
    { icon: Users, value: displayCount > 0 ? `${displayCount}+` : '—', label: 'Active Members', color: 'text-primary' },
    { icon: TrendingUp, value: stats?.joinedThisWeek?.toString() || '—', label: 'Joined This Week', color: 'text-emerald-400' },
    { icon: Calendar, value: stats?.upcomingEventsCount?.toString() || '—', label: 'Upcoming Events', color: 'text-amber-400' },
    { icon: Star, value: stats?.rating?.toFixed(1) || '4.9', label: 'Member Rating', color: 'text-yellow-400' },
  ];

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

        {/* BOTTOM SECTION - Headline + Stats */}
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

          {/* STATS GRID - Dark Green Card like reference */}
          <div className="bg-[#0a1f1a]/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 max-w-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {statsGrid.map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
                  <span className="text-2xl md:text-3xl font-bold text-white font-display">
                    {stat.value}
                  </span>
                  <span className="text-xs md:text-sm text-white/60 mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
