import { Skeleton } from '@/components/ui/skeleton';

/**
 * Standardized empty state for charts and data tables
 */
interface AdminEmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export function AdminEmptyState({ message = 'Gathering data...', icon }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon || (
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/40">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Skeleton loader for data tables
 */
export function AdminTableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`${r}-${c}`} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for charts
 */
export function AdminChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-48">
        {[40, 65, 45, 80, 55, 70, 35, 60, 75, 50, 85, 45].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}
