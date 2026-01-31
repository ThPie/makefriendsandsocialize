import { X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeoRedirect } from '@/hooks/useGeoRedirect';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A dismissible banner that suggests Canadian users visit the .ca domain.
 * Only shows on .com domains for users detected in Canada.
 */
export function CountryRedirectBanner() {
  const { showBanner, isLoading, dismissBanner, redirectToCanada } = useGeoRedirect();

  // Don't render anything while loading or if banner shouldn't be shown
  if (isLoading || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-primary text-primary-foreground shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium truncate">
                It looks like you're in Canada! Would you like to visit our Canadian site?
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={redirectToCanada}
                className="whitespace-nowrap"
              >
                Visit .ca
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissBanner}
                className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                Stay here
              </Button>
              <button
                onClick={dismissBanner}
                className="p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
