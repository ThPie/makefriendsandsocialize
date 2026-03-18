import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from './useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useMatchReveal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { subscription, checkSubscription, hasUnlimitedReveals } = useSubscription();
  const [isRevealing, setIsRevealing] = useState(false);

  const availableReveals = subscription?.available_reveals || 0;

  const canReveal = hasUnlimitedReveals || availableReveals > 0;

  const revealMatch = useCallback(async (matchId: string) => {
    if (!canReveal && !hasUnlimitedReveals) {
      return { success: false, error: 'no_credits' };
    }

    const matchesQueryKey = ['dating-matches', user?.id];
    const previousMatches = queryClient.getQueryData(matchesQueryKey);

    // Optimistically update the match status
    if (previousMatches) {
      queryClient.setQueryData(matchesQueryKey, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((m: any) =>
          m.id === matchId ? { ...m, status: 'mutual_yes' } : m
        );
      });
    }

    setIsRevealing(true);

    try {
      const { data, error } = await supabase.functions.invoke('reveal-match', {
        body: { match_id: matchId },
      });

      if (error) throw error;

      if (data.success) {
        // Refresh subscription to update available reveals count
        await checkSubscription();

        // Invalidate matches query to get the full profile data from the server
        await queryClient.invalidateQueries({ queryKey: matchesQueryKey });

        if (data.revealed_via === 'purchase' && data.remaining_credits !== undefined) {
          toast.success(`Connection revealed! ${data.remaining_credits} reveals remaining.`);
        } else {
          toast.success('Connection revealed!');
        }
      } else {
        // If success is false, rollback
        if (previousMatches) {
          queryClient.setQueryData(matchesQueryKey, previousMatches);
        }
      }

      return data;
    } catch (err) {
      // Rollback on sync error
      if (previousMatches) {
        queryClient.setQueryData(matchesQueryKey, previousMatches);
      }

      console.error('Error revealing connection:', err);
      toast.error('Failed to reveal connection');
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsRevealing(false);
    }
  }, [user, queryClient, canReveal, hasUnlimitedReveals, checkSubscription]);

  const openRevealCheckout = async (packType: 'single', matchId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-square-reveal-checkout', {
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
