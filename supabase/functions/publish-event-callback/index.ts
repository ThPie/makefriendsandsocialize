import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event_id, platform, external_id, external_url, status, error_message } = await req.json();

    if (!event_id || !platform) {
      return new Response(
        JSON.stringify({ error: "event_id and platform are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finalStatus = status || "published";

    // Update the sync record
    const { error } = await supabase.from("event_platform_sync").upsert(
      {
        event_id,
        platform,
        status: finalStatus,
        external_id: external_id || null,
        external_url: external_url || null,
        error_message: error_message || null,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "event_id,platform" }
    );

    if (error) {
      console.error("Failed to update sync record:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update sync record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Recalculate overall publish_status for the event
    const { data: syncRecords } = await supabase
      .from("event_platform_sync")
      .select("status")
      .eq("event_id", event_id)
      .eq("enabled", true);

    if (syncRecords && syncRecords.length > 0) {
      const allPublished = syncRecords.every((r: any) => r.status === "published");
      const anyPublished = syncRecords.some((r: any) => r.status === "published");
      const publishStatus = allPublished ? "published" : anyPublished ? "partial" : "draft";

      await supabase
        .from("events")
        .update({ publish_status: publishStatus })
        .eq("id", event_id);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("publish-event-callback error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
