import { ReactNode, memo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface NativePageTransitionProps {
  children: ReactNode;
}

/**
 * iOS-style slide transition for native app navigation.
 * Pages slide in from the right and fade slightly.
 */
const variants = {
  initial: { x: '8%', opacity: 0 },
  enter: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 35, mass: 0.8 },
  },
  exit: {
    x: '-4%',
    opacity: 0.5,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const NativePageTransition = memo(function NativePageTransition({
  children,
}: NativePageTransitionProps) {
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
