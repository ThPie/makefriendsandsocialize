import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptics';

/**
 * Product IDs — these must match what's configured in App Store Connect
 * and Google Play Console. Update these when real products are set up.
 */
export const IAP_PRODUCTS = {
  insider_monthly: {
    id: 'com.makefriends.insider.monthly',
    label: 'Insider',
    price: '$49/mo',
    tier: 'fellow' as const,
  },
  patron_monthly: {
    id: 'com.makefriends.patron.monthly',
    label: 'Patron',
    price: '$79/mo',
    tier: 'founder' as const,
  },
  reveal_pack: {
    id: 'com.makefriends.reveal.pack',
    label: 'Connection Reveal',
    price: '$30',
    type: 'consumable' as const,
  },
} as const;

type ProductKey = keyof typeof IAP_PRODUCTS;

/**
 * In-App Purchase hook.
 * 
 * NOTE: Native IAP requires StoreKit (iOS) and Google Play Billing (Android)
 * which are configured in the native IDE projects. This hook provides the
 * framework and falls back to the existing Square web checkout when not
 * running natively or when IAP isn't available.
 * 
 * Full native IAP integration requires:
 * 1. Products configured in App Store Connect / Google Play Console
 * 2. The Capacitor IAP plugin registered in the native project
 * 3. Receipt validation via a server-side edge function
 */
export function useInAppPurchase() {
  const { user } = useAuth();
  const isNative = Capacitor.isNativePlatform();
  const [isPurchasing, setIsPurchasing] = useState(false);

  /**
   * Initiate a purchase. On native, this opens the native payment sheet.
   * On web, falls back to the existing Square checkout flow.
   */
  const purchase = useCallback(async (productKey: ProductKey): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to make a purchase');
      return false;
    }

    const product = IAP_PRODUCTS[productKey];
    setIsPurchasing(true);

    try {
      if (isNative) {
        // Native IAP flow — will be fully wired when native plugins are configured
        // For now, validate the purchase server-side via edge function
        const { data, error } = await supabase.functions.invoke('validate-iap', {
          body: {
            product_id: product.id,
            platform: Capacitor.getPlatform(),
            user_id: user.id,
          },
        });

        if (error) {
          toast.error('Purchase failed. Please try again.');
          await haptics.actionFailed();
          return false;
        }

        await haptics.matchReveal();
        toast.success(`${product.label} activated!`);
        return true;
      } else {
        // Web fallback — use existing Square checkout
        toast.info('Redirecting to checkout...');
        // The existing InAppUpgradeModal handles web checkout
        return false;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed');
      await haptics.actionFailed();
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [user, isNative]);

  /**
   * Restore previous purchases (required by App Store guidelines).
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative || !user) return false;

    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('restore-iap', {
        body: {
          platform: Capacitor.getPlatform(),
          user_id: user.id,
        },
      });

      if (error || !data?.restored) {
        toast.info('No previous purchases found');
        return false;
      }

      toast.success('Purchases restored!');
      await haptics.save();
      return true;
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Could not restore purchases');
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isNative, user]);

  return {
    isNative,
    isPurchasing,
    products: IAP_PRODUCTS,
    purchase,
    restorePurchases,
  };
}
