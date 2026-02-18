import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobilePageHeaderProps {
    title: string;
    /** Show back button (default: true) */
    showBack?: boolean;
    /** Custom back navigation path */
    backTo?: string;
    /** Right-side action element (icon button, etc.) */
    rightAction?: React.ReactNode;
    /** Additional className for the nav container */
    className?: string;
    /** Whether title should use display font */
    displayFont?: boolean;
}

/**
 * Stitch-style mobile page header
 * Pattern: ← back | Centered Title | Right action
 * Sticky, glassmorphic, respects safe-area-inset-top
 */
export function MobilePageHeader({
    title,
    showBack = true,
    backTo,
    rightAction,
    className,
    displayFont = false,
}: MobilePageHeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (backTo) {
            navigate(backTo);
        } else {
            navigate(-1);
        }
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden',
                'bg-background/95 dark:bg-[#131f16]/95 backdrop-blur-lg',
                'border-b border-border/30 dark:border-white/[0.06]',
                className
            )}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            {/* Left: back button or spacer */}
            <div className="w-10 flex items-center">
                {showBack ? (
                    <button
                        onClick={handleBack}
                        className="flex items-center justify-center p-1.5 -ml-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                ) : (
                    <div className="w-10" />
                )}
            </div>

            {/* Center: title */}
            <h1
                className={cn(
                    'text-base font-bold tracking-tight text-foreground truncate max-w-[60%] text-center',
                    displayFont && 'font-display text-lg'
                )}
            >
                {title}
            </h1>

            {/* Right: action or spacer */}
            <div className="w-10 flex items-center justify-end">
                {rightAction || <div className="w-10" />}
            </div>
        </header>
    );
}
