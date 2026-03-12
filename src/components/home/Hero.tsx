import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useSiteStats } from '@/hooks/useSiteStats';
import { MemberAvatars } from '@/components/home/MemberAvatars';
import { useConnectionQuality } from '@/hooks/useConnectionQuality';

export const Hero = () => {
  const { data: stats, isLoading } = useSiteStats();
  const videoRef = useRef<HTMLVideoElement>(null);
  const connectionQuality = useConnectionQuality();

  // Only attempt video on high-quality connections
  const shouldLoadVideo = connectionQuality === 'high';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) return;

    const showVideo = () => {
      video.style.opacity = '1';
    };

    video.addEventListener('canplay', showVideo);
    video.addEventListener('loadeddata', showVideo);

    // Fallback: show video after 5s even if events don't fire
    const timer = setTimeout(showVideo, 5000);

    return () => {
      video.removeEventListener('canplay', showVideo);
      video.removeEventListener('loadeddata', showVideo);
      clearTimeout(timer);
    };
  }, [shouldLoadVideo]);

  return (
    <section className="relative w-full h-[100dvh] bg-[#050505] overflow-hidden">
      {/* Poster image — always visible immediately */}
      <img
        src={`${import.meta.env.BASE_URL}videos/hero-poster.jpg`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
      />

      {/* Video — only loaded on fast connections, fades in over poster */}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          onError={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          style={{ opacity: 0 }}
        >
          <source src={`${import.meta.env.BASE_URL}videos/hero-background.mp4`} type="video/mp4" />
        </video>
      )}

      {/* Luxury dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Subtle gradient overlay — bottom-left bias for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content — anchored bottom-left, minimal */}
      <div className="relative z-10 flex flex-col justify-end h-full w-full">
        <div className="content-container pb-16 md:pb-24">
          <div className="max-w-[520px]">
            {/* Small eyebrow */}
            <span className="eyebrow block mb-4 text-white/60">Private Membership</span>

            {/* Clean headline — Soho House scale */}
            <h1 className="font-display italic text-[36px] md:text-[48px] leading-[1.15] tracking-tight text-white mb-4">
              Where exceptional people find their circle.
            </h1>

            {/* Subheadline */}
            <p className="text-[15px] font-light text-white/70 leading-[1.6] mb-8 max-w-[380px]">
              Curated connections and exclusive gatherings for individuals seeking a higher standard of community.
            </p>

            {/* Two CTA buttons */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                asChild
                className="rounded-full px-6 h-10 text-xs tracking-widest uppercase font-medium bg-[hsl(var(--accent-gold))] text-white hover:bg-[hsl(var(--accent-gold))]/90 border-0 transition-colors duration-200"
              >
                <TransitionLink to="/membership">
                  Apply for Membership
                </TransitionLink>
              </Button>
              <TransitionLink
                to="/auth"
                className="text-xs tracking-widest uppercase font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                Sign In
              </TransitionLink>
            </div>

            {/* Member avatars + count */}
            <MemberAvatars
              avatarUrls={stats?.avatarUrls || []}
              memberCount={stats?.memberCount || 0}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
