import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useSiteStats } from '@/hooks/useSiteStats';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export const Hero = () => {
  const { data: stats } = useSiteStats();
  const { user } = useAuth();
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
    <section className="relative w-full min-h-[100dvh] bg-background overflow-hidden">
      {/* Background Image */}
      <img
        src="/images/gallery/event-1.jpg"
        alt="Elevated social experiences and curated connections at MakeFriends & Socialize"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Very dark gradient overlay for text readability against bright images */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 md:from-black/80 via-black/50 to-black/30" />
      {/* Additional bottom gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0b]/90 via-transparent to-transparent" />

      {/* Hero Content stacked over image */}
      <div className="relative z-10 flex flex-col justify-end min-h-[100dvh] w-full pt-28">
        <div className="px-6 md:px-12 lg:px-24 pb-20 md:pb-32 w-full max-w-[1600px] mx-auto">
          <div className="max-w-[800px]">
            {/* Headline - Soho Home style: very clean, large serif, slight tight kerning */}
            <h1 className="font-display leading-[1.0] tracking-tight mb-4 text-white font-normal">
              <span className="block text-[64px] sm:text-[80px] md:text-[96px] lg:text-[112px]">
                Elevated social
              </span>
              <span className="block text-[64px] sm:text-[80px] md:text-[96px] lg:text-[112px] mt-2">
                experiences
              </span>
            </h1>

            {/* Subheadline - crisp sans-serif or clean serif */}
            <p className="text-base sm:text-lg lg:text-xl font-medium text-white max-w-[600px] leading-[1.4] mb-8">
              Curated connections and exclusive events for exceptional individuals seeking a higher standard of community.
            </p>

            <div className="flex items-center gap-4 mb-10">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                    <img
                      src={`https://i.pravatar.cc/150?img=${i + 10}`}
                      alt={`Member ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">Join {stats?.memberCount || 250}+ members</span>
                <span className="text-white/70 text-xs">exclusive community</span>
              </div>
            </div>

            {/* Solid white pill button */}
            <Button
              asChild
              className="rounded-full px-8 h-12 text-sm tracking-wide bg-white text-black hover:bg-white/90 border-0 transition-colors duration-200 font-semibold"
            >
              <TransitionLink to="/membership">
                Apply for Membership
              </TransitionLink>
            </Button>
          </div>
        </div>

        {/* Partner Logos Band - Ultra Compact */}
        <div className="w-full bg-[#0d1911] py-4 md:py-6 border-t border-white/5 absolute bottom-0">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            <h4 className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-semibold whitespace-nowrap">Trusted By</h4>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-10 opacity-60 scale-75 md:scale-90 origin-right">
              {/* Using stylized text to simulate the partner logos since we don't have SVGs */}
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm md:text-base tracking-tighter leading-tight">Jack<br />Wolfskin</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-[8px] tracking-widest leading-none">THE</span>
                <span className="text-white font-bold text-sm md:text-base tracking-tighter leading-none mt-0.5">NORTH</span>
                <span className="text-white font-bold text-xs md:text-sm tracking-tighter leading-none">FACE</span>
              </div>
              <div className="flex items-center gap-1.5 border border-white p-0.5">
                <div className="bg-transparent border border-white w-3 h-4"></div>
                <div className="flex flex-col">
                  <span className="text-white text-[8px] font-bold tracking-widest leading-tight">NATIONAL</span>
                  <span className="text-white text-[8px] font-bold tracking-widest leading-tight">GEOGRAPHIC</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-white font-black text-sm md:text-base tracking-tighter italic leading-none">NEWIBER</span>
                <span className="text-white text-[8px] tracking-widest font-light leading-none">travel</span>
              </div>
              <div>
                <span className="text-white font-bold text-sm md:text-base tracking-tighter lowercase">sunrise</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};