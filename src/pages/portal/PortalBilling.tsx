import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard,
  ExternalLink,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { SEOHead } from '@/components/SEOHead';
import { InvoiceDetailModal } from '@/components/portal/InvoiceDetailModal';
import { cn } from '@/lib/utils';

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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary tracking-wide">Paid</span>;
      case 'open':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#d4af37]/10 text-[#d4af37] tracking-wide">Open</span>;
      case 'uncollectible':
      case 'void':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-500 tracking-wide">Failed</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-500/10 text-gray-400 tracking-wide">{status}</span>;
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

      <div className="space-y-6 pb-20">
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-white/5">
          <h1 className="text-white text-lg font-bold leading-tight tracking-tight">Billing & Subscriptions</h1>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 hover:bg-white/5 h-8 px-2 rounded-full">
            Help
          </Button>
        </header>

        {/* Current Subscription Card */}
        <section className="rounded-xl bg-[#1c2e1f] border border-white/5 overflow-hidden shadow-lg relative group transition-all hover:border-white/10">
          {/* Decorative gradient blob */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="p-5 flex flex-col gap-4 relative z-10 w-full">
            {subscriptionLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-20 bg-white/10" />
                <Skeleton className="h-8 w-40 bg-white/10" />
                <Skeleton className="h-2 w-full bg-white/10 rounded-full mt-4" />
              </div>
            ) : subscription ? (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Current Plan</p>
                    <h2 className="text-2xl font-bold text-white tracking-tight capitalize">{subscription.tier} Plan</h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">
                      {subscription.is_trialing ? 'Trial' : subscription.subscribed ? 'Active' : 'Inactive'}
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

                  {subscription.subscription_end && (
                    <p className="text-xs text-gray-500 mt-2">
                      Next billing date: <span className="text-gray-300">{format(new Date(subscription.subscription_end), 'MMM d, yyyy')}</span>
                    </p>
                  )}
                </div>

                <div className="mt-2 pt-4 border-t border-white/5 flex gap-3">
                  <Button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="flex-1 h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-[#102212] text-sm font-bold transition-all active:scale-[0.98]"
                  >
                    {portalLoading ? 'Opening...' : 'Manage Subscription'}
                  </Button>
                  {subscription.tier !== 'founder' && (
                    <Button
                      onClick={handleManageSubscription} // Generally Stripe Portal handles upgrades
                      variant="outline"
                      className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-all active:scale-[0.98]"
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-white font-medium mb-2">No active subscription</p>
                <Button onClick={handleManageSubscription} className="bg-primary text-[#102212]">
                  Subscribe Now
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Payment Methods Snippet (Static Visual for now, functionality via Stripe Portal) */}
        <section className="flex items-center justify-between p-4 rounded-xl bg-[#1c2e1f] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Payment Methods</p>
              <p className="text-gray-500 text-xs">Manage cards & billing info</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 hover:bg-white/5"
            onClick={handleManageSubscription}
          >
            Edit
          </Button>
        </section>

        {/* Invoice History */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-white tracking-tight">Invoice History</h3>
          </div>

          <div className="flex flex-col gap-3">
            {invoicesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#1c2e1f] border border-transparent">
                  <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
                  <div className="flex-1 ml-4 space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/5" />
                    <Skeleton className="h-3 w-16 bg-white/5" />
                  </div>
                </div>
              ))
            ) : invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="group flex items-center justify-between p-4 rounded-xl bg-[#1c2e1f] border border-transparent hover:border-primary/20 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-black/30 border border-white/5 text-xs font-medium text-gray-400">
                      <span className="font-bold text-white">{format(new Date(invoice.created_at), 'd')}</span>
                      <span className="text-[10px] uppercase">{format(new Date(invoice.created_at), 'MMM')}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white text-sm font-semibold">
                        {invoice.invoice_number || `Invoice #${invoice.stripe_invoice_id?.slice(-4)}`}
                      </p>
                      <p className="text-gray-500 text-xs">{formatAmount(invoice.amount_cents, invoice.currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block">
                      {getStatusBadge(invoice.status)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-amber-400 hover:bg-amber-400/10 hover:text-amber-300 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (invoice.pdf_url) window.open(invoice.pdf_url, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex flex-col items-center text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="relative group mb-8">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-b from-primary/10 to-[#102212] border border-primary/20 shadow-[0_0_30px_-5px_rgba(17,212,33,0.15)]">
                    <span className="text-primary text-[40px] font-light">$</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No Invoices Yet</h2>
                <p className="text-sm leading-relaxed text-neutral-400 max-w-[280px]">
                  Your first invoice will appear here once your membership cycle begins.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </>
  );
}
