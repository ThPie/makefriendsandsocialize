import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { squareRequest, getSquareLocationId, TIER_PRICING } from '../_shared/square.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SQUARE-CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const { source_id, tier, billing_period, trial = false } = await req.json();
    logStep("Request params", { tier, billing_period, trial, hasSourceId: !!source_id });

    if (!source_id) throw new Error("Payment source (card token) is required");

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
    const dbTier = tierKey === "insider" ? "fellow" : "founder";

    // Step 1: Find or create Square customer
    let customerId: string | null = null;

    // Check if user already has a Square customer ID
    const { data: existingMembership } = await supabaseAdmin
      .from("memberships")
      .select("square_customer_id")
      .eq("user_id", user.id)
      .not("square_customer_id", "is", null)
      .limit(1)
      .single();

    if (existingMembership?.square_customer_id) {
      customerId = existingMembership.square_customer_id;
      logStep("Found existing Square customer", { customerId });
    } else {
      // Search Square for existing customer by email
      try {
        const searchResult = await squareRequest("/customers/search", {
          method: "POST",
          body: JSON.stringify({
            query: {
              filter: {
                email_address: { exact: user.email },
              },
            },
          }),
        });
        if (searchResult.customers?.length > 0) {
          customerId = searchResult.customers[0].id;
          logStep("Found Square customer by email", { customerId });
        }
      } catch (e) {
        logStep("Customer search failed, will create new", { error: String(e) });
      }
    }

    if (!customerId) {
      // Create new customer
      const profile = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      const customerData = await squareRequest("/customers", {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          email_address: user.email,
          given_name: profile.data?.first_name || undefined,
          family_name: profile.data?.last_name || undefined,
          reference_id: user.id,
        }),
      });
      customerId = customerData.customer.id;
      logStep("Created Square customer", { customerId });
    }

    // Step 2: Save the card on file
    const cardResult = await squareRequest(`/customers/${customerId}/cards`, {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        card_nonce: source_id,
      }),
    });
    const cardId = cardResult.card?.id;
    logStep("Card saved on file", { cardId });

    // Step 3: Create a payment for the first period
    const paymentResult = await squareRequest("/payments", {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        source_id: cardId || source_id,
        amount_money: {
          amount: trial ? 0 : amountCents,
          currency: "USD",
        },
        autocomplete: true,
        location_id: getSquareLocationId(),
        customer_id: customerId,
        note: `${tierDisplayName} Membership — ${periodLabel}`,
        reference_id: user.id,
      }),
    });
    logStep("Payment created", { paymentId: paymentResult.payment?.id });

    // Step 4: Upsert membership in DB
    const now = new Date();
    const expiresAt = new Date(now);
    if (isAnnual) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // If trial, set trial end date
    if (trial) {
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 14);

      await supabaseAdmin.from("membership_trials").upsert({
        user_id: user.id,
        tier: tier,
        ends_at: trialEnd.toISOString(),
      }, { onConflict: "user_id" });
      logStep("Trial recorded", { trialEnd: trialEnd.toISOString() });
    }

    const { error: membershipError } = await supabaseAdmin
      .from("memberships")
      .upsert({
        user_id: user.id,
        tier: dbTier,
        status: "active",
        square_customer_id: customerId,
        square_subscription_id: paymentResult.payment?.id || null,
        square_payment_id: paymentResult.payment?.id || null,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }, { onConflict: "user_id" });

    if (membershipError) {
      logStep("Membership upsert error", { error: membershipError.message });
      throw new Error("Failed to update membership record");
    }

    logStep("Membership activated", { tier: dbTier, expiresAt: expiresAt.toISOString() });

    return new Response(JSON.stringify({
      success: true,
      tier: dbTier,
      payment_id: paymentResult.payment?.id,
    }), {
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
