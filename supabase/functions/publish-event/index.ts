import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PublishRequest {
  event_id: string;
  platforms: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { event_id, platforms } = (await req.json()) as PublishRequest;

    // Fetch the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch platform connections
    const { data: connections } = await supabase
      .from("platform_connections")
      .select("*")
      .in("platform", platforms)
      .eq("is_active", true);

    const connectionMap = new Map(
      (connections || []).map((c: any) => [c.platform, c])
    );

    const results: Record<string, { status: string; external_url?: string; error?: string }> = {};

    for (const platform of platforms) {
      // Upsert sync record as "publishing"
      await supabase.from("event_platform_sync").upsert(
        {
          event_id,
          platform,
          status: "publishing",
          enabled: true,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "event_id,platform" }
      );

      try {
        if (platform === "eventbrite") {
          const result = await publishToEventbrite(event, supabase, event_id);
          results[platform] = result;
        } else {
          const connection = connectionMap.get(platform);
          if (!connection || !connection.webhook_url) {
            results[platform] = {
              status: "failed",
              error: `No webhook URL configured for ${platform}`,
            };
          } else {
            const result = await publishViaWebhook(
              event,
              platform,
              connection.webhook_url,
              event_id,
              supabaseUrl
            );
            results[platform] = result;
          }
        }

        // Update sync record
        await supabase.from("event_platform_sync").upsert(
          {
            event_id,
            platform,
            status: results[platform].status,
            external_url: results[platform].external_url || null,
            error_message: results[platform].error || null,
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "event_id,platform" }
        );
      } catch (err: any) {
        results[platform] = { status: "failed", error: err.message };
        await supabase.from("event_platform_sync").upsert(
          {
            event_id,
            platform,
            status: "failed",
            error_message: err.message,
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "event_id,platform" }
        );
      }
    }

    // Determine overall publish_status
    const statuses = Object.values(results).map((r) => r.status);
    const allPublished = statuses.every((s) => s === "published");
    const anyPublished = statuses.some((s) => s === "published");
    const publishStatus = allPublished ? "published" : anyPublished ? "partial" : "draft";

    await supabase
      .from("events")
      .update({ publish_status: publishStatus })
      .eq("id", event_id);

    return new Response(
      JSON.stringify({ success: true, results, publish_status: publishStatus }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("publish-event error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function publishToEventbrite(
  event: any,
  supabase: any,
  eventId: string
): Promise<{ status: string; external_url?: string; external_id?: string; error?: string }> {
  const apiKey = Deno.env.get("EVENTBRITE_API_KEY");
  if (!apiKey) {
    return { status: "failed", error: "EVENTBRITE_API_KEY not configured" };
  }

  try {
    // Get org ID
    const orgRes = await fetch("https://www.eventbriteapi.com/v3/users/me/organizations/", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const orgData = await orgRes.json();
    if (!orgRes.ok) {
      return { status: "failed", error: orgData.error_description || "Failed to get org" };
    }
    const orgId = orgData.organizations?.[0]?.id;
    if (!orgId) {
      return { status: "failed", error: "No Eventbrite organization found" };
    }

    // Build start/end times
    const startDate = event.date;
    const startTime = event.time || "19:00";
    const startUtc = `${startDate}T${startTime}:00`;
    // Default 2 hour duration
    const startMs = new Date(startUtc).getTime();
    const endUtc = new Date(startMs + 2 * 60 * 60 * 1000).toISOString().replace("Z", "");

    // Create event
    const createRes = await fetch(
      `https://www.eventbriteapi.com/v3/organizations/${orgId}/events/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            name: { html: event.title },
            description: { html: event.description || event.title },
            start: { timezone: "America/Denver", local: startUtc },
            end: { timezone: "America/Denver", local: endUtc.slice(0, 19) },
            currency: event.currency || "USD",
            capacity: event.capacity || 100,
            online_event: !event.location,
          },
        }),
      }
    );

    const createData = await createRes.json();
    if (!createRes.ok) {
      return {
        status: "failed",
        error: createData.error_description || JSON.stringify(createData),
      };
    }

    const ebEventId = createData.id;

    // Create a free ticket class
    await fetch(`https://www.eventbriteapi.com/v3/events/${ebEventId}/ticket_classes/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticket_class: {
          name: "General Admission",
          free: event.ticket_price == null || event.ticket_price === 0,
          quantity_total: event.capacity || 100,
          ...(event.ticket_price > 0
            ? { cost: `${event.currency || "USD"},${Math.round(event.ticket_price * 100)}` }
            : {}),
        },
      }),
    });

    // Publish the event
    const publishRes = await fetch(
      `https://www.eventbriteapi.com/v3/events/${ebEventId}/publish/`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    const externalUrl = createData.url || `https://www.eventbrite.com/e/${ebEventId}`;

    // Update sync record with external_id
    await supabase.from("event_platform_sync").upsert(
      {
        event_id: eventId,
        platform: "eventbrite",
        external_id: ebEventId,
        external_url: externalUrl,
        status: publishRes.ok ? "published" : "partial",
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "event_id,platform" }
    );

    return {
      status: publishRes.ok ? "published" : "partial",
      external_url: externalUrl,
      external_id: ebEventId,
    };
  } catch (err: any) {
    return { status: "failed", error: err.message };
  }
}

async function publishViaWebhook(
  event: any,
  platform: string,
  webhookUrl: string,
  eventId: string,
  supabaseUrl: string
): Promise<{ status: string; error?: string }> {
  try {
    const payload = {
      action: "create_event",
      event: {
        id: eventId,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        venue_name: event.venue_name,
        venue_address: event.venue_address,
        city: event.city,
        country: event.country,
        capacity: event.capacity,
        ticket_price: event.ticket_price,
        currency: event.currency,
        image_url: event.image_url,
        tags: event.tags,
      },
      target_platform: platform,
      callback_url: `${supabaseUrl}/functions/v1/publish-event-callback`,
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { status: "failed", error: `Webhook returned ${res.status}: ${text}` };
    }

    await res.text();

    // Webhook dispatched — status is "pending" until callback confirms
    return { status: "pending" };
  } catch (err: any) {
    return { status: "failed", error: err.message };
  }
}
