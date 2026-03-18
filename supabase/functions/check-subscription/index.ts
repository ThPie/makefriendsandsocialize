import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from '../_shared/cors.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    // DB-first approach — no external API calls needed
    const { data: membership, error: memError } = await supabaseClient
      .from("memberships")
      .select("tier, status, expires_at, started_at")
      .eq("user_id", user.id)
      .single();

    const isActive = membership?.status === "active" && 
      (!membership.expires_at || new Date(membership.expires_at) > new Date());
    const tier = isActive ? (membership?.tier || "patron") : "patron";

    // Check for active trial
    const { data: trial } = await supabaseClient
      .from("membership_trials")
      .select("ends_at, converted_at")
      .eq("user_id", user.id)
      .is("converted_at", null)
      .gt("ends_at", new Date().toISOString())
      .single();

    const isTrialing = !!trial;
    const trialEndsAt = trial?.ends_at || null;

    // Get available reveal credits
    const { data: reveals } = await supabaseClient
      .from("match_reveal_purchases")
      .select("reveals_total, reveals_used")
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString());

    const availableReveals = (reveals || []).reduce(
      (sum: number, p: any) => sum + (p.reveals_total - p.reveals_used), 0
    );

    logStep("Subscription checked", { tier, isActive, isTrialing, availableReveals });

    return new Response(
      JSON.stringify({
        subscribed: isActive || isTrialing,
        tier,
        subscription_end: membership?.expires_at || null,
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
