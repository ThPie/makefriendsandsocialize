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
            .select("user_a_id, user_b_id, meeting_date")
            .eq("id", matchId)
            .single();

        if (matchError) throw matchError;

        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("first_name, job_title, industry, interests, vibe_clip_url")
            .in("id", [match.user_a_id, match.user_b_id]);

        if (profilesError) throw profilesError;

        // 2. AI Generation of Origin Story
        const prompt = `You are a cinematic storyteller for a premium networking app. These two people have just successfully met in person and both voted "YES" to continue the connection.
    
**PERSON 1:** ${profiles[0].first_name} (${profiles[0].job_title})
**PERSON 2:** ${profiles[1].first_name} (${profiles[1].job_title})
**THEIR JOURNEY:** They met on ${match.meeting_date}.

Write a poetic, 2-3 sentence "Origin Story" that highlights why they are a perfect match (shared interests: ${profiles[0].interests?.filter((i: string) => profiles[1].interests?.includes(i)).join(", ") || 'complementary expertise'}). 
Make it sound premium, inspiring, and romantic (or professional synergy depending on their vibe).

**FORM:** "It started with a shared love for [Interest X]. Since their meeting at [Date], [Name1] and [Name2] have proven that [Thematic connection]. Their journey begins now."

**RESPONSE FORMAT (JSON ONLY):**
{
  "origin_story": "The generated story..."
}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-pro-exp-02-05",
                messages: [
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) throw new Error("AI Story generation failed");

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;
        const { origin_story } = JSON.parse(content);

        // 3. Update the match
        await supabase.from("dating_matches").update({ origin_story }).eq("id", matchId);

        return new Response(
            JSON.stringify({ origin_story }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in generate-origin-story:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
