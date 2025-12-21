import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuALlg_lhUHqLRNeE3gFSxRbbm8jSE0aqI1u-ZcwATjIGoQogVHcL2OHTrhhup9LjakYQSqr_QC4AJX0w9rWQ8IW1lx8QZUZAv9M15Q3_2sR8ztqsBzz3NvXI5ZWnCCCepFwhvJB9AsMfHLfxR2R_hIcIusPCmJj_AekZ3ThepjJqPr5BxPLu4xwm7hqG_VNVhy_4SBQPcd6OBNwFbi6d6w2xKIvc0wcCtFORE8kPyuGrBK68YFzYROcREKIiSp7no4QEIXE5HufZx44")`,
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      />
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[rgba(20,57,59,0.4)] to-[rgba(20,57,59,0.7)]"
        style={{ transform: `translateY(${scrollY * 0.4}px)` }}
      />
      
      {/* Content */}
      <div
        className="relative w-full flex min-h-screen flex-col gap-8 items-center justify-center px-6 py-20 text-center"
        role="img"
        aria-label="An elegant evening social gathering with people mingling in a softly lit, luxurious room."
      >
        <div className="flex flex-col gap-6 max-w-[800px] animate-fade-in">
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl drop-shadow-lg">
            Where Extraordinary Connections Begin
          </h1>
          <p className="text-lg font-normal leading-normal text-white/90 md:text-xl drop-shadow-md">
            Cultivating connections and celebrating moments through exclusive events.
          </p>
        </div>
        <Button size="lg" asChild className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link to="/membership">Request an Invitation</Link>
        </Button>
      </div>
      
      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition-colors animate-bounce cursor-pointer"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </button>
    </div>
  );
};
