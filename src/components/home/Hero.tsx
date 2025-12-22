import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const videos = [
  '/videos/hero-1.mp4',
  '/videos/hero-2.mp4',
  '/videos/hero-3.mp4',
  '/videos/hero-4.mp4',
];

export const Hero = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked, that's okay
      });
    }
  }, [currentVideoIndex]);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 bg-primary/80">
        <video
          ref={videoRef}
          key={currentVideoIndex}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
        >
          <source src={videos[currentVideoIndex]} type="video/mp4" />
        </video>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/25 to-primary/40" />
      </div>

      {/* Content */}
      <div
        className="relative flex min-h-[calc(100vh-81px)] w-full flex-col items-center justify-center px-6 py-20 text-center md:px-10"
        role="img"
        aria-label="An elegant evening social gathering with people mingling in a softly lit, luxurious room."
      >
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-8 animate-fade-in">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
            Where Extraordinary Connections Begin
          </h1>
          <p className="max-w-2xl text-lg font-normal leading-relaxed text-white/90 md:text-xl drop-shadow-md">
            Cultivating connections and celebrating moments through exclusive events.
          </p>
          <Button size="lg" asChild className="animate-fade-in mt-2" style={{ animationDelay: '0.2s' }}>
            <Link to="/membership">Request an Invitation</Link>
          </Button>
        </div>
      </div>

      {/* Video Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentVideoIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentVideoIndex 
                ? 'w-8 bg-white' 
                : 'w-1.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
