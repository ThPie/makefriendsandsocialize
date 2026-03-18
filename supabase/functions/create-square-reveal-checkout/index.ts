import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { squareRequest, getSquareLocationId, REVEAL_PRICE_CENTS } from '../_shared/square.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-SQUARE-REVEAL-CHECKOUT] ${step}${detailsStr}`);
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

  try {
    logStep("Function started");

    const { pack_type, match_id } = await req.json();
    logStep("Request params", { pack_type, match_id });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    if (pack_type !== "single") {
      throw new Error("Invalid pack type. Only 'single' reveal purchase is available.");
    }

    const origin = req.headers.get("origin") || "https://makefriendsandsocialize.com";
    const idempotencyKey = crypto.randomUUID();

    const successUrl = match_id
      ? `${origin}/portal/slow-dating/match/${match_id}?reveal_success=true`
      : `${origin}/portal/slow-dating?reveal_success=true`;
    const cancelUrl = match_id
      ? `${origin}/portal/slow-dating/match/${match_id}?reveal_cancelled=true`
      : `${origin}/portal/slow-dating?reveal_cancelled=true`;

    const data = await squareRequest("/online-checkout/payment-links", {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        quick_pay: {
          name: "Connection Reveal",
          price_money: {
            amount: REVEAL_PRICE_CENTS,
            currency: "USD",
          },
          location_id: getSquareLocationId(),
        },
        checkout_options: {
          redirect_url: successUrl,
          ask_for_shipping_address: false,
        },
        pre_populated_data: {
          buyer_email: user.email,
        },
        payment_note: JSON.stringify({
          user_id: user.id,
          pack_type,
          match_id: match_id || "",
          type: "reveal",
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
