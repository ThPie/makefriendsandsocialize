import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AdaptiveVideo } from '@/components/ui/adaptive-video';

/**
 * Video quality sources for adaptive streaming
 * Each video has both low (720p) and high (1080p) quality versions
 * Currently using same files - replace with actual quality variants when available
 */
const videoQualitySources = [
  {
    id: 1,
    low: '/videos/hero-1.mp4',  // TODO: Replace with hero-1-720p.mp4
    high: '/videos/hero-1.mp4', // TODO: Replace with hero-1-1080p.mp4
  },
  {
    id: 2,
    low: '/videos/hero-2.mp4',
    high: '/videos/hero-2.mp4',
  },
  {
    id: 3,
    low: '/videos/hero-3.mp4',
    high: '/videos/hero-3.mp4',
  },
  {
    id: 4,
    low: '/videos/hero-4.mp4',
    high: '/videos/hero-4.mp4',
  },
];

export const Hero = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleVideoEnd = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videoQualitySources.length);
      setIsTransitioning(false);
    }, 300);
  };

  // Get quality sources for current video
  const currentQualitySources = [
    { quality: 'low' as const, src: videoQualitySources[currentVideoIndex].low, type: 'video/mp4' },
    { quality: 'high' as const, src: videoQualitySources[currentVideoIndex].high, type: 'video/mp4' },
  ];

  return (
    <section className="relative w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 bg-black">
        <div
          key={currentVideoIndex}
          className={`h-full w-full transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <AdaptiveVideo
            qualitySources={currentQualitySources}
            poster="/images/hero-poster.webp"
            onVideoEnd={handleVideoEnd}
            preloadStrategy={currentVideoIndex === 0 ? 'auto' : 'metadata'}
            showPosterOnSlowConnection={true}
            className="h-full w-full"
          />
        </div>
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
        </div>
      </div>
    </section>
  );
};
