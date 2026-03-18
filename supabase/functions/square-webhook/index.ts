import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SQUARE-WEBHOOK] ${step}${detailsStr}`);
};

/**
 * Find user by email using paginated auth lookup
 */
async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  let page = 1;
  const perPage = 50;

  while (true) {
    const { data: pageData, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error || !pageData?.users?.length) return null;

    const found = pageData.users.find((u: any) => u.email === email);
    if (found) return { id: found.id, email: found.email! };

    if (pageData.users.length < perPage) return null;
    page++;
  }
}

serve(async (req) => {
  // Square webhooks are POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const eventType = body.type;
    const eventData = body.data?.object;

    logStep("Event received", { type: eventType, id: body.event_id });

    switch (eventType) {
      case "payment.completed": {
        await handlePaymentCompleted(eventData);
        break;
      }

      case "payment.updated": {
        await handlePaymentUpdated(eventData);
        break;
      }

      case "subscription.created":
      case "subscription.updated": {
        await handleSubscriptionChange(eventData);
        break;
      }

      case "subscription.stopped": {
        await handleSubscriptionStopped(eventData);
        break;
      }

      default:
        logStep("Unhandled event type", { type: eventType });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling event", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});

async function handlePaymentCompleted(payment: any) {
  logStep("Processing payment.completed", { id: payment?.payment?.id });

  const paymentObj = payment?.payment;
  if (!paymentObj) return;

  const note = paymentObj.note;
  if (!note) {
    logStep("No payment note metadata found");
    return;
  }

  let metadata: any;
  try {
    metadata = JSON.parse(note);
  } catch {
    logStep("Could not parse payment note as JSON");
    return;
  }

  const userId = metadata.user_id;
  if (!userId) {
    logStep("No user_id in payment metadata");
    return;
  }

  // Handle reveal purchase
  if (metadata.type === "reveal") {
    await createRevealPurchase(userId, "single", 1, paymentObj.id, paymentObj.order_id);
    logStep("Created single reveal purchase");
    return;
  }

  // Handle membership payment
  const { tier, billing_period, trial } = metadata;
  if (tier && billing_period) {
    const dbTier = tier === "member" ? "fellow" : tier === "fellow" ? "founder" : "patron";
    const customerId = paymentObj.customer_id;

    // Calculate expiration based on billing period
    const now = new Date();
    const expiresAt = new Date(now);
    if (billing_period === "annual") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // If trial, add 30 days before billing starts
    if (trial) {
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    const { error: upsertError } = await supabaseAdmin
      .from("memberships")
      .upsert({
        user_id: userId,
        tier: dbTier,
        status: "active",
        square_customer_id: customerId || null,
        square_subscription_id: paymentObj.order_id || null,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: "user_id" });

    if (upsertError) {
      logStep("Error upserting membership", { error: upsertError.message });
    } else {
      logStep("Membership activated", { tier: dbTier, userId });
    }

    // If trial, mark trial as converted
    if (!trial) {
      await supabaseAdmin
        .from("membership_trials")
        .update({ converted_at: now.toISOString() })
        .eq("user_id", userId);
    }
  }
}

async function handlePaymentUpdated(payment: any) {
  logStep("Processing payment.updated", { id: payment?.payment?.id });
  // Handle payment failures etc.
  const paymentObj = payment?.payment;
  if (paymentObj?.status === "FAILED") {
    logStep("Payment failed", { id: paymentObj.id });
    // Could trigger dunning flow here
  }
}

async function handleSubscriptionChange(subscription: any) {
  logStep("Processing subscription change", { id: subscription?.subscription?.id });
  // Square subscriptions are managed via Catalog + Subscriptions API
  // For now, membership status is managed via payment.completed events
}

async function handleSubscriptionStopped(subscription: any) {
  logStep("Processing subscription stopped", { id: subscription?.subscription?.id });

  const sub = subscription?.subscription;
  if (!sub?.customer_id) return;

  // Find user by square_customer_id
  const { data: membership } = await supabaseAdmin
    .from("memberships")
    .select("user_id")
    .eq("square_customer_id", sub.customer_id)
    .single();

  if (membership?.user_id) {
    await supabaseAdmin
      .from("memberships")
      .update({
        tier: "patron",
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", membership.user_id);

    logStep("Membership cancelled, downgraded to free tier");
  }
}

async function createRevealPurchase(
  userId: string,
  purchaseType: string,
  revealsTotal: number,
  squarePaymentId: string,
  squareOrderId?: string
) {
  const { error } = await supabaseAdmin
    .from("match_reveal_purchases")
    .insert({
      user_id: userId,
      purchase_type: purchaseType,
      reveals_total: revealsTotal,
      reveals_used: 0,
      square_payment_id: squarePaymentId,
      square_order_id: squareOrderId || null,
    });

  if (error) {
    logStep("Error creating reveal purchase", { error: error.message });
    throw error;
  }
}
