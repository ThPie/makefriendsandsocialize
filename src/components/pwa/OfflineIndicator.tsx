import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-destructive-foreground">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Some features may be unavailable.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
