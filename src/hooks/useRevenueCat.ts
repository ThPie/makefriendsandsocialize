import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptics';

/**
 * RevenueCat product identifiers — must match RevenueCat dashboard config.
 * These are entitlement/product IDs, not raw App Store / Play Store IDs.
 */
export const RC_PRODUCTS = {
  insider_monthly: 'insider_monthly',
  insider_annual: 'insider_annual',
  patron_monthly: 'patron_monthly',
  patron_annual: 'patron_annual',
} as const;

export const RC_ENTITLEMENTS = {
  insider: 'insider_access',
  patron: 'patron_access',
} as const;

type RCProductKey = keyof typeof RC_PRODUCTS;

interface CustomerInfo {
  activeSubscriptions: string[];
  entitlements: Record<string, { isActive: boolean; expiresDate: string | null }>;
}

/**
 * RevenueCat integration hook.
 *
 * On native platforms, this communicates with the RevenueCat Capacitor plugin.
 * The plugin must be installed in the native project:
 *   npm install @revenuecat/purchases-capacitor
 *
 * On web, falls back to the existing Square checkout flow.
 *
 * Server-side receipt validation is handled by the `revenuecat-webhook`
 * edge function which RevenueCat calls on subscription lifecycle events.
 */
export function useRevenueCat() {
  const { user } = useAuth();
  const isNative = Capacitor.isNativePlatform();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [rcReady, setRcReady] = useState(false);

  // Initialize RevenueCat SDK on native
  useEffect(() => {
    if (!isNative || !user) return;

    let cancelled = false;

    async function init() {
      try {
        // Dynamic import — only loads on native where the plugin exists
        // @ts-ignore — dynamic import, types only available when native plugin is installed
        const { Purchases } = await import('@revenuecat/purchases-capacitor');

        // Configure with your RevenueCat API key (set via edge function / config)
        const { data } = await supabase.functions.invoke('revenuecat-config');
        if (!data?.apiKey) {
          console.warn('RevenueCat API key not configured');
          return;
        }

        const platform = Capacitor.getPlatform();
        await Purchases.configure({
          apiKey: platform === 'ios' ? data.apiKey : data.googleApiKey || data.apiKey,
          appUserID: user.id,
        });

        // Fetch initial customer info
        const info = await Purchases.getCustomerInfo();
        if (!cancelled) {
          setCustomerInfo(mapCustomerInfo(info));
          setRcReady(true);
        }
      } catch (err) {
        console.error('RevenueCat init error:', err);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [isNative, user]);

  const purchase = useCallback(async (productKey: RCProductKey): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to make a purchase');
      return false;
    }

    if (!isNative) {
      // Web fallback — use existing Square modal
      toast.info('Redirecting to checkout…');
      return false;
    }

    setIsPurchasing(true);
    try {
      // @ts-ignore — dynamic import, types only available when native plugin is installed
      const { Purchases } = await import('@revenuecat/purchases-capacitor');

      // Get available packages
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;
      if (!currentOffering) {
        toast.error('No products available');
        return false;
      }

      // Find the matching package
      const pkg = currentOffering.availablePackages.find(
        (p: any) => p.identifier === RC_PRODUCTS[productKey] || p.product?.identifier === RC_PRODUCTS[productKey]
      );

      if (!pkg) {
        toast.error('Product not found');
        return false;
      }

      const result = await Purchases.purchasePackage({ aPackage: pkg });
      setCustomerInfo(mapCustomerInfo(result));

      await haptics.matchReveal();
      toast.success('Subscription activated!');
      return true;
    } catch (err: any) {
      if (err?.userCancelled) {
        // User cancelled — not an error
        return false;
      }
      console.error('Purchase error:', err);
      toast.error('Purchase failed. Please try again.');
      await haptics.actionFailed();
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [user, isNative]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative || !user) return false;

    setIsPurchasing(true);
    try {
      // @ts-ignore — dynamic import, types only available when native plugin is installed
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const info = await Purchases.restorePurchases();
      setCustomerInfo(mapCustomerInfo(info));

      const hasActive = Object.values(mapCustomerInfo(info).entitlements).some(e => e.isActive);
      if (hasActive) {
        toast.success('Purchases restored!');
        await haptics.save();
        return true;
      } else {
        toast.info('No previous purchases found');
        return false;
      }
    } catch (err) {
      console.error('Restore error:', err);
      toast.error('Could not restore purchases');
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isNative, user]);

  const hasEntitlement = useCallback((entitlement: string): boolean => {
    if (!customerInfo) return false;
    return customerInfo.entitlements[entitlement]?.isActive ?? false;
  }, [customerInfo]);

  return {
    isNative,
    isPurchasing,
    rcReady,
    customerInfo,
    purchase,
    restorePurchases,
    hasEntitlement,
  };
}

function mapCustomerInfo(raw: any): CustomerInfo {
  const info = raw?.customerInfo || raw;
  return {
    activeSubscriptions: info?.activeSubscriptions || [],
    entitlements: Object.fromEntries(
      Object.entries(info?.entitlements?.active || {}).map(([key, val]: [string, any]) => [
        key,
        { isActive: val?.isActive ?? true, expiresDate: val?.expiresDate ?? null },
      ])
    ),
  };
}
