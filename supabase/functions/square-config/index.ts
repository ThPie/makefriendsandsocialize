import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';
import { getSquareAppId, getSquareLocationId } from '../_shared/square.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const appId = getSquareAppId();
    const locationId = getSquareLocationId();

    if (!appId || !locationId) {
      throw new Error("Square configuration is incomplete");
    }

    // Determine environment from app ID
    const environment = appId.startsWith("sandbox-") ? "sandbox" : "production";

    return new Response(JSON.stringify({
      applicationId: appId,
      locationId,
      environment,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
