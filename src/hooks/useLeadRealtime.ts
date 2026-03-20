import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook that polls for lead updates instead of using realtime subscriptions.
 * Invalidates lead queries periodically to pick up new data.
 */
export function useLeadRealtime(businessId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    // Poll every 60 seconds instead of maintaining a realtime channel
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['business-leads', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-lead-stats', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-lead-usage', businessId] });
    }, 60_000);

    return () => clearInterval(interval);
  }, [businessId, queryClient]);
}
