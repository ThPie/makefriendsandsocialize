import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
    matchId: z.string().uuid(),
});

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { matchId } = RequestSchema.parse(await req.json());

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch match and profiles
        const { data: match, error: matchError } = await supabase
            .from("dating_matches")
            .select(`
        id,
        user_a_id,
        user_b_id,
        user_a:dating_profiles!dating_matches_user_a_id_fkey(*),
        user_b:dating_profiles!dating_matches_user_b_id_fkey(*)
      `)
            .eq("id", matchId)
            .single();

        if (matchError || !match) throw new Error("Match not found");

        // Extract first profile from the array (Supabase returns array for FK joins)
        const userA = Array.isArray(match.user_a) ? match.user_a[0] : match.user_a;
        const userB = Array.isArray(match.user_b) ? match.user_b[0] : match.user_b;

        if (!userA || !userB) throw new Error("Could not find dating profiles for match");

        // 2. For now, return a simple recommendation without concierge_availability table
        // The table doesn't exist yet, so we provide sample slots
        const sampleSlots = [
            { id: "slot-1", location_name: "The Grand Hotel Lounge", location_description: "Premium venue", tags: ["quiet", "romantic"] },
            { id: "slot-2", location_name: "Café Central", location_description: "Cozy atmosphere", tags: ["casual", "coffee"] },
        ];

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

        // 3. AI Analysis
        const prompt = `You are a premium date concierge. Your task is to recommend the single best meeting slot for these two people based on their interests and the available venues.

**PERSON A: ${userA.display_name}**
- Interests/Bio: ${userA.tuesday_night_test || "Not specified"}
- Ideal Experience: ${userA.emotional_connection || "Not specified"}

**PERSON B: ${userB.display_name}**
- Interests/Bio: ${userB.tuesday_night_test || "Not specified"}
- Ideal Experience: ${userB.emotional_connection || "Not specified"}

**AVAILABLE SLOTS & VENUES:**
${sampleSlots.map(s => `- ID: ${s.id} | Venue: ${s.location_name} | Vibe: ${s.location_description || "Premium"} | Tags: ${s.tags?.join(", ") || "none"}`).join("\n")}

---

**RESPONSE FORMAT (JSON ONLY):**
{
  "recommended_slot_id": "UUID",
  "rationale": "1-2 sentences explaining why this venue fits their shared interests (e.g. 'Since you both mentioned a love for quiet, deep conversations, the cozy atmosphere at Cafe Central is perfect.')"
}

If multiple slots at the same venue are available, pick the earliest one. If no clear match, pick the most "general premium" option.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-pro",
                messages: [
                    { role: "system", content: "You are a strategic date concierge. Always respond with valid JSON only." },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) throw new Error("AI analysis failed");

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;
        if (!content) throw new Error("Empty AI response");

        const recommendation = JSON.parse(content);

        return new Response(
            JSON.stringify(recommendation),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in recommend-meeting-venue:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
