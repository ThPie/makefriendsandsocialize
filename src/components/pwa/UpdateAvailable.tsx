import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function UpdateAvailable() {
  const { needsUpdate, updateApp } = usePWA();

  return (
    <AnimatePresence>
      {needsUpdate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 right-4 z-50 md:bottom-4"
        >
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-lg backdrop-blur-xl">
            <RefreshCw className="h-4 w-4 text-primary animate-spin-slow" />
            <span className="text-sm text-foreground">Update available</span>
            <Button
              size="sm"
              onClick={updateApp}
              className="h-7 rounded-full px-3 text-xs"
            >
              Refresh
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
