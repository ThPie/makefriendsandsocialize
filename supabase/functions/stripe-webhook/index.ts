import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

// Price IDs mapping
const PRICE_IDS = {
  MEMBER_MONTHLY: "price_1SoDkp00I3YCY0DeDrniU1d6",
  MEMBER_ANNUAL: "price_1SoDl700I3YCY0DezLxSxVBL",
  FELLOW_MONTHLY: "price_1SoDli00I3YCY0DeVOlNtHl7",
  FELLOW_ANNUAL: "price_1SoDlv00I3YCY0De33VrYzjX",
  SINGLE_REVEAL: "price_1SoDmA00I3YCY0De2l1K4gAA",
  PACK_3_REVEAL: "price_1SoDmP00I3YCY0De8ZVDSdOu",
};

// Sanitize sensitive data before logging
function sanitizeForLogs(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['email', 'customer_email', 'payment_method', 'card', 'bank_account', 'name', 'address'];
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogs(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Safe logging function - only logs IDs and types, not sensitive data
const logStep = (step: string, details?: { type?: string; id?: string; status?: string; error?: string }) => {
  const safeDetails = details ? sanitizeForLogs(details as Record<string, unknown>) : undefined;
  const detailsStr = safeDetails ? ` - ${JSON.stringify(safeDetails)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature) {
    logStep("Missing Stripe signature");
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.text();

  try {
    // If webhook secret is set, verify the signature
    if (webhookSecret) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      // For development, parse without verification
      event = JSON.parse(body) as Stripe.Event;
      logStep("Warning: No webhook secret configured, skipping signature verification");
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("Webhook signature verification failed", { error: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Only log event type and ID, never the full payload
  logStep("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling event", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logStep("Processing checkout.session.completed", { id: session.id });

  const customerEmail = session.customer_email || session.customer_details?.email;
  if (!customerEmail) {
    logStep("No customer email found in session");
    return;
  }

  // Find user by email (email is not logged)
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  if (userError) {
    logStep("Error fetching users", { error: userError.message });
    return;
  }

  const user = userData.users.find(u => u.email === customerEmail);
  if (!user) {
    logStep("User not found");
    return;
  }

  // Handle one-time payment for match reveals
  if (session.mode === "payment") {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    if (priceId === PRICE_IDS.SINGLE_REVEAL) {
      await createRevealPurchase(user.id, "single", 1, session.id);
      logStep("Created single reveal purchase");
    } else if (priceId === PRICE_IDS.PACK_3_REVEAL) {
      await createRevealPurchase(user.id, "pack_3", 3, session.id);
      logStep("Created 3-pack reveal purchase");
    }
    return;
  }

  // Handle subscription
  if (session.mode === "subscription" && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionChange(subscription);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  logStep("Processing subscription change", { 
    id: subscription.id, 
    status: subscription.status 
  });

  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const customerEmail = customer.email;

  if (!customerEmail) {
    logStep("No customer email found");
    return;
  }

  // Find user by email
  const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
  const user = userData?.users.find(u => u.email === customerEmail);

  if (!user) {
    logStep("User not found");
    return;
  }

  // Determine tier based on price
  const priceId = subscription.items.data[0]?.price?.id;
  let tier: "patron" | "fellow" | "founder" = "patron";
  
  if (priceId === PRICE_IDS.MEMBER_MONTHLY || priceId === PRICE_IDS.MEMBER_ANNUAL) {
    tier = "fellow"; // DB tier 'fellow' = UI tier 'Member'
  } else if (priceId === PRICE_IDS.FELLOW_MONTHLY || priceId === PRICE_IDS.FELLOW_ANNUAL) {
    tier = "founder"; // DB tier 'founder' = UI tier 'Fellow'
  }

  // Update or create membership
  const membershipStatus = subscription.status === "active" ? "active" : 
                           subscription.status === "trialing" ? "active" : "pending";

  const { error: upsertError } = await supabaseAdmin
    .from("memberships")
    .update({
      tier,
      status: membershipStatus,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      started_at: new Date(subscription.start_date * 1000).toISOString(),
      expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (upsertError) {
    logStep("Error updating membership", { error: upsertError.message });
    return;
  }

  // If user was on trial, mark trial as converted
  if (subscription.status === "active") {
    await supabaseAdmin
      .from("membership_trials")
      .update({ converted_at: new Date().toISOString(), stripe_subscription_id: subscription.id })
      .eq("user_id", user.id);
  }

  logStep("Membership updated successfully", { status: membershipStatus });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logStep("Processing subscription deletion", { id: subscription.id });

  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const customerEmail = customer.email;

  if (!customerEmail) {
    logStep("No customer email found");
    return;
  }

  // Find user by email
  const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
  const user = userData?.users.find(u => u.email === customerEmail);

  if (!user) {
    logStep("User not found");
    return;
  }

  // Downgrade to free tier
  const { error } = await supabaseAdmin
    .from("memberships")
    .update({
      tier: "patron",
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    logStep("Error downgrading membership", { error: error.message });
    return;
  }

  logStep("Membership cancelled, downgraded to free tier");
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  logStep("Payment succeeded", { id: invoice.id });
  // Additional logic like sending confirmation emails could go here
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  logStep("Payment failed", { id: invoice.id });
  // Notify user about payment failure, could queue a notification
}

async function createRevealPurchase(
  userId: string, 
  purchaseType: "single" | "pack_3", 
  revealsTotal: number,
  sessionId: string
) {
  const { error } = await supabaseAdmin
    .from("match_reveal_purchases")
    .insert({
      user_id: userId,
      purchase_type: purchaseType,
      reveals_total: revealsTotal,
      reveals_used: 0,
      stripe_session_id: sessionId,
    });

  if (error) {
    logStep("Error creating reveal purchase", { error: error.message });
    throw error;
  }
}
