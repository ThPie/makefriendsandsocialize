import { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface NativeHeaderProps {
  title: string;
  /** Optional small subtitle below the title */
  subtitle?: string;
  /** Right-side actions */
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * iOS-style large title header that collapses to a compact bar on scroll.
 * Attach this at the top of a native page — it observes scroll position
 * of its parent scrollable container.
 */
export function NativeHeader({ title, subtitle, trailing, children, className }: NativeHeaderProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Compact sticky header — visible when scrolled */}
      <div
        className={cn(
          'sticky top-0 z-30 transition-all duration-200 border-b bg-background/95 backdrop-blur-xl',
          collapsed
            ? 'border-border/40 opacity-100 translate-y-0'
            : 'border-transparent opacity-0 -translate-y-1 pointer-events-none',
          className
        )}
      >
        <div className="flex items-center justify-between h-11 px-4">
          <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
          {trailing && <div className="flex items-center gap-2">{trailing}</div>}
        </div>
      </div>

      {/* Large title section */}
      <div ref={sentinelRef} className="px-4 pt-2 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {trailing && !collapsed && (
            <div className="flex items-center gap-2 mt-1">{trailing}</div>
          )}
        </div>
        {children}
      </div>
    </>
  );
}
