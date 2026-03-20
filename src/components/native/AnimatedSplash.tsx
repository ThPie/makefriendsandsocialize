import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';

/**
 * Animated splash overlay shown on native app launch.
 * Fades in a logo with a scale animation, then fades out after a delay.
 * Only renders on native platforms (iOS/Android).
 */
export function AnimatedSplash({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(() => Capacitor.isNativePlatform());

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: 'hsl(var(--background))' }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Animated logo ring */}
              <motion.div
                className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
              >
                <span className="text-4xl font-display font-bold text-primary-foreground">
                  MF
                </span>

                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-primary/40"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: 2, ease: 'easeOut' }}
                />
              </motion.div>

              <motion.p
                className="text-lg font-display tracking-wide text-foreground"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                MakeFriends
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
