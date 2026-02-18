import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Download, Mail, CreditCard, Share2, Building2 } from 'lucide-react';

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

interface InvoiceDetailModalProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
}

export function InvoiceDetailModal({ invoice, isOpen, onClose }: InvoiceDetailModalProps) {
    if (!invoice) return null;

    const formatAmount = (cents: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(cents / 100);
    };

    const taxAmount = invoice.amount_cents * 0.08; // Mock tax calculation for display
    const subtotal = invoice.amount_cents - taxAmount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-[#221f10] border-amber-500/10 p-0 overflow-hidden text-[#d4d1c1]">
                {/* Header */}
                <div className="bg-[#f8f8f6] dark:bg-[#221f10]/95 backdrop-blur-md border-b border-amber-500/10 px-4 py-3 flex items-center justify-between">
                    <DialogTitle className="text-lg font-bold tracking-tight text-white">Invoice Detail</DialogTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 rounded-full">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Branding & Summary */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-[#2a2718] flex items-center justify-center ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/5">
                            <Building2 className="h-8 w-8 text-amber-500" />
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold font-serif text-white">MakeFriends & Socialize</h2>
                            <div className="flex items-center justify-center gap-2">
                                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-amber-500/30">
                                    {invoice.status}
                                </Badge>
                                <span className="text-[#d4d1c1] text-sm">
                                    {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Card */}
                    <div className="bg-[#2a2718] rounded-xl p-5 border border-amber-500/10 shadow-sm">
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <p className="text-[#d4d1c1] text-xs uppercase tracking-wide mb-1 opacity-70">Invoice No.</p>
                                <p className="font-medium text-white">{invoice.invoice_number || invoice.stripe_invoice_id?.slice(0, 8)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#d4d1c1] text-xs uppercase tracking-wide mb-1 opacity-70">Billed To</p>
                                <p className="font-medium text-white">Valued Member</p>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center mt-2">
                                <p className="text-[#d4d1c1] text-xs uppercase tracking-wide opacity-70">Method</p>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-[#d4d1c1]" />
                                    <span className="font-medium text-sm text-white">Card ending ••••</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold px-1 text-white">Breakdown</h3>
                        <div className="bg-[#2a2718] rounded-xl overflow-hidden border border-amber-500/10">
                            <div className="flex justify-between items-center p-4 border-b border-white/5">
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">Membership Fee</span>
                                    <span className="text-xs text-[#d4d1c1]">Period: {format(new Date(), 'yyyy')}</span>
                                </div>
                                <span className="font-medium text-white">{formatAmount(invoice.amount_cents, invoice.currency)}</span>
                            </div>
                            {/* Mock Tax Line */}
                            {/* 
                    <div className="flex justify-between items-center p-4 border-b border-white/5">
                        <div className="flex flex-col">
                            <span className="font-medium text-white">Processing & Tax</span>
                            <span className="text-xs text-[#d4d1c1]">VAT included</span>
                        </div>
                        <span className="font-medium text-white">{formatAmount(0, invoice.currency)}</span>
                    </div>
                    */}
                            <div className="flex justify-between items-center p-4 bg-amber-500/5">
                                <span className="font-bold text-lg text-amber-500">Total</span>
                                <span className="font-bold text-xl text-amber-500">{formatAmount(invoice.amount_cents, invoice.currency)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center px-4">
                        <p className="text-xs text-[#d4d1c1] leading-relaxed opacity-70">
                            Thank you for your continued support. If you have any questions regarding this invoice, please contact support.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-[#221f10] border-t border-amber-500/10 p-6 backdrop-blur-xl">
                    <div className="flex flex-col gap-3">
                        {invoice.pdf_url ? (
                            <Button
                                className="w-full bg-amber-500 hover:bg-amber-600 text-[#221f10] font-bold h-12 rounded-lg"
                                asChild
                            >
                                <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </a>
                            </Button>
                        ) : (
                            <Button
                                className="w-full bg-amber-500 hover:bg-amber-600 text-[#221f10] font-bold h-12 rounded-lg"
                                onClick={() => window.print()}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Print Invoice
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/5 font-bold h-12 rounded-lg"
                            onClick={() => {
                                window.location.href = `mailto:?subject=Invoice ${invoice.invoice_number}&body=Here is the invoice detail.`
                            }}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Email Receipt
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
