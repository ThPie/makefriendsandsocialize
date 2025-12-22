import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useParallax } from '@/hooks/useParallax';

export const Hero = () => {
  const bgOffset = useParallax({ speed: 0.4, direction: 'down' });
  const contentOffset = useParallax({ speed: 0.15, direction: 'up' });

  return (
    <section className="relative w-full overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center bg-no-repeat transition-transform will-change-transform"
        style={{
          backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuALlg_lhUHqLRNeE3gFSxRbbm8jSE0aqI1u-ZcwATjIGoQogVHcL2OHTrhhup9LjakYQSqr_QC4AJX0w9rWQ8IW1lx8QZUZAv9M15Q3_2sR8ztqsBzz3NvXI5ZWnCCCepFwhvJB9AsMfHLfxR2R_hIcIusPCmJj_AekZ3ThepjJqPr5BxPLu4xwm7hqG_VNVhy_4SBQPcd6OBNwFbi6d6w2xKIvc0wcCtFORE8kPyuGrBK68YFzYROcREKIiSp7no4QEIXE5HufZx44")`,
          transform: `translateY(${bgOffset}px) scale(1.1)`,
        }}
        aria-hidden="true"
      />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-secondary/40 to-secondary/60"
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className="relative flex min-h-[calc(100vh-81px)] w-full flex-col items-center justify-center px-6 py-20 text-center md:px-10"
        role="img"
        aria-label="An elegant evening social gathering with people mingling in a softly lit, luxurious room."
      >
        <div 
          className="mx-auto flex max-w-[900px] flex-col items-center gap-8 animate-fade-in will-change-transform"
          style={{
            transform: `translateY(${contentOffset}px)`,
          }}
        >
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
