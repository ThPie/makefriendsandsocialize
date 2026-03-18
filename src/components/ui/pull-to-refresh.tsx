import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ArrowDown } from '@phosphor-icons/react';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const THRESHOLD = 80;

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, THRESHOLD], [0, 1]);
  const iconRotate = useTransform(y, [0, THRESHOLD], [0, 180]);
  const indicatorOpacity = useTransform(y, [0, 30], [0, 1]);

  const handleDragStart = useCallback(() => {
    // Only allow pull if scrolled to top
    const el = containerRef.current;
    if (el && el.scrollTop > 5) return;
    setPulling(true);
  }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    if (info.offset.y >= THRESHOLD && !refreshing) {
      haptic('medium');
    }
  }, [refreshing]);

  const handleDragEnd = useCallback(async (_: any, info: PanInfo) => {
    setPulling(false);
    if (info.offset.y >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      haptic('heavy');
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh, refreshing]);

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
        style={{ opacity: indicatorOpacity, height: y }}
      >
        <motion.div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full',
            'bg-primary/10 border border-primary/20',
            refreshing && 'animate-spin'
          )}
          style={{ rotate: refreshing ? undefined : iconRotate }}
        >
          <ArrowDown
            size={18}
            weight="bold"
            className="text-primary"
          />
        </motion.div>
      </motion.div>

      <motion.div
        drag={refreshing ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        dragDirectionLock
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: refreshing ? THRESHOLD / 2 : y }}
        animate={refreshing ? { y: THRESHOLD / 2 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="touch-pan-x"
      >
        {children}
      </motion.div>
    </div>
  );
}
