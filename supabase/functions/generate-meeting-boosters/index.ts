import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';



serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { matchId } = await req.json();

        if (!matchId) {
            throw new Error("Missing matchId");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

        // 1. Fetch match and participants' profiles
        const { data: match, error: matchError } = await supabase
            .from("dating_matches")
            .select("user_a_id, user_b_id")
            .eq("id", matchId)
            .single();

        if (matchError) throw matchError;

        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, first_name, job_title, industry, interests, vibe_clip_url")
            .in("id", [match.user_a_id, match.user_b_id]);

        if (profilesError) throw profilesError;

        // 2. AI Analysis to generate boosters
        const prompt = `You are a social wingman for a premium networking app. These two people are meeting IN PERSON for the first time. 
    
**PERSON 1:** ${profiles[0].first_name} | ${profiles[0].job_title} at ${profiles[0].industry} | Interests: ${profiles[0].interests?.join(", ")}
**PERSON 2:** ${profiles[1].first_name} | ${profiles[1].job_title} at ${profiles[1].industry} | Interests: ${profiles[1].interests?.join(", ")}

Your goal is to provide 3-4 "Meeting Boosters" (personalized icebreakers or deep questions) that help them skip small talk and connect on their shared or complementary backgrounds.

**RESPONSE FORMAT (JSON ONLY):**
{
  "boosters": [
    { "title": "Topic Title", "suggestion": "Suggested question or icebreaker" }
  ]
}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-pro-exp-02-05", // Using the latest sophisticated model
                messages: [
                    { role: "system", content: "You are a social expert. Respond with valid JSON only." },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) throw new Error("AI Booster generation failed");

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;
        const { boosters } = JSON.parse(content);

        return new Response(
            JSON.stringify({ boosters }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in generate-meeting-boosters:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
