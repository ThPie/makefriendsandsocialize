import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead } from '@/components/business/LeadCard';

/**
 * Hook to subscribe to real-time lead updates for a business
 */
export function useLeadRealtime(businessId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    if (import.meta.env.DEV) console.log('Subscribing to lead updates for business:', businessId);

    const channel = supabase
      .channel(`business-leads-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'business_leads',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          if (import.meta.env.DEV) console.log('New lead received:', payload);
          const newLead = payload.new as Lead;

          // Show toast notification
          toast.success('New Lead!', {
            description: `${newLead.contact_name} from ${newLead.company_name || 'Unknown Company'} just submitted an inquiry.`,
            duration: 8000,
          });

          // Update the leads query cache
          queryClient.setQueryData<Lead[]>(['business-leads', businessId], (old) => {
            if (!old) return [newLead];
            return [newLead, ...old];
          });

          // Invalidate stats to refresh counts
          queryClient.invalidateQueries({ queryKey: ['business-lead-stats', businessId] });
          queryClient.invalidateQueries({ queryKey: ['business-lead-usage', businessId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'business_leads',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          if (import.meta.env.DEV) console.log('Lead updated:', payload);
          const updatedLead = payload.new as Lead;

          // Update the leads query cache
          queryClient.setQueryData<Lead[]>(['business-leads', businessId], (old) => {
            if (!old) return [updatedLead];
            return old.map((lead) =>
              lead.id === updatedLead.id ? updatedLead : lead
            );
          });

          // Invalidate stats
          queryClient.invalidateQueries({ queryKey: ['business-lead-stats', businessId] });
        }
      )
      .subscribe((status) => {
        if (import.meta.env.DEV) console.log('Lead realtime subscription status:', status);
      });

    return () => {
      if (import.meta.env.DEV) console.log('Unsubscribing from lead updates');
      supabase.removeChannel(channel);
    };
  }, [businessId, queryClient]);
}
