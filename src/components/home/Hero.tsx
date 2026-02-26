import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useSiteStats } from '@/hooks/useSiteStats';
import { MemberAvatars } from '@/components/home/MemberAvatars';

export const Hero = () => {
  const { data: stats, isLoading } = useSiteStats();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.8;
    }
  }, []);

  return (
    <section className="relative w-full h-[100dvh] bg-background overflow-hidden">
      {/* Full-bleed background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Luxury dark overlay */}
      <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />

      {/* Subtle gradient overlay — bottom-left bias for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

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
