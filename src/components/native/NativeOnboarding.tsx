import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  UsersThree,
  CalendarBlank,
  HeartStraight,
  Sparkle,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface NativeOnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkle,
    title: 'Welcome to the Club',
    description: 'An exclusive community for meaningful connections, curated events, and lifelong friendships.',
    accent: 'from-primary to-primary/60',
  },
  {
    icon: UsersThree,
    title: 'Build Your Circle',
    description: 'Connect with like-minded individuals who share your values, interests, and ambitions.',
    accent: 'from-[hsl(var(--accent-gold))] to-[hsl(var(--accent-gold))]/60',
  },
  {
    icon: CalendarBlank,
    title: 'Exclusive Events',
    description: 'From intimate dinners to grand galas — attend members-only events designed to spark real connections.',
    accent: 'from-primary to-[hsl(var(--accent-gold))]',
  },
  {
    icon: HeartStraight,
    title: 'Slow Dating',
    description: 'Thoughtful matchmaking for members seeking a genuine partner. No swiping, just real chemistry.',
    accent: 'from-rose-500 to-pink-400',
  },
];

const swipeThreshold = 50;

export function NativeOnboarding({ onComplete }: NativeOnboardingProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = useCallback(
    (dir: number) => {
      const next = current + dir;
      if (next < 0) return;
      if (next >= slides.length) {
        haptic('success');
        onComplete();
        return;
      }
      setDirection(dir);
      setCurrent(next);
      haptic('selection');
    },
    [current, onComplete]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -swipeThreshold) paginate(1);
    else if (info.offset.x > swipeThreshold) paginate(-1);
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => { haptic('light'); onComplete(); }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction >= 0 ? 200 : -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -200 : 200, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex flex-col items-center text-center w-full touch-pan-y"
          >
            {/* Icon */}
            <div className={cn('w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center mb-8 shadow-lg', slide.accent)}>
              <slide.icon size={48} weight="duotone" className="text-white" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              {slide.title}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section: dots + CTA */}
      <div className="px-8 pb-8 space-y-6">
        {/* Page dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === current
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => paginate(1)}
          className={cn(
            'w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-[0.97]',
            isLast
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {isLast ? 'Get Started' : 'Continue'}
        </button>
      </div>

      {/* Brand watermark */}
      <div className="flex justify-center pb-4">
        <BrandLogo className="h-5 w-auto opacity-30" width={60} height={20} />
      </div>
    </div>
  );
}
