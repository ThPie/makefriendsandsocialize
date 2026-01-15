import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;
  message: string;
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const handler = async (req: Request): Promise<Response> => {
  console.log("[SEND-SMS] Function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AUTHENTICATION CHECK ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[SEND-SMS] Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.log("[SEND-SMS] Invalid token or user not found");
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === AUTHORIZATION CHECK - Only admins can send SMS ===
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      console.log("[SEND-SMS] User is not admin", { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Forbidden - admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === RATE LIMITING ===
    const { data: rateLimitData } = await supabaseAdmin.rpc("check_admin_rate_limit", {
      _admin_id: user.id,
      _endpoint: "send-sms",
      _max_requests: 50,
      _window_minutes: 60,
    });

    if (rateLimitData && !rateLimitData[0]?.allowed) {
      console.log("[SEND-SMS] Rate limit exceeded", { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded - please wait before sending more SMS" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseAdmin.rpc("increment_admin_rate_limit", {
      _admin_id: user.id,
      _endpoint: "send-sms",
    });

    // === TWILIO CONFIGURATION ===
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      console.error("[SEND-SMS] Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: "Twilio not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, message }: SMSRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' or 'message' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === PHONE NUMBER VALIDATION ===
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    if (!phoneRegex.test(to.replace(/[\s-]/g, ""))) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log sanitized info (no full phone number)
    console.log(`[SEND-SMS] Sending to ${to.substring(0, 6)}... by admin ${user.id}`);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[SEND-SMS] Twilio error (details redacted)");
      return new Response(
        JSON.stringify({ error: "Failed to send SMS" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === AUDIT LOG ===
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_user_id: user.id,
      action_type: "send_sms",
      resource_type: "sms",
      details: { recipient_masked: `${to.substring(0, 6)}...`, sid: result.sid },
    });

    console.log("[SEND-SMS] SMS sent successfully:", result.sid);

    return new Response(
      JSON.stringify({ success: true, sid: result.sid }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[SEND-SMS] Error occurred");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
