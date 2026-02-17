import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from '../_shared/cors.ts';



// Input validation schema
const RequestSchema = z.object({
  match_id: z.string().uuid("match_id must be a valid UUID"),
});

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REVEAL-MATCH] ${step}${detailsStr}`);
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

    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      logStep("Validation failed", { errors: errorMessage });
      return new Response(
        JSON.stringify({ error: `Invalid input: ${errorMessage}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { match_id } = parseResult.data;
    logStep("Match ID validated", { match_id });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      return new Response(
        JSON.stringify({ error: `Authentication error: ${userError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const user = userData.user;
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    logStep("User authenticated", { userId: user.id });

    // Check if already revealed
    const { data: existingReveal } = await supabaseAdmin
      .from("match_reveals")
      .select("id")
      .eq("user_id", user.id)
      .eq("match_id", match_id)
      .single();

    if (existingReveal) {
      logStep("Match already revealed");
      return new Response(
        JSON.stringify({ success: true, already_revealed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if user has paid membership (fellow or founder tier)
    const { data: membership } = await supabaseAdmin
      .from("memberships")
      .select("tier, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    const hasPaidMembership = membership && 
      (membership.tier === "fellow" || membership.tier === "founder");

    // Check for active trial
    const { data: trial } = await supabaseAdmin
      .from("membership_trials")
      .select("id, ends_at")
      .eq("user_id", user.id)
      .is("converted_at", null)
      .gt("ends_at", new Date().toISOString())
      .single();

    const hasActiveTrial = !!trial;

    if (hasPaidMembership || hasActiveTrial) {
      // User has membership or trial - reveal for free
      const { error: insertError } = await supabaseAdmin
        .from("match_reveals")
        .insert({
          user_id: user.id,
          match_id,
          revealed_via: "membership",
        });

      if (insertError) throw insertError;

      logStep("Match revealed via membership", { hasPaidMembership, hasActiveTrial });
      return new Response(
        JSON.stringify({ success: true, revealed_via: "membership" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check for available reveal credits
    const { data: purchases } = await supabaseAdmin
      .from("match_reveal_purchases")
      .select("*")
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: true });

    // Find a purchase with remaining credits
    const availablePurchase = purchases?.find(p => p.reveals_used < p.reveals_total);

    if (!availablePurchase) {
      logStep("No reveal credits available");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "no_credits",
          message: "No reveal credits available. Purchase a reveal pack or upgrade to a membership."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
      );
    }

    // Use the credit
    const { error: updateError } = await supabaseAdmin
      .from("match_reveal_purchases")
      .update({ reveals_used: availablePurchase.reveals_used + 1 })
      .eq("id", availablePurchase.id);

    if (updateError) throw updateError;

    // Record the reveal
    const { error: insertError } = await supabaseAdmin
      .from("match_reveals")
      .insert({
        user_id: user.id,
        match_id,
        purchase_id: availablePurchase.id,
        revealed_via: "purchase",
      });

    if (insertError) throw insertError;

    // Calculate remaining credits
    const remainingCredits = (purchases || []).reduce((sum, p) => {
      if (p.id === availablePurchase.id) {
        return sum + (p.reveals_total - p.reveals_used - 1);
      }
      return sum + (p.reveals_total - p.reveals_used);
    }, 0);

    logStep("Match revealed via purchase", { purchaseId: availablePurchase.id, remainingCredits });

    return new Response(
      JSON.stringify({ 
        success: true, 
        revealed_via: "purchase",
        remaining_credits: remainingCredits,
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
