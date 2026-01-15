import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  subscribed: boolean;
  tier: 'explorer' | 'member' | 'fellow';
  subscription_end: string | null;
  is_trialing: boolean;
  trial_ends_at: string | null;
  available_reveals: number;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      setSubscription(data);
      setError(null);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to check subscription');
      // Default to free tier on error
      setSubscription({
        subscribed: false,
        tier: 'explorer',
        subscription_end: null,
        is_trialing: false,
        trial_ends_at: null,
        available_reveals: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();

    // Refresh subscription status periodically (every 60 seconds)
    const interval = setInterval(checkSubscription, 60000);

    return () => clearInterval(interval);
  }, [checkSubscription]);

  const openCheckout = async (tier: 'member' | 'fellow', billingPeriod: 'monthly' | 'annual', trial = false) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { tier, billing_period: billingPeriod, trial },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      throw err;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      throw err;
    }
  };

  return {
    subscription,
    isLoading,
    error,
    checkSubscription,
    openCheckout,
    openCustomerPortal,
    hasUnlimitedReveals: subscription?.tier === 'member' || subscription?.tier === 'fellow',
    canListBusiness: subscription?.tier === 'fellow',
    eventDiscount: subscription?.tier === 'fellow' ? 30 : subscription?.tier === 'member' ? 20 : 0,
    canBringGuest: subscription?.tier === 'fellow',
  };
}
