import React from 'react';

interface SkipLinkProps {
    targetId?: string;
    label?: string;
}

/**
 * A "Skip to Content" link that is visually hidden until it receives focus.
 * Critical for keyboard and screen reader accessibility.
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
    targetId = 'main-content',
    label = 'Skip to main content'
}) => {
    return (
        <a
            href={`#${targetId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
        >
            {label}
        </a>
    );
};
