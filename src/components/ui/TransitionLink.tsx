import { Link, LinkProps, useNavigate } from 'react-router-dom';
import React from 'react';

interface TransitionLinkProps extends LinkProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * A wrapper around react-router-dom's Link that uses React.startTransition
 * for navigation. This improves INP (Interaction to Next Paint) by allowing
 * the browser to prioritize the immediate click feedback (like active states)
 * before processing the heavy rendering of the new route.
 */
export const TransitionLink = React.forwardRef<HTMLAnchorElement, TransitionLinkProps>(
    ({ to, children, className, onClick, ...props }, ref) => {
        const navigate = useNavigate();

        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            // Let the browser handle standard link behavior for modifiers (new tab, etc.)
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                onClick?.(e);
                return;
            }

            e.preventDefault();
            onClick?.(e);

            // Wrap navigation in a transition
            React.startTransition(() => {
                navigate(to);
            });
        };

        return (
            <Link
                to={to}
                className={className}
                onClick={handleClick}
                ref={ref}
                {...props}
            >
                {children}
            </Link>
        );
    }
);

TransitionLink.displayName = 'TransitionLink';
