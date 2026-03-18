import { useState, useEffect, useCallback } from 'react';
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
import { Check, ArrowRight, ArrowLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useUpgrade } from '@/contexts/UpgradeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { TIER_BENEFITS } from '@/lib/square-products';
import { getTierDisplayName } from '@/lib/tier-utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TIER_RANK: Record<string, number> = { patron: 0, fellow: 1, founder: 2 };

type ModalStep = 'select' | 'payment';

interface SquareConfig {
  applicationId: string;
  locationId: string;
  environment: 'sandbox' | 'production';
}

interface SelectedTier {
  id: string;
  dbTier: string;
  stripeId: 'member' | 'fellow';
  name: string;
  price: string;
  period: string;
  amountLabel: string;
}

export function InAppUpgradeModal() {
  const { isUpgradeOpen, closeUpgrade } = useUpgrade();
  const { subscription, openCustomerPortal, checkSubscription } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [step, setStep] = useState<ModalStep>('select');
  const [selectedTier, setSelectedTier] = useState<SelectedTier | null>(null);
  const [squareConfig, setSquareConfig] = useState<SquareConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [squareReady, setSquareReady] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const currentDbTier = subscription?.tier || 'patron';

  // Fetch Square config when modal opens
  useEffect(() => {
    if (isUpgradeOpen && !squareConfig && !configLoading) {
      setConfigLoading(true);
      setConfigError(null);
      supabase.functions.invoke('square-config')
        .then(({ data, error }) => {
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          setSquareConfig(data);
        })
        .catch((err) => {
          console.error('Failed to load Square config:', err);
          setConfigError('Unable to load payment system. Please try again.');
        })
        .finally(() => setConfigLoading(false));
    }
  }, [isUpgradeOpen, squareConfig, configLoading]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isUpgradeOpen) {
      setStep('select');
      setSelectedTier(null);
      setProcessing(false);
      setSquareReady(false);
    }
  }, [isUpgradeOpen]);

  const handleSelectTier = (tier: SelectedTier) => {
    setSelectedTier(tier);
    setStep('payment');
  };

  const handleTokenize = useCallback(async (token: { token: string }) => {
    if (!selectedTier || processing) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('square-create-subscription', {
        body: {
          source_id: token.token,
          tier: selectedTier.stripeId,
          billing_period: billingPeriod,
          trial: !subscription?.subscribed,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Welcome to ${selectedTier.name}! Your membership is now active.`);
      await checkSubscription();
      closeUpgrade();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  }, [selectedTier, billingPeriod, subscription, processing, checkSubscription, closeUpgrade]);

  const tiers = [
    {
      id: 'insider',
      dbTier: 'fellow',
      stripeId: 'member' as const,
      name: 'Insider',
      price: billingPeriod === 'monthly' ? `$${TIER_BENEFITS.insider.monthlyPrice}` : `$${TIER_BENEFITS.insider.annualPrice}`,
      period: billingPeriod === 'monthly' ? '/mo' : '/yr',
      amountLabel: billingPeriod === 'monthly'
        ? `$${TIER_BENEFITS.insider.monthlyPrice}/month`
        : `$${TIER_BENEFITS.insider.annualPrice}/year`,
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
      amountLabel: billingPeriod === 'monthly'
        ? `$${TIER_BENEFITS.patron.monthlyPrice}/month`
        : `$${TIER_BENEFITS.patron.annualPrice}/year`,
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
        {step === 'select' ? (
          <TierSelection
            tiers={tiers}
            currentDbTier={currentDbTier}
            billingPeriod={billingPeriod}
            setBillingPeriod={setBillingPeriod}
            subscription={subscription}
            onSelectTier={handleSelectTier}
            onManageSubscription={async () => {
              try {
                await openCustomerPortal();
                closeUpgrade();
              } catch {
                toast.error('Could not open billing portal.');
              }
            }}
          />
        ) : (
          <PaymentStep
            tier={selectedTier!}
            billingPeriod={billingPeriod}
            squareConfig={squareConfig}
            configLoading={configLoading}
            configError={configError}
            processing={processing}
            isTrial={!subscription?.subscribed}
            onBack={() => setStep('select')}
            onTokenize={handleTokenize}
            squareReady={squareReady}
            setSquareReady={setSquareReady}
            onRetryConfig={() => {
              setSquareConfig(null);
              setConfigError(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Tier Selection Step ──────────────────────────────────────────────────────

interface TierSelectionProps {
  tiers: any[];
  currentDbTier: string;
  billingPeriod: 'monthly' | 'annual';
  setBillingPeriod: (v: 'monthly' | 'annual') => void;
  subscription: any;
  onSelectTier: (tier: SelectedTier) => void;
  onManageSubscription: () => void;
}

function TierSelection({
  tiers,
  currentDbTier,
  billingPeriod,
  setBillingPeriod,
  subscription,
  onSelectTier,
  onManageSubscription,
}: TierSelectionProps) {
  return (
    <>
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
            className={cn('text-sm cursor-pointer', billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}
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
            className={cn('text-sm cursor-pointer', billingPeriod === 'annual' ? 'text-foreground' : 'text-muted-foreground')}
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg text-foreground">{tier.name}</h3>
                {isCurrent ? (
                  <Badge className="bg-primary text-primary-foreground text-[10px]">Current</Badge>
                ) : tier.badge ? (
                  <Badge variant="secondary" className="text-[10px]">{tier.badge}</Badge>
                ) : null}
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-3xl text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-[hsl(var(--accent-gold))] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="outline" className="w-full" onClick={onManageSubscription}>
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  className={cn(
                    'w-full',
                    tier.featured && 'bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-white'
                  )}
                  onClick={() => onSelectTier(tier)}
                >
                  {isUpgrade
                    ? subscription?.subscribed
                      ? `Upgrade to ${tier.name}`
                      : `Start ${tier.trialDays}-Day Free Trial`
                    : isDowngrade
                      ? `Switch to ${tier.name}`
                      : `Get ${tier.name}`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          14-day free trial on all paid tiers · Cancel anytime · Secure checkout via Square
        </p>
      </div>
    </>
  );
}

// ── Payment Step (Square Web Payments SDK) ───────────────────────────────────

interface PaymentStepProps {
  tier: SelectedTier;
  billingPeriod: 'monthly' | 'annual';
  squareConfig: SquareConfig | null;
  configLoading: boolean;
  configError: string | null;
  processing: boolean;
  isTrial: boolean;
  onBack: () => void;
  onTokenize: (token: { token: string }) => void;
  squareReady: boolean;
  setSquareReady: (v: boolean) => void;
  onRetryConfig: () => void;
}

function PaymentStep({
  tier,
  billingPeriod,
  squareConfig,
  configLoading,
  configError,
  processing,
  isTrial,
  onBack,
  onTokenize,
  squareReady,
  setSquareReady,
  onRetryConfig,
}: PaymentStepProps) {
  const [SquareComponents, setSquareComponents] = useState<{
    PaymentForm: any;
    CreditCard: any;
  } | null>(null);

  // Dynamically import the Square SDK to avoid SSR issues
  useEffect(() => {
    import('react-square-web-payments-sdk').then((mod) => {
      setSquareComponents({
        PaymentForm: mod.PaymentForm,
        CreditCard: mod.CreditCard,
      });
    });
  }, []);

  if (configError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground text-center">{configError}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button size="sm" onClick={onRetryConfig}>Retry</Button>
        </div>
      </div>
    );
  }

  if (configLoading || !squareConfig || !SquareComponents) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading secure payment form…</p>
      </div>
    );
  }

  const { PaymentForm, CreditCard } = SquareComponents;

  return (
    <>
      <DialogHeader className="p-6 pb-2">
        <DialogTitle className="font-display text-2xl flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          Complete Your {tier.name} Upgrade
        </DialogTitle>
        <DialogDescription>
          {isTrial
            ? `Start your 14-day free trial of ${tier.name}. You won't be charged today.`
            : `You'll be charged ${tier.amountLabel} for your ${tier.name} membership.`}
        </DialogDescription>
      </DialogHeader>

      {/* Order summary */}
      <div className="mx-6 mb-4 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{tier.name} Membership</p>
            <p className="text-xs text-muted-foreground capitalize">
              {billingPeriod} billing
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl text-foreground">{tier.price}<span className="text-sm text-muted-foreground">{tier.period}</span></p>
            {isTrial && (
              <p className="text-xs text-green-600 font-medium">14-day free trial</p>
            )}
          </div>
        </div>
      </div>

      {/* Square Payment Form */}
      <div className="px-6 pb-6">
        <PaymentForm
          applicationId={squareConfig.applicationId}
          locationId={squareConfig.locationId}
          cardTokenizeResponseReceived={(tokenResult: any) => {
            if (tokenResult.status === 'OK' && tokenResult.token) {
              onTokenize({ token: tokenResult.token });
            } else {
              toast.error('Card verification failed. Please try again.');
            }
          }}
          createPaymentRequest={() => ({
            countryCode: 'US',
            currencyCode: 'USD',
            total: {
              amount: tier.price.replace('$', ''),
              label: `${tier.name} Membership`,
            },
          })}
        >
          <div className="space-y-4">
            <CreditCard
              buttonProps={{
                isLoading: processing,
                css: {
                  backgroundColor: 'hsl(var(--accent-gold))',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '9999px',
                  padding: '12px 24px',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--accent-gold) / 0.9)',
                  },
                },
              }}
              style={{
                input: {
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                },
                'input::placeholder': {
                  color: 'hsl(var(--muted-foreground))',
                },
                '.input-container': {
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                },
                '.input-container.is-focus': {
                  borderColor: 'hsl(var(--accent-gold))',
                },
              }}
            >
              {processing
                ? 'Processing…'
                : isTrial
                  ? 'Start Free Trial'
                  : `Pay ${tier.amountLabel}`}
            </CreditCard>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Secured by Square · PCI-compliant · 256-bit encryption
              </p>
            </div>
          </div>
        </PaymentForm>
      </div>
    </>
  );
}
