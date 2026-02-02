import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
    eventId: z.string().uuid(),
    userId: z.string().uuid(),
});

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { eventId, userId } = RequestSchema.parse(await req.json());

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch current user profile
        const { data: userProfile, error: userError } = await supabase
            .from("profiles")
            .select("first_name, interests, industry, job_title")
            .eq("id", userId)
            .single();

        if (userError) throw userError;

        // 2. Fetch other checked-in attendees (limit for prompt size)
        // We look at event_registrations or check-ins. Assuming 'event_registrations' exists.
        const { data: attendees, error: attendeesError } = await supabase
            .from("profiles")
            .select("first_name, interests, industry, job_title")
            .neq("id", userId)
            .limit(10); // Sampling other members for inspiration

        if (attendeesError) throw attendeesError;

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

        // 3. AI Generation
        const prompt = `You are a social architect for a premium networking event. Your goal is to generate 3 "Icebreaker Quests" for an attendee to help them network effectively.

**ATTENDEE:**
- Name: ${userProfile.first_name}
- Industry: ${userProfile.industry}
- Interests: ${userProfile.interests?.join(", ") || "General"}

**OTHERS IN THE ROOM (Inspiration):**
${attendees.map(a => `- ${a.first_name} (${a.industry || "Unknown"}), Interests: ${a.interests?.join(", ") || "General"}`).join("\n")}

---

**RESPONSE FORMAT (JSON ONLY):**
{
  "quests": [
    "Mission 1 text (e.g. 'Find someone in the Real Estate industry and ask about their favorite travel memory.')",
    "Mission 2 text",
    "Mission 3 text"
  ]
}

Quests should be specific but achievable without knowing exactly who is who (e.g., rely on common industries or shared interests).`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.1-pro", // Using a reliable model
                messages: [
                    { role: "system", content: "You are a social expert. Respond with valid JSON only." },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) throw new Error("AI Quest generation failed");

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;
        const { quests } = JSON.parse(content);

        // 4. Store quests
        const insertData = quests.map((text: string) => ({
            event_id: eventId,
            user_id: userId,
            quest_text: text,
        }));

        const { error: insertError } = await supabase
            .from("event_checkin_quests")
            .insert(insertData);

        if (insertError) throw insertError;

        return new Response(
            JSON.stringify({ quests }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in generate-event-quests:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
