import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const videoQualitySources = [
  { quality: 'low' as const, src: '/videos/hero-1.mp4', type: 'video/mp4' },
  { quality: 'high' as const, src: '/videos/hero-1.mp4', type: 'video/mp4' },
];

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
    <div className="relative w-full bg-[#0a0f0a]">
      {/* Hero Header Container - Rounded Bottom */}
      <header className="relative h-[85vh] min-h-[600px] w-full flex flex-col justify-end pb-12 px-8 overflow-hidden rounded-b-[2.5rem] shadow-2xl">

        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <AdaptiveVideo
            qualitySources={videoQualitySources}
            loop={true}
            preloadStrategy="metadata"
            showPosterOnSlowConnection={false}
            className="h-full w-full object-cover scale-[1.02]"
          />
        </div>

        {/* Heavy Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0f0a] via-[#0a0f0a]/40 to-black/20" />

        {/* Hero Content - Bottom Left aligned */}
        <div className="relative z-20 flex flex-col items-start text-left gap-6 max-w-lg mr-auto">

          {/* Private Members Pill */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1a5b2a]/90 backdrop-blur-md border border-[#d4af37]/20">
            <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.2em] uppercase">Private Members Only</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-medium leading-[1] text-[#f0f2f0] drop-shadow-lg">
              Meaningful<br />
              <span className="italic text-[#d4af37]">Connection.</span>
            </h1>
            <p className="text-gray-300/80 text-sm md:text-base font-light max-w-xs leading-relaxed pl-1">
              A private digital sanctuary for the modern elite.
            </p>
          </div>

          <div className="w-full flex flex-col items-start gap-4 mt-2">
            <Button
              asChild
              className="w-full sm:w-auto rounded-full bg-[#d4af37] hover:bg-[#c5a030] text-[#0a0f0a] font-bold text-sm tracking-widest uppercase py-6 px-10 shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform active:scale-95"
            >
              <Link to="/membership">
                Apply for Membership
              </Link>
            </Button>

            {/* Social Proof - Bottom Left */}
            <div className="flex items-center gap-3 mt-4 pl-1">
              <div className="flex -space-x-3">
                {avatars.length > 0 ? avatars.slice(0, 3).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-10 h-10 border-2 border-[#d4af37] rounded-full object-cover"
                  />
                )) : (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 border-2 border-[#d4af37] rounded-full bg-white/10" />
                  ))
                )}
                <div className="flex items-center justify-center w-10 h-10 text-[10px] font-bold text-[#0a0f0a] bg-white border-2 border-[#d4af37] rounded-full">
                  {displayCount > 0 ? `+${(displayCount / 1000).toFixed(0)}k` : '+150'}
                </div>
              </div>
              <span className="text-white/60 text-xs font-medium">Joined recently</span>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
