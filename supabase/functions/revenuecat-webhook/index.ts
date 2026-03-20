import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-custom-authorization, content-type",
};

/**
 * RevenueCat Webhook Handler
 *
 * RevenueCat sends events here for subscription lifecycle changes.
 * We update the user's membership tier in the database accordingly.
 *
 * Webhook URL: https://<project>.supabase.co/functions/v1/revenuecat-webhook
 * Set REVENUECAT_WEBHOOK_SECRET in your secrets.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify webhook authenticity
    const authHeader = req.headers.get("authorization") || req.headers.get("x-custom-authorization");
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const event = body.event;

    if (!event) {
      return new Response(JSON.stringify({ error: "No event in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const appUserId = event.app_user_id;
    const eventType = event.type;
    const entitlements = event.entitlement_ids || [];

    console.log(`RevenueCat event: ${eventType} for user ${appUserId}`, {
      entitlements,
      product_id: event.product_id,
    });

    // Map entitlements to our tier system
    let newTier = "patron"; // default free tier
    if (entitlements.includes("patron_access")) {
      newTier = "founder";
    } else if (entitlements.includes("insider_access")) {
      newTier = "fellow";
    }

    // Events that grant/update access
    const grantEvents = [
      "INITIAL_PURCHASE",
      "RENEWAL",
      "PRODUCT_CHANGE",
      "UNCANCELLATION",
      "NON_RENEWING_PURCHASE",
    ];

    // Events that revoke access
    const revokeEvents = [
      "EXPIRATION",
      "CANCELLATION",
      "BILLING_ISSUE",
    ];

    if (grantEvents.includes(eventType)) {
      // Update membership to active with correct tier
      const { error } = await supabaseAdmin
        .from("memberships")
        .update({
          tier: newTier,
          status: "active",
          updated_at: new Date().toISOString(),
          square_subscription_id: `rc_${event.original_transaction_id || event.transaction_id}`,
        })
        .eq("user_id", appUserId);

      if (error) {
        console.error("Failed to update membership:", error);
      }
    } else if (revokeEvents.includes(eventType)) {
      // Downgrade to free tier
      const { error } = await supabaseAdmin
        .from("memberships")
        .update({
          tier: "patron",
          status: eventType === "BILLING_ISSUE" ? "past_due" : "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", appUserId);

      if (error) {
        console.error("Failed to downgrade membership:", error);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
