import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <div className="relative w-full">
      <div
        className="w-full flex min-h-[calc(100vh-81px)] flex-col gap-8 bg-cover bg-center bg-no-repeat items-center justify-center px-6 py-20 text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(20, 57, 59, 0.4), rgba(20, 57, 59, 0.7)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuALlg_lhUHqLRNeE3gFSxRbbm8jSE0aqI1u-ZcwATjIGoQogVHcL2OHTrhhup9LjakYQSqr_QC4AJX0w9rWQ8IW1lx8QZUZAv9M15Q3_2sR8ztqsBzz3NvXI5ZWnCCCepFwhvJB9AsMfHLfxR2R_hIcIusPCmJj_AekZ3ThepjJqPr5BxPLu4xwm7hqG_VNVhy_4SBQPcd6OBNwFbi6d6w2xKIvc0wcCtFORE8kPyuGrBK68YFzYROcREKIiSp7no4QEIXE5HufZx44")`,
        }}
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
    </div>
  );
};
