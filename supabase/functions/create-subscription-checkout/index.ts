import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs mapping
const PRICE_IDS = {
  MEMBER_MONTHLY: "price_1SoDkp00I3YCY0DeDrniU1d6",
  MEMBER_ANNUAL: "price_1SoDl700I3YCY0DezLxSxVBL",
  FELLOW_MONTHLY: "price_1SoDli00I3YCY0DeVOlNtHl7",
  FELLOW_ANNUAL: "price_1SoDlv00I3YCY0De33VrYzjX",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Get request body
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

    // Determine price ID
    let priceId: string;
    if (tier === "member") {
      priceId = billing_period === "annual" ? PRICE_IDS.MEMBER_ANNUAL : PRICE_IDS.MEMBER_MONTHLY;
    } else if (tier === "fellow") {
      priceId = billing_period === "annual" ? PRICE_IDS.FELLOW_ANNUAL : PRICE_IDS.FELLOW_MONTHLY;
    } else {
      throw new Error("Invalid tier specified");
    }
    logStep("Selected price", { priceId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/membership?success=true`,
      cancel_url: `${origin}/membership?cancelled=true`,
      metadata: {
        user_id: user.id,
        tier,
        billing_period,
      },
    };

    // Add trial if requested and user hasn't had a trial before
    if (trial) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data: existingTrial } = await supabaseAdmin
        .from("membership_trials")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!existingTrial) {
        sessionConfig.subscription_data = {
          trial_period_days: 7,
        };
        logStep("Adding 7-day trial");
        
        // Record trial start
        await supabaseAdmin
          .from("membership_trials")
          .insert({
            user_id: user.id,
            tier: tier,
          });
      } else {
        logStep("User already had a trial, skipping");
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
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
