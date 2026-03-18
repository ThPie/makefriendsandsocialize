import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X, ArrowRight, Loader2, Crown, Star } from 'lucide-react';
import { useUpgrade } from '@/contexts/UpgradeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { TIER_BENEFITS } from '@/lib/square-products';
import { getTierDisplayName } from '@/lib/tier-utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TIER_RANK: Record<string, number> = { patron: 0, fellow: 1, founder: 2 };

export function InAppUpgradeModal() {
  const { isUpgradeOpen, closeUpgrade } = useUpgrade();
  const { subscription, openCheckout, openCustomerPortal } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const currentDbTier = subscription?.tier || 'patron';

  const handleCheckout = async (stripeId: 'member' | 'fellow', trial: boolean) => {
    setLoadingTier(stripeId);
    try {
      await openCheckout(stripeId, billingPeriod, trial);
      closeUpgrade();
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const tiers = [
    {
      id: 'insider',
      dbTier: 'fellow',
      stripeId: 'member' as const,
      name: 'Insider',
      price: billingPeriod === 'monthly' ? `$${TIER_BENEFITS.insider.monthlyPrice}` : `$${TIER_BENEFITS.insider.annualPrice}`,
      period: billingPeriod === 'monthly' ? '/mo' : '/yr',
      features: TIER_BENEFITS.insider.features.slice(0, 6),
      featured: true,
      badge: 'Most Popular',
      trialDays: 14,
    },
    {
      id: 'patron',
      dbTier: 'founder',
      stripeId: 'fellow' as const,
      name: 'Patron',
      price: billingPeriod === 'monthly' ? `$${TIER_BENEFITS.patron.monthlyPrice}` : `$${TIER_BENEFITS.patron.annualPrice}`,
      period: billingPeriod === 'monthly' ? '/mo' : '/yr',
      features: [
        'Everything in Insider',
        '30% off all events',
        '+1 guest privileges',
        'List your business',
        'Priority introductions',
        'Patron-only experiences',
      ],
      featured: false,
      badge: 'Premium',
      trialDays: 14,
    },
  ];

  return (
    <Dialog open={isUpgradeOpen} onOpenChange={(open) => !open && closeUpgrade()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="font-display text-2xl">
            Upgrade Your Membership
          </DialogTitle>
          <DialogDescription>
            You're currently on the{' '}
            <span className="font-semibold text-foreground">
              {getTierDisplayName(currentDbTier)}
            </span>{' '}
            plan. Choose a tier to unlock premium features.
          </DialogDescription>
        </DialogHeader>

        {/* Billing toggle */}
        <div className="px-6 pb-2">
          <div className="flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2 w-fit">
            <Label
              htmlFor="upgrade-billing"
              className={cn('text-sm', billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}
            >
              Monthly
            </Label>
            <Switch
              id="upgrade-billing"
              checked={billingPeriod === 'annual'}
              onCheckedChange={(v) => setBillingPeriod(v ? 'annual' : 'monthly')}
            />
            <Label
              htmlFor="upgrade-billing"
              className={cn('text-sm', billingPeriod === 'annual' ? 'text-foreground' : 'text-muted-foreground')}
            >
              Annual
            </Label>
            {billingPeriod === 'annual' && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 pt-2">
          {tiers.map((tier) => {
            const isCurrent = currentDbTier === tier.dbTier;
            const isUpgrade = TIER_RANK[tier.dbTier] > TIER_RANK[currentDbTier];
            const isDowngrade = TIER_RANK[tier.dbTier] < TIER_RANK[currentDbTier];

            return (
              <div
                key={tier.id}
                className={cn(
                  'rounded-xl border p-5 flex flex-col',
                  isCurrent
                    ? 'border-primary/40 bg-primary/5'
                    : tier.featured
                      ? 'border-[hsl(var(--accent-gold))] bg-card'
                      : 'border-border bg-card'
                )}
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg text-foreground">{tier.name}</h3>
                  {isCurrent ? (
                    <Badge className="bg-primary text-primary-foreground text-[10px]">Current</Badge>
                  ) : tier.badge ? (
                    <Badge variant="secondary" className="text-[10px]">{tier.badge}</Badge>
                  ) : null}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-display text-3xl text-foreground">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-[hsl(var(--accent-gold))] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      try {
                        await openCustomerPortal();
                        closeUpgrade();
                      } catch {
                        toast.error('Could not open billing portal.');
                      }
                    }}
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      'w-full',
                      tier.featured && 'bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-white'
                    )}
                    disabled={!!loadingTier}
                    onClick={() => handleCheckout(tier.stripeId, isUpgrade && !subscription?.subscribed)}
                  >
                    {loadingTier === tier.stripeId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {isUpgrade
                          ? subscription?.subscribed
                            ? `Upgrade to ${tier.name}`
                            : `Start ${tier.trialDays}-Day Free Trial`
                          : isDowngrade
                            ? `Switch to ${tier.name}`
                            : `Get ${tier.name}`}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            14-day free trial on all paid tiers · Cancel anytime · Secure checkout
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
