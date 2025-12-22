import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 bg-black">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          loop
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
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
    </section>
  );
};
