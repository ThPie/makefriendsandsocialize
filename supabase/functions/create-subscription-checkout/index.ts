import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 100 requests per 15 minutes per IP
const MAX_REQUESTS = 100;
const WINDOW_MINUTES = 15;

// Price IDs mapping - Updated January 2026
const PRICE_IDS = {
  MEMBER_MONTHLY: "price_1Ssn8f00I3YCY0DeeE6nnMri",   // $49/month
  MEMBER_ANNUAL: "price_1Ssn9f00I3YCY0DeLZZloqCJ",    // $399/year
  FELLOW_MONTHLY: "price_1Ssn9u00I3YCY0DeF6IQ05fB",   // $79/month
  FELLOW_ANNUAL: "price_1SsnAL00I3YCY0Def32T8PTg",    // $699/year
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
};

/**
 * Check rate limit for the given IP and endpoint
 */
async function checkRateLimit(supabase: any, ipAddress: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetAt: string | null }> {
  try {
    const { data, error } = await supabase.rpc('check_api_rate_limit', {
      _ip_address: ipAddress,
      _endpoint: endpoint,
      _max_requests: MAX_REQUESTS,
      _window_minutes: WINDOW_MINUTES
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: MAX_REQUESTS, resetAt: null };
    }

    const status = data?.[0] || { allowed: true, remaining_requests: MAX_REQUESTS, reset_at: null };
    return { 
      allowed: status.allowed, 
      remaining: status.remaining_requests, 
      resetAt: status.reset_at 
    };
  } catch (err) {
    console.error('Rate limit check failed:', err);
    return { allowed: true, remaining: MAX_REQUESTS, resetAt: null };
  }
}

/**
 * Increment rate limit counter
 */
async function incrementRateLimit(supabase: any, ipAddress: string, endpoint: string): Promise<void> {
  try {
    await supabase.rpc('increment_api_rate_limit', {
      _ip_address: ipAddress,
      _endpoint: endpoint
    });
  } catch (err) {
    console.error('Rate limit increment failed:', err);
  }
}

serve(async (req) => {
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

    // Get IP address for rate limiting
    const ipAddress = 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const rateLimit = await checkRateLimit(supabaseAdmin, ipAddress, 'create-subscription-checkout');
    
    if (!rateLimit.allowed) {
      logStep("Rate limit exceeded", { ip: ipAddress });
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          resetAt: rateLimit.resetAt
        }), 
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "900"
          },
        }
      );
    }

    // Increment rate limit counter
    await incrementRateLimit(supabaseAdmin, ipAddress, 'create-subscription-checkout');

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
      const { data: existingTrial } = await supabaseAdmin
        .from("membership_trials")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!existingTrial) {
        sessionConfig.subscription_data = {
          trial_period_days: 30,
        };
        logStep("Adding 30-day trial");
        
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
