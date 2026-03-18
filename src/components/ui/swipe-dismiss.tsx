import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeDismissProps {
  children: ReactNode;
  onDismiss: () => void;
  className?: string;
  threshold?: number;
}

export function SwipeDismiss({ children, onDismiss, className, threshold = 120 }: SwipeDismissProps) {
  const [dismissed, setDismissed] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-threshold, 0, threshold], [0.3, 1, 0.3]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > threshold) {
      setDismissed(true);
      setTimeout(onDismiss, 200);
    }
  };

  if (dismissed) return null;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      exit={{ opacity: 0, height: 0 }}
      className={cn('touch-pan-y cursor-grab active:cursor-grabbing', className)}
    >
      {children}
    </motion.div>
  );
}
