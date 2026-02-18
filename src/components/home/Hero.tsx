import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowRight, Menu } from 'lucide-react';
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
      {/* Navigation Overlay (Mobile/Desktop) */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          {/* Logo Mark */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[#d4af37]/40 bg-[#0a0f0a]/50 backdrop-blur-md">
            <span className="text-[#d4af37] font-bold text-lg italic font-display">S</span>
          </div>
          <span className="text-white text-xl font-bold tracking-tight italic font-display">Society</span>
        </div>
        <button className="text-white hover:text-[#d4af37] transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10">
          <Menu className="w-7 h-7" />
        </button>
      </nav>

      {/* Hero Header Container - Rounded Bottom */}
      <header className="relative h-[85vh] min-h-[600px] w-full flex flex-col justify-end pb-12 px-6 overflow-hidden rounded-b-[2.5rem] shadow-2xl">

        {/* Background Video (Replacing Image for dynamic feel, but keeping style) */}
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
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0f0a] via-[#0a0f0a]/60 to-[#0a0f0a]/30" />

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight text-[#f0f2f0] drop-shadow-sm font-display">
              Experience <span className="italic text-[#d4af37]">Meaningful</span> Connection
            </h1>
            <p className="text-gray-300/90 text-lg md:text-xl font-light max-w-lg mx-auto leading-relaxed">
              A private digital sanctuary for the modern elite.
            </p>
          </div>

          <div className="w-full flex flex-col items-center gap-6 mt-4">
            <Button
              asChild
              className="group relative w-full max-w-xs overflow-hidden rounded-lg bg-[#d4af37] hover:bg-[#e5c558] transition-all duration-300 py-6 px-8 shadow-[0_0_20px_rgba(212,175,55,0.3)] border-none"
            >
              <Link to="/membership" className="flex items-center justify-center">
                <span className="relative z-10 text-[#0a0f0a] text-lg font-bold tracking-wide uppercase">Apply for Membership</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </Link>
            </Button>

            <Link to="/login" className="flex items-center gap-1 text-[#d4af37] text-sm font-medium cursor-pointer hover:underline underline-offset-4">
              <span>Already a member?</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Social Proof Section (Floating below header, overlapping content) */}
      <div className="relative z-30 -mt-8 flex flex-col items-center gap-3 backdrop-blur-xl bg-[#141f17]/40 border border-white/5 p-4 rounded-2xl mx-auto max-w-md shadow-lg mb-12">
        <div className="flex -space-x-4 rtl:space-x-reverse">
          {avatars.length > 0 ? avatars.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-12 h-12 border-2 border-[#141f17] rounded-full object-cover"
            />
          )) : (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="w-12 h-12 border-2 border-[#141f17] rounded-full bg-white/10" />
            ))
          )}
          <div className="flex items-center justify-center w-12 h-12 text-xs font-medium text-white bg-[#1a5b2a] border-2 border-[#141f17] rounded-full">
            {displayCount > 0 ? `+${(displayCount / 1000).toFixed(0)}k` : '+150'}
          </div>
        </div>
        <p className="text-[#d4af37]/80 text-sm font-medium tracking-wide uppercase">Join founding members</p>
      </div>

    </div>
  );
};
