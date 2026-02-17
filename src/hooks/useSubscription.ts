import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { type DBTier, isTierAtLeast, toStripeCheckoutTier } from '@/lib/tier-utils';

export interface SubscriptionStatus {
  subscribed: boolean;
  tier: DBTier;
  subscription_end: string | null;
  is_trialing: boolean;
  trial_ends_at: string | null;
  available_reveals: number;
}

// Cache subscription data to prevent duplicate calls
const subscriptionCache: {
  data: SubscriptionStatus | null;
  timestamp: number;
  userId: string | null;
} = {
  data: null,
  timestamp: 0,
  userId: null,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(subscriptionCache.data);
  const [isLoading, setIsLoading] = useState(!subscriptionCache.data);
  const [error, setError] = useState<string | null>(null);
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef(0);

  const checkSubscription = useCallback(async (force = false) => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const now = Date.now();

    // Use cache if still valid and not forcing refresh
    if (!force &&
      subscriptionCache.userId === user.id &&
      subscriptionCache.data &&
      (now - subscriptionCache.timestamp) < CACHE_DURATION) {
      setSubscription(subscriptionCache.data);
      setIsLoading(false);
      return;
    }

    // Prevent duplicate calls
    if (isCheckingRef.current) return;

    // Debounce rapid calls
    if (now - lastCheckRef.current < 5000) return;

    isCheckingRef.current = true;
    lastCheckRef.current = now;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      // Update cache
      subscriptionCache.data = data;
      subscriptionCache.timestamp = now;
      subscriptionCache.userId = user.id;

      setSubscription(data);
      setError(null);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to check subscription');
      // Default to free tier on error
      const defaultData: SubscriptionStatus = {
        subscribed: false,
        tier: 'patron',
        subscription_end: null,
        is_trialing: false,
        trial_ends_at: null,
        available_reveals: 0,
      };
      setSubscription(defaultData);
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();

    // Visibility-based refresh - only check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Reduced polling: 5 minutes instead of 60 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkSubscription();
      }
    }, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [checkSubscription]);

  const openCheckout = useCallback(async (tier: 'member' | 'fellow', billingPeriod: 'monthly' | 'annual', trial = false) => {
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
  }, []);

  const openCustomerPortal = useCallback(async () => {
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
  }, []);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    subscription,
    isLoading,
    error,
    checkSubscription: () => checkSubscription(true),
    openCheckout,
    openCustomerPortal,
    hasUnlimitedReveals: isTierAtLeast(subscription?.tier, 'fellow'),
    canListBusiness: subscription?.tier === 'founder',
    eventDiscount: subscription?.tier === 'founder' ? 30 : subscription?.tier === 'fellow' ? 20 : 0,
    canBringGuest: subscription?.tier === 'founder',
  }), [subscription, isLoading, error, checkSubscription, openCheckout, openCustomerPortal]);
}
