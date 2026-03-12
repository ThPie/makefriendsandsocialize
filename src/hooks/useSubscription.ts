import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { type DBTier, isTierAtLeast } from '@/lib/tier-utils';

export interface SubscriptionStatus {
  subscribed: boolean;
  tier: DBTier;
  subscription_end: string | null;
  is_trialing: boolean;
  trial_ends_at: string | null;
  available_reveals: number;
}

const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  subscribed: false,
  tier: 'patron',
  subscription_end: null,
  is_trialing: false,
  trial_ends_at: null,
  available_reveals: 0,
};

/**
 * Fetch subscription data from the edge function.
 * Extracted for use as a TanStack Query queryFn.
 */
async function fetchSubscription(): Promise<SubscriptionStatus> {
  const { data, error } = await supabase.functions.invoke('check-subscription');
  if (error) throw error;
  return data as SubscriptionStatus;
}

/**
 * useSubscription — manages subscription status via TanStack Query.
 *
 * Replaces the previous mutable module-level cache with React Query's
 * built-in deduplication, stale-while-revalidate, and window refocus.
 */
export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery<SubscriptionStatus>({
    queryKey: ['subscription', user?.id],
    queryFn: fetchSubscription,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,       // 5 min — won't refetch if fresh
    gcTime: 10 * 60 * 1000,          // 10 min — keep in cache after unmount
    refetchOnWindowFocus: true,       // re-check when tab regains focus
    refetchInterval: 5 * 60 * 1000,  // poll every 5 min (only when visible)
    refetchIntervalInBackground: false,
    retry: 2,
    placeholderData: DEFAULT_SUBSCRIPTION,
  });

  const checkSubscription = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
  }, [queryClient, user?.id]);

  const openCheckout = useCallback(async (
    tier: 'member' | 'fellow',
    billingPeriod: 'monthly' | 'annual',
    trial = false,
  ) => {
    const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
      body: { tier, billing_period: billingPeriod, trial },
    });
    if (error) throw error;
    if (data?.url) window.open(data.url, '_blank');
  }, []);

  const openCustomerPortal = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) throw error;
    if (data?.url) window.open(data.url, '_blank');
  }, []);

  return useMemo(() => ({
    subscription: subscription ?? DEFAULT_SUBSCRIPTION,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    checkSubscription,
    openCheckout,
    openCustomerPortal,
    hasUnlimitedReveals: isTierAtLeast(subscription?.tier, 'fellow'),
    canListBusiness: subscription?.tier === 'founder',
    eventDiscount: subscription?.tier === 'founder' ? 30 : subscription?.tier === 'fellow' ? 20 : 0,
    canBringGuest: subscription?.tier === 'founder',
  }), [subscription, isLoading, error, checkSubscription, openCheckout, openCustomerPortal]);
}
