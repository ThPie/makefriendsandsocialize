import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  CreditCard,
  Download,
  ExternalLink,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { SEOHead } from '@/components/SEOHead';

interface Invoice {
  id: string;
  stripe_invoice_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  pdf_url: string | null;
  hosted_invoice_url: string | null;
  invoice_number: string | null;
  description: string | null;
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
  created_at: string;
}

export default function PortalBilling() {
  const { user } = useAuth();
  const { subscription, openCustomerPortal, isLoading: subscriptionLoading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!user,
  });

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] uppercase tracking-widest font-bold"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'open':
        return <Badge className="bg-[hsl(var(--accent-gold))]/15 text-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))]/25 text-[10px] uppercase tracking-widest font-bold"><Clock className="w-3 h-3 mr-1" />Open</Badge>;
      case 'uncollectible':
      case 'void':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <>
      <SEOHead
        title="Billing & Invoices"
        description="Manage your subscription and view invoice history"
        noIndex
      />

      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">Billing & Subscriptions</h1>
          <p className="text-muted-foreground">Manage your plan and payment history</p>
        </div>

        {/* Current Subscription */}
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Current Plan
            </CardTitle>
            <CardDescription>Your current membership plan and billing details</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold capitalize">{subscription.tier} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.subscribed ? 'Active subscription' : 'Free tier'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">
                      {subscription.is_trialing ? 'Trial' : subscription.subscribed ? 'Active' : 'Basic'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  {subscription.is_trialing && subscription.trial_ends_at ? (
                    <>
                      <div className="flex justify-between items-end text-sm text-gray-400 mb-1">
                        <span>Trial Period</span>
                        <span className="text-white font-medium">
                          {Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                        </span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-[80%]"></div>
                      </div>
                    </>
                  ) : (
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-full"></div>
                    </div>
                  )}
                </div>

                {subscription.is_trialing && subscription.trial_ends_at && (
                  <div className="bg-primary/10 border border-[hsl(var(--accent-gold))]/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-primary">
                      Trial ends {format(new Date(subscription.trial_ends_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {portalLoading ? 'Opening...' : 'Manage Subscription'}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No active subscription</p>
            )}
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[hsl(var(--accent-gold))]" />
              Invoice History
            </CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.08] last:border-0">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : invoices && invoices.length > 0 ? (
              <div className="divide-y divide-white/[0.08]">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {invoice.invoice_number || `Invoice #${invoice.stripe_invoice_id?.slice(-8)}`}
                        </span>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatAmount(invoice.amount_cents, invoice.currency)}
                        </span>
                      </div>
                      {invoice.description && (
                        <p className="text-xs text-muted-foreground">{invoice.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {invoice.pdf_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-1"
                        >
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3 h-3" />
                            PDF
                          </a>
                        </Button>
                      )}
                      {invoice.hosted_invoice_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="No Invoices Yet"
                description="Your first invoice will appear here once your membership cycle begins."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
