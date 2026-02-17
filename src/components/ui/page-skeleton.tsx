import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

/* ===== Composable Skeleton Templates ===== */

/** A single card skeleton with image area, title, and description */
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-xl border border-border bg-card p-4 space-y-3', className)}>
            <Skeleton className="h-40 w-full rounded-lg skeleton-shimmer" />
            <Skeleton className="h-5 w-3/4 skeleton-shimmer" />
            <Skeleton className="h-4 w-1/2 skeleton-shimmer" />
        </div>
    );
}

/** Grid of card skeletons (default: 3 cards in responsive grid) */
export function CardGridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
    return (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

/** A list of rows, each with an avatar + two lines */
export function ListSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
    return (
        <div className={cn('space-y-4', className)}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/5 skeleton-shimmer" />
                        <Skeleton className="h-3 w-2/5 skeleton-shimmer" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Profile skeleton — avatar + name + bio + stats bar */
export function ProfileSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40 skeleton-shimmer" />
                    <Skeleton className="h-4 w-24 skeleton-shimmer" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full skeleton-shimmer" />
                <Skeleton className="h-4 w-5/6 skeleton-shimmer" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-10 w-24 rounded-lg skeleton-shimmer" />
                <Skeleton className="h-10 w-24 rounded-lg skeleton-shimmer" />
                <Skeleton className="h-10 w-24 rounded-lg skeleton-shimmer" />
            </div>
        </div>
    );
}

/** Event card skeleton — image + title + date + location */
export function EventCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
            <Skeleton className="h-48 w-full skeleton-shimmer" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-20 rounded-full skeleton-shimmer" />
                <Skeleton className="h-5 w-4/5 skeleton-shimmer" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded skeleton-shimmer" />
                    <Skeleton className="h-4 w-32 skeleton-shimmer" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded skeleton-shimmer" />
                    <Skeleton className="h-4 w-40 skeleton-shimmer" />
                </div>
            </div>
        </div>
    );
}

/** Full page skeleton — header bar + content area (useful as Suspense fallback) */
export function PageSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('p-4 md:p-8 space-y-6 animate-in fade-in duration-300', className)}>
            {/* Page header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 skeleton-shimmer" />
                <Skeleton className="h-4 w-72 skeleton-shimmer" />
            </div>
            {/* Content area skeleton */}
            <CardGridSkeleton count={6} />
        </div>
    );
}
