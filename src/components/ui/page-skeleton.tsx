import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

/* ===== Glass-panel class shorthand ===== */
const glass = 'rounded-xl border border-white/[0.08] bg-white/[0.04] dark:border-white/[0.08] dark:bg-white/[0.04]';

/* ===== Composable Skeleton Templates ===== */

/** A single card skeleton with image area, title, and description */
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn(glass, 'p-4 space-y-3', className)}>
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
            {/* Photo area */}
            <Skeleton className="h-64 w-full rounded-xl skeleton-shimmer" />
            {/* Name + subtitle */}
            <div className="space-y-2">
                <Skeleton className="h-6 w-48 skeleton-shimmer" />
                <Skeleton className="h-4 w-32 skeleton-shimmer" />
            </div>
            {/* Bio lines */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full skeleton-shimmer" />
                <Skeleton className="h-4 w-5/6 skeleton-shimmer" />
                <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
            </div>
            {/* Tags */}
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full skeleton-shimmer" />
                <Skeleton className="h-8 w-24 rounded-full skeleton-shimmer" />
                <Skeleton className="h-8 w-16 rounded-full skeleton-shimmer" />
            </div>
            {/* Photo grid */}
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-32 rounded-lg skeleton-shimmer" />
                <Skeleton className="h-32 rounded-lg skeleton-shimmer" />
            </div>
        </div>
    );
}

/** Event card skeleton — image + title + date + location */
export function EventCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn(glass, 'overflow-hidden', className)}>
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

/* ===== Page-Specific Loading Skeletons ===== */

/** Billing loading skeleton — plan card + invoice rows */
export function BillingLoadingSkeleton() {
    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-300">
            {/* Header */}
            <Skeleton className="h-8 w-48 skeleton-shimmer" />
            {/* Plan card */}
            <div className={cn(glass, 'p-5 space-y-4')}>
                <Skeleton className="h-5 w-24 skeleton-shimmer" />
                <Skeleton className="h-8 w-48 skeleton-shimmer" />
                <Skeleton className="h-4 w-64 skeleton-shimmer" />
                <Skeleton className="h-4 w-56 skeleton-shimmer" />
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32 rounded-lg skeleton-shimmer" />
                    <Skeleton className="h-10 w-20 rounded-lg skeleton-shimmer" />
                </div>
            </div>
            {/* Invoice section header */}
            <div className="flex justify-between">
                <Skeleton className="h-5 w-32 skeleton-shimmer" />
                <Skeleton className="h-5 w-16 skeleton-shimmer" />
            </div>
            {/* Invoice rows */}
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={cn(glass, 'p-4 flex items-center gap-3')}>
                    <Skeleton className="h-10 w-10 rounded-lg skeleton-shimmer" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40 skeleton-shimmer" />
                        <Skeleton className="h-3 w-24 skeleton-shimmer" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-lg skeleton-shimmer" />
                </div>
            ))}
        </div>
    );
}

/** Concierge loading skeleton — hero + benefits grid */
export function ConciergeLoadingSkeleton() {
    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-300">
            {/* Hero banner */}
            <Skeleton className="h-48 w-full rounded-xl skeleton-shimmer" />
            {/* Heading + description */}
            <Skeleton className="h-7 w-56 skeleton-shimmer" />
            <Skeleton className="h-4 w-full skeleton-shimmer" />
            <Skeleton className="h-4 w-4/5 skeleton-shimmer" />
            {/* CTA */}
            <Skeleton className="h-12 w-40 rounded-lg skeleton-shimmer" />
            {/* Benefits grid */}
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={cn(glass, 'p-4 space-y-3')}>
                        <Skeleton className="h-10 w-10 rounded-full skeleton-shimmer" />
                        <Skeleton className="h-4 w-24 skeleton-shimmer" />
                        <Skeleton className="h-3 w-full skeleton-shimmer" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Referrals loading skeleton — code box + stats + list */
export function ReferralsLoadingSkeleton() {
    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-300">
            {/* Heading */}
            <Skeleton className="h-8 w-48 skeleton-shimmer" />
            {/* Referral code box */}
            <div className={cn(glass, 'p-5 space-y-3')}>
                <Skeleton className="h-4 w-32 skeleton-shimmer" />
                <Skeleton className="h-12 w-full rounded-lg skeleton-shimmer" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-lg skeleton-shimmer" />
                    <Skeleton className="h-10 flex-1 rounded-lg skeleton-shimmer" />
                </div>
            </div>
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={cn(glass, 'p-4 space-y-2')}>
                        <Skeleton className="h-4 w-12 skeleton-shimmer" />
                        <Skeleton className="h-8 w-10 skeleton-shimmer" />
                    </div>
                ))}
            </div>
            {/* Referral list */}
            <Skeleton className="h-5 w-36 skeleton-shimmer" />
            <ListSkeleton rows={3} />
        </div>
    );
}

/** Perks loading skeleton — search bar + filter pills + featured card + list rows */
export function PerksLoadingSkeleton() {
    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-300">
            {/* Search bar */}
            <Skeleton className="h-12 w-full rounded-xl skeleton-shimmer" />
            {/* Filter pills */}
            <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-full skeleton-shimmer flex-shrink-0" />
                ))}
            </div>
            {/* Featured card */}
            <div className={cn(glass, 'overflow-hidden')}>
                <Skeleton className="h-48 w-full skeleton-shimmer" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4 skeleton-shimmer" />
                    <Skeleton className="h-4 w-1/2 skeleton-shimmer" />
                </div>
            </div>
            {/* List section header */}
            <div className="flex justify-between">
                <Skeleton className="h-5 w-36 skeleton-shimmer" />
                <Skeleton className="h-5 w-16 skeleton-shimmer" />
            </div>
            {/* List rows */}
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-14 w-14 rounded-lg skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40 skeleton-shimmer" />
                        <Skeleton className="h-3 w-28 skeleton-shimmer" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-full skeleton-shimmer" />
                </div>
            ))}
        </div>
    );
}

/** Connections / Network loading skeleton */
export function ConnectionsLoadingSkeleton() {
    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-300">
            {/* Header */}
            <Skeleton className="h-8 w-40 skeleton-shimmer" />
            <Skeleton className="h-5 w-56 skeleton-shimmer" />
            {/* Search */}
            <Skeleton className="h-10 w-full rounded-lg skeleton-shimmer" />
            {/* Connection cards */}
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={cn(glass, 'p-4 flex items-center gap-3')}>
                    <Skeleton className="h-14 w-14 rounded-lg skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-36 skeleton-shimmer" />
                        <Skeleton className="h-4 w-48 skeleton-shimmer" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-lg skeleton-shimmer" />
                </div>
            ))}
        </div>
    );
}

/** Match detail loading skeleton */
export function MatchDetailLoadingSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Full-width photo */}
            <Skeleton className="h-96 w-full skeleton-shimmer" />
            {/* Name + affinity */}
            <div className="px-4 space-y-2">
                <Skeleton className="h-7 w-40 skeleton-shimmer" />
                <Skeleton className="h-5 w-32 skeleton-shimmer" />
            </div>
            {/* Bio */}
            <div className="px-4 space-y-2">
                <Skeleton className="h-4 w-full skeleton-shimmer" />
                <Skeleton className="h-4 w-5/6 skeleton-shimmer" />
                <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
            </div>
            {/* Action buttons */}
            <div className="px-4 flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-xl skeleton-shimmer" />
                <Skeleton className="h-12 flex-1 rounded-xl skeleton-shimmer" />
            </div>
        </div>
    );
}
