import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Skeleton for a dashboard stat card */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/** Skeleton for an event list row */
export function EventRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Skeleton for a full event card (image + content) */
export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

/** Skeleton for a connection / member card */
export function MemberCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

/** Skeleton for a profile form section */
export function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/** Generic grid skeleton */
export function GridSkeleton({ count = 6, columns = 2 }: { count?: number; columns?: number }) {
  return (
    <div className={cn('grid gap-3', columns === 2 && 'grid-cols-2', columns === 3 && 'grid-cols-3')}>
      {Array.from({ length: count }).map((_, i) => (
        <MemberCardSkeleton key={i} />
      ))}
    </div>
  );
}
