import { Button } from '@/components/ui/button';
import { TransitionLink } from '@/components/ui/TransitionLink';

export const Hero = () => {
  return (
    <section className="relative w-full h-[100dvh] bg-background overflow-hidden">
      {/* Full-bleed background image */}
      <img
        src="/images/gallery/event-1.jpg"
        alt="Elevated social experiences"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Subtle gradient overlay — bottom-left bias for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

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

            {/* Small pill CTA */}
            <Button
              asChild
              className="rounded-full px-6 h-10 text-xs tracking-widest uppercase font-medium bg-white text-black hover:bg-white/90 border-0 transition-colors duration-200"
            >
              <TransitionLink to="/membership">
                Apply Now
              </TransitionLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
