import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Slim banner that appears at the top of the screen when the device is offline.
 * Auto-hides when connectivity is restored.
 */
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      className={cn(
        'fixed top-0 inset-x-0 z-[9998] flex items-center justify-center gap-2',
        'bg-destructive/90 text-destructive-foreground py-1.5 px-4 text-xs font-medium',
        'backdrop-blur-sm safe-area-top',
      )}
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>You're offline — using cached data</span>
    </div>
  );
}
