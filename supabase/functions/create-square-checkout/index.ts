import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { squareRequest, getSquareLocationId, TIER_PRICING } from '../_shared/square.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-SQUARE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { tier, billing_period, trial = false } = await req.json();
    logStep("Request params", { tier, billing_period, trial });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Determine pricing
    const tierKey = tier === "member" ? "insider" : tier === "fellow" ? "patron" : null;
    if (!tierKey) throw new Error("Invalid tier specified");

    const pricing = TIER_PRICING[tierKey];
    const isAnnual = billing_period === "annual";
    const amountCents = isAnnual ? pricing.annual : pricing.monthly;
    const tierDisplayName = tierKey === "insider" ? "Insider" : "Patron";
    const periodLabel = isAnnual ? "Annual" : "Monthly";

    // Check for existing trial
    if (trial) {
      const { data: existingTrial } = await supabaseAdmin
        .from("membership_trials")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingTrial) {
        logStep("User already had a trial, proceeding without trial");
      } else {
        // Record trial intent
        await supabaseAdmin
          .from("membership_trials")
          .insert({ user_id: user.id, tier });
        logStep("Trial intent recorded");
      }
    }

    const origin = req.headers.get("origin") || "https://makefriendsandsocialize.com";
    const idempotencyKey = crypto.randomUUID();

    // Create Square payment link using quick_pay for simplicity
    const data = await squareRequest("/online-checkout/payment-links", {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        quick_pay: {
          name: `${tierDisplayName} Membership — ${periodLabel}`,
          price_money: {
            amount: amountCents,
            currency: "USD",
          },
          location_id: getSquareLocationId(),
        },
        checkout_options: {
          redirect_url: `${origin}/membership?success=true`,
          ask_for_shipping_address: false,
        },
        pre_populated_data: {
          buyer_email: user.email,
        },
        payment_note: JSON.stringify({
          user_id: user.id,
          tier,
          billing_period,
          trial,
        }),
      }),
    });

    const checkoutUrl = data.payment_link?.url || data.payment_link?.long_url;
    logStep("Payment link created", { linkId: data.payment_link?.id });

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
