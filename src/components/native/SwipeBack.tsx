import { ReactNode, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { haptic } from '@/lib/haptics';

interface SwipeBackProps {
  children: ReactNode;
  /** Disable on root/home screens where back doesn't make sense */
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 80;
const EDGE_ZONE = 30; // px from left edge

/**
 * Wraps content to enable iOS-style swipe-from-left-edge to go back.
 * Only triggers when the swipe starts near the left edge of the screen.
 */
export function SwipeBack({ children, disabled }: SwipeBackProps) {
  const navigate = useNavigate();

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (disabled) return;
      // Only allow right swipes (positive x) that started from the left edge
      if (info.offset.x > SWIPE_THRESHOLD && info.velocity.x > 200) {
        haptic('light');
        navigate(-1);
      }
    },
    [disabled, navigate]
  );

  if (disabled) return <>{children}</>;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.3 }}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      className="touch-pan-y"
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}
