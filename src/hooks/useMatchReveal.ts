import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from './useSubscription';
import { toast } from 'sonner';
import { TEST_MODE } from '@/contexts/AuthContext';

export function useMatchReveal() {
  const { subscription, checkSubscription, hasUnlimitedReveals } = useSubscription();
  const [isRevealing, setIsRevealing] = useState(false);

  const availableReveals = subscription?.available_reveals || 0;

  const canReveal = hasUnlimitedReveals || availableReveals > 0;

  const revealMatch = useCallback(async (matchId: string) => {
    if (!canReveal && !hasUnlimitedReveals) {
      return { success: false, error: 'no_credits' };
    }

    setIsRevealing(true);

    try {
      // In test mode, simulate successful reveal
      if (TEST_MODE) {
        console.log('[TEST MODE] Would reveal match:', matchId);
        toast.success('Connection revealed! (Test Mode)');
        return { success: true, revealed_via: 'membership' };
      }

      const { data, error } = await supabase.functions.invoke('reveal-match', {
        body: { match_id: matchId },
      });

      if (error) throw error;

      if (data.success) {
        // Refresh subscription to update available reveals count
        await checkSubscription();
        
        if (data.revealed_via === 'purchase' && data.remaining_credits !== undefined) {
          toast.success(`Connection revealed! ${data.remaining_credits} reveals remaining.`);
        } else {
          toast.success('Connection revealed!');
        }
      }

      return data;
    } catch (err) {
      console.error('Error revealing connection:', err);
      toast.error('Failed to reveal connection');
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsRevealing(false);
    }
  }, [canReveal, hasUnlimitedReveals, checkSubscription]);

  const openRevealCheckout = async (packType: 'single' | 'pack_3', matchId?: string) => {
    if (TEST_MODE) {
      console.log('[TEST MODE] Would open reveal checkout:', { packType, matchId });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-reveal-checkout', {
        body: { pack_type: packType, match_id: matchId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error creating reveal checkout:', err);
      toast.error('Failed to open checkout');
      throw err;
    }
  };

  return {
    availableReveals,
    canReveal,
    hasUnlimitedReveals,
    isRevealing,
    revealMatch,
    openRevealCheckout,
  };
}
