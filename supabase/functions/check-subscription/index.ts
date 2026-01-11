import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs mapping to tiers
const PRICE_TO_TIER: Record<string, string> = {
  "price_1SoDkp00I3YCY0DeDrniU1d6": "member", // Member Monthly
  "price_1SoDl700I3YCY0DezLxSxVBL": "member", // Member Annual
  "price_1SoDli00I3YCY0DeVOlNtHl7": "fellow", // Fellow Monthly
  "price_1SoDlv00I3YCY0De33VrYzjX": "fellow", // Fellow Annual
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(
        JSON.stringify({ 
          subscribed: false, 
          tier: "explorer",
          available_reveals: await getAvailableReveals(user.id, supabaseClient),
          has_trial: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    // Also check for trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });

    const allSubs = [...subscriptions.data, ...trialingSubscriptions.data];
    const hasActiveSub = allSubs.length > 0;

    let tier = "explorer";
    let subscriptionEnd = null;
    let isTrialing = false;
    let trialEndsAt = null;

    if (hasActiveSub) {
      const subscription = allSubs[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const priceId = subscription.items.data[0]?.price?.id;
      tier = PRICE_TO_TIER[priceId] || "explorer";
      isTrialing = subscription.status === "trialing";
      
      if (isTrialing && subscription.trial_end) {
        trialEndsAt = new Date(subscription.trial_end * 1000).toISOString();
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        tier, 
        isTrialing,
        endDate: subscriptionEnd 
      });
    }

    // Get available reveal credits
    const availableReveals = await getAvailableReveals(user.id, supabaseClient);

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        tier,
        subscription_end: subscriptionEnd,
        is_trialing: isTrialing,
        trial_ends_at: trialEndsAt,
        available_reveals: availableReveals,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function getAvailableReveals(userId: string, supabase: any): Promise<number> {
  const { data, error } = await supabase
    .from("match_reveal_purchases")
    .select("reveals_total, reveals_used")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString());

  if (error || !data) return 0;

  return data.reduce((sum: number, p: any) => sum + (p.reveals_total - p.reveals_used), 0);
}
