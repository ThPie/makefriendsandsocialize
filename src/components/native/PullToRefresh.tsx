import { ReactNode, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

/**
 * Pull-to-refresh wrapper for native app pages.
 * Drag down from the top to trigger a refresh callback.
 */
export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const isAtTop = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    // Walk up to find the scrollable parent
    let parent: HTMLElement | null = el;
    while (parent) {
      if (parent.scrollTop > 0) return false;
      parent = parent.parentElement;
    }
    return true;
  }, []);

  const handleDrag = useCallback(
    (_: unknown, info: PanInfo) => {
      if (refreshing) return;
      if (!isAtTop()) return;
      const pull = Math.max(0, Math.min(info.offset.y, MAX_PULL));
      setPullDistance(pull);
    },
    [refreshing, isAtTop]
  );

  const handleDragEnd = useCallback(
    async (_: unknown, info: PanInfo) => {
      if (refreshing) return;
      if (!isAtTop() || info.offset.y < PULL_THRESHOLD) {
        setPullDistance(0);
        return;
      }

      haptic('medium');
      setRefreshing(true);
      setPullDistance(PULL_THRESHOLD);

      try {
        await onRefresh();
      } finally {
        haptic('success');
        setRefreshing(false);
        setPullDistance(0);
      }
    },
    [refreshing, isAtTop, onRefresh]
  );

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pullDistance > 0 || refreshing ? Math.max(pullDistance, refreshing ? 48 : 0) : 0 }}
      >
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full bg-muted transition-transform',
            refreshing && 'animate-spin'
          )}
          style={{ opacity: progress, transform: `rotate(${progress * 360}deg)` }}
        >
          <Loader2 className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Content */}
      <motion.div
        drag={refreshing ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="touch-pan-x"
      >
        {children}
      </motion.div>
    </div>
  );
}
