import { ReactNode, memo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

const variants = {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
  },
};

/**
 * Wraps page content with a smooth fade + slide-up animation on route change.
 * Uses the pathname as the motion key so the animation only fires when the
 * route actually changes — NOT on every state update within the same page.
 * memo() prevents unnecessary re-renders from parent state changes.
 */
export const PageTransition = memo(function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation();

  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial="initial"
      animate="enter"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
});
