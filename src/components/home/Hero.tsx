import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative w-full">
      <div
        className="flex min-h-[calc(100vh-81px)] w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-20 text-center transition-all duration-700 md:px-10"
        style={{
          backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuALlg_lhUHqLRNeE3gFSxRbbm8jSE0aqI1u-ZcwATjIGoQogVHcL2OHTrhhup9LjakYQSqr_QC4AJX0w9rWQ8IW1lx8QZUZAv9M15Q3_2sR8ztqsBzz3NvXI5ZWnCCCepFwhvJB9AsMfHLfxR2R_hIcIusPCmJj_AekZ3ThepjJqPr5BxPLu4xwm7hqG_VNVhy_4SBQPcd6OBNwFbi6d6w2xKIvc0wcCtFORE8kPyuGrBK68YFzYROcREKIiSp7no4QEIXE5HufZx44")`,
        }}
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
