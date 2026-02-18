import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionIcon?: LucideIcon;
    onAction?: () => void;
    className?: string;
}

/**
 * Stitch-styled empty state — centered circular icon with glow ring,
 * serif heading, muted description, optional outlined CTA.
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionIcon: ActionIcon,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
            {/* Circular icon with glow ring */}
            <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-white/[0.06] dark:bg-white/[0.06] border border-primary/30 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-primary" />
                </div>
                {/* Outer glow ring */}
                <div className="absolute inset-0 -m-2 rounded-full border border-primary/10" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-display font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>

            {/* Optional CTA */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/40 text-primary text-sm font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors"
                >
                    {ActionIcon && <ActionIcon className="w-4 h-4" />}
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
