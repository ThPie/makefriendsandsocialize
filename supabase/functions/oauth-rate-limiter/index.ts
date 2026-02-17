import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { getCorsHeaders } from '../_shared/cors.ts';



serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP from headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    const { action, isFailure } = await req.json();

    if (action === "check") {
      // Check rate limit without incrementing
      const { data, error } = await supabase.rpc("check_oauth_rate_limit", {
        _ip_address: clientIp,
      });

      if (error) {
        console.error("Error checking OAuth rate limit:", error);
        return new Response(
          JSON.stringify({ allowed: true, remaining: 10, requiresCaptcha: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = data?.[0] || { allowed: true, remaining_attempts: 10, requires_captcha: false, reset_at: null };

      return new Response(
        JSON.stringify({
          allowed: result.allowed,
          remaining: result.remaining_attempts,
          requiresCaptcha: result.requires_captcha,
          resetAt: result.reset_at,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "increment") {
      // Increment the attempt counter
      const { error } = await supabase.rpc("increment_oauth_attempt", {
        _ip_address: clientIp,
        _is_failure: isFailure || false,
      });

      if (error) {
        console.error("Error incrementing OAuth attempt:", error);
      }

      // Check the updated limit
      const { data: checkData } = await supabase.rpc("check_oauth_rate_limit", {
        _ip_address: clientIp,
      });

      const result = checkData?.[0] || { allowed: true, remaining_attempts: 9, requires_captcha: false, reset_at: null };

      return new Response(
        JSON.stringify({
          allowed: result.allowed,
          remaining: result.remaining_attempts,
          requiresCaptcha: result.requires_captcha,
          resetAt: result.reset_at,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "cleanup") {
      const { data, error } = await supabase.rpc("cleanup_old_oauth_rate_limits");
      
      return new Response(
        JSON.stringify({ deleted: data || 0, error: error?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'check', 'increment', or 'cleanup'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OAuth rate limiter error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, allowed: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
