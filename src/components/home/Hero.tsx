import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';
import { EventCountdown } from './EventCountdown';

/**
 * Single looping hero video - no rotation
 */
const videoQualitySources = [
  { quality: 'low' as const, src: '/videos/hero-1.mp4', type: 'video/mp4' },
  { quality: 'high' as const, src: '/videos/hero-1.mp4', type: 'video/mp4' },
];

export const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Video Background - Single looping video */}
      <div className="absolute inset-0 bg-black">
        <AdaptiveVideo
          qualitySources={videoQualitySources}
          poster="/images/hero-poster.webp"
          loop={true}
          preloadStrategy="auto"
          showPosterOnSlowConnection={true}
          className="h-full w-full"
        />
        {/* Black Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div
        className="relative flex min-h-[calc(100vh-81px)] w-full flex-col items-center justify-center px-6 py-20 text-center md:px-10"
        role="img"
        aria-label="An elegant evening social gathering with people mingling in a softly lit, luxurious room."
      >
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-8 animate-fade-in">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
            A Private Social Club for <span className="text-gradient">Authentic Connections</span>
          </h1>
          <p className="max-w-2xl text-lg font-normal leading-relaxed text-white/90 md:text-xl drop-shadow-md">
            Weekly curated events. Vetted members. Genuine friendships—all through your membership.
          </p>

          <Button size="lg" asChild className="animate-fade-in mt-2" style={{ animationDelay: '0.15s' }}>
            <Link to="/membership">Start Your Application</Link>
          </Button>

          {/* Event Countdown */}
          <div className="mt-8">
            <EventCountdown />
          </div>
        </div>
      </div>
    </section>
  );
};
