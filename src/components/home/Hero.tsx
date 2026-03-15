import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/ui/TransitionLink';

// Lazy-load the member avatars — they require a Supabase fetch and are below the fold visually
const MemberAvatarsLazy = lazy(() =>
  import('@/components/home/MemberAvatars').then((m) => ({ default: m.MemberAvatars }))
);
// Lazy-load the stats hook wrapper so the Supabase query doesn't block initial render
const MemberAvatarsWithStats = lazy(() =>
  import('@/components/home/MemberAvatarsWithStats').then((m) => ({ default: m.MemberAvatarsWithStats }))
);

export const Hero = () => {
  return (
    <section className="relative w-full h-[100dvh] bg-[#050505] overflow-hidden">
      {/* Full-bleed background video */}
      <iframe
        src="https://www.youtube.com/embed/bpRUQw2Gzmc?autoplay=1&mute=1&loop=1&playlist=bpRUQw2Gzmc&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-[2] md:scale-[1.5] origin-center"
        style={{ border: 'none' }}
        title="Background video"
      />

      {/* Luxury dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Subtle gradient overlay — bottom-left bias for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content — anchored bottom-left, minimal */}
      <div className="relative z-10 flex flex-col justify-end h-full w-full">
        <div className="content-container pb-16 md:pb-24">
          <div className="max-w-[520px]">
            {/* Small eyebrow */}
            <span className="eyebrow block mb-4 text-white/60">SOCIAL CLUB</span>

            {/* Clean headline — Soho House scale */}
            <h1 className="font-display italic text-[36px] md:text-[48px] leading-[1.15] tracking-tight text-white mb-4">
              Where exceptional people find <span className="text-[hsl(var(--accent-gold))]">their circle</span>
            </h1>

            {/* Two CTA buttons */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                asChild
                className="rounded-full px-6 h-10 text-xs tracking-widest uppercase font-medium bg-[hsl(var(--accent-gold))] text-white hover:bg-[hsl(var(--accent-gold))]/90 border-0 transition-colors duration-200"
              >
                <TransitionLink to="/membership">
                  Become Member
                </TransitionLink>
              </Button>
              <TransitionLink
                to="/auth"
                className="text-xs tracking-widest uppercase font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                Sign In
              </TransitionLink>
            </div>

            {/* Member avatars + count — deferred to avoid blocking initial render */}
            <Suspense fallback={<div className="h-8" />}>
              <MemberAvatarsWithStats />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
};
