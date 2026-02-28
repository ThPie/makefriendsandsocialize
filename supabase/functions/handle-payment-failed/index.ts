import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildBrandedEmail, SITE_URL, SENDERS, p, infoBox, detailRow, alertBox } from '../_shared/email-layout.ts';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const DUNNING_SCHEDULE = [3, 5, 7];

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[HANDLE-PAYMENT-FAILED] ${step}${detailsStr}`);
};

const buildPaymentFailedEmail = (userName: string, amount: string, planName: string, retryDate: string, failureReason?: string) => {
  const reasonBlock = failureReason
    ? alertBox(p(`<strong>Reason:</strong> ${failureReason}`))
    : "";

  return buildBrandedEmail({
    preheader: "Action needed: Your payment couldn't be processed",
    heading: "Payment Update",
    subheading: "Action Required",
    body: `
      ${p(`Hi ${userName},`)}
      ${p(`We tried to charge your payment method for your <strong>${planName}</strong> subscription (${amount}), but the transaction was unsuccessful.`)}
      ${reasonBlock}
      ${p("<strong>What happens next?</strong>")}
      ${p(`We'll automatically retry this payment on <strong>${retryDate}</strong>. To avoid any interruption to your membership benefits, please update your payment information before then.`)}
      ${infoBox(p("💡 <strong>Tip:</strong> Make sure your card hasn't expired and that you have sufficient funds. You can also try a different payment method."))}
    `,
    ctaUrl: `${SITE_URL}/portal/membership`,
    ctaText: "Update Payment Method",
    ctaColor: "#dc3545",
    footerText: `If you believe this is an error, please contact us at billing@makefriendsandsocialize.com`,
  });
};

serve(async (req) => {
  const { invoice_id, is_scheduled_retry } = await req.json();

  try {
    logStep("Processing payment failure", { invoice_id, is_scheduled_retry });

    if (is_scheduled_retry) {
      await processScheduledRetry(invoice_id);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    const invoice = await stripe.invoices.retrieve(invoice_id);
    const customerId = invoice.customer as string;
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

    if (!customer.email) {
      logStep("No customer email found");
      return new Response(JSON.stringify({ error: "No customer email" }), { status: 400 });
    }

    const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
    const user = userData?.users.find(u => u.email === customer.email);

    if (!user) {
      logStep("User not found", { email: customer.email });
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("memberships")
      .select("id, failed_payment_count, dunning_status")
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      logStep("Membership not found", { userId: user.id });
      return new Response(JSON.stringify({ error: "Membership not found" }), { status: 404 });
    }

    const newFailCount = (membership.failed_payment_count || 0) + 1;
    let newDunningStatus = "retry_1";
    if (newFailCount === 2) newDunningStatus = "retry_2";
    else if (newFailCount === 3) newDunningStatus = "retry_3";
    else if (newFailCount > 3) newDunningStatus = "failed";

    await supabaseAdmin
      .from("memberships")
      .update({
        failed_payment_count: newFailCount,
        last_payment_error: invoice.last_finalization_error?.message || "Payment failed",
        last_payment_attempt_at: new Date().toISOString(),
        dunning_status: newDunningStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membership.id);

    await supabaseAdmin.from("invoice_history").upsert({
      user_id: user.id,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customerId,
      amount_cents: invoice.amount_due,
      currency: invoice.currency,
      status: "open",
      pdf_url: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_number: invoice.number,
      description: invoice.description || "Subscription payment",
      period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
      period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
    }, { onConflict: "stripe_invoice_id" });

    // Schedule retry
    let retryDateStr = "soon";
    if (newFailCount <= DUNNING_SCHEDULE.length) {
      const retryDays = DUNNING_SCHEDULE[newFailCount - 1];
      const retryDate = new Date();
      retryDate.setDate(retryDate.getDate() + retryDays);
      retryDateStr = retryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      await supabaseAdmin.from("dunning_retry_log").insert({
        user_id: user.id,
        membership_id: membership.id,
        stripe_invoice_id: invoice.id,
        retry_number: newFailCount,
        scheduled_at: retryDate.toISOString(),
        status: "pending",
      });
      logStep("Scheduled retry", { retryDate: retryDateStr, retryNumber: newFailCount });
    }

    // Send payment failed email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .single();

    const userName = profile?.first_name || "Member";
    const amountFormatted = `$${(invoice.amount_due / 100).toFixed(2)} ${(invoice.currency || "usd").toUpperCase()}`;
    const planName = invoice.lines?.data?.[0]?.description || "Membership";
    const failureReason = invoice.last_finalization_error?.message;

    try {
      await resend.emails.send({
        from: SENDERS.billing,
        to: [customer.email],
        subject: "⚠️ Action Needed: Payment Failed",
        html: buildPaymentFailedEmail(userName, amountFormatted, planName, retryDateStr, failureReason),
      });
      logStep("Payment failed email sent", { email: customer.email });
    } catch (emailError) {
      logStep("Failed to send payment failed email", { error: emailError });
    }

    logStep("Payment failure processed", { userId: user.id, failCount: newFailCount, dunningStatus: newDunningStatus });

    return new Response(JSON.stringify({ 
      success: true, 
      dunning_status: newDunningStatus,
      fail_count: newFailCount 
    }), { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error processing payment failure", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});

async function processScheduledRetry(invoiceId: string) {
  logStep("Processing scheduled retry", { invoiceId });

  try {
    const invoice = await stripe.invoices.pay(invoiceId);
    
    if (invoice.status === "paid") {
      logStep("Retry successful, invoice paid");

      await supabaseAdmin
        .from("dunning_retry_log")
        .update({ executed_at: new Date().toISOString(), status: "success" })
        .eq("stripe_invoice_id", invoiceId)
        .eq("status", "pending");

      const customerId = invoice.customer as string;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      
      if (customer.email) {
        const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === customer.email);
        
        if (user) {
          await supabaseAdmin
            .from("memberships")
            .update({
              failed_payment_count: 0,
              last_payment_error: null,
              dunning_status: "none",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        }
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Retry failed", { error: errorMessage });

    await supabaseAdmin
      .from("dunning_retry_log")
      .update({ executed_at: new Date().toISOString(), status: "failed", error_message: errorMessage })
      .eq("stripe_invoice_id", invoiceId)
      .eq("status", "pending");
  }
}
