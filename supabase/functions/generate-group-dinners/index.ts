import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
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

        // 1. Fetch potential participants (Founders/Fellows)
        const { data: candidates, error: candidatesError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, interests, industry, job_title")
            .limit(20); // sample pool

        if (candidatesError) throw candidatesError;

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

        // 2. AI Selection of 6 people
        const prompt = `You are an elite social concierge. Select a group of 6 people from the following list who would have the most interesting and symbiotic dinner conversation. 

**CANDIDATES:**
${candidates.map(c => `- ID: ${c.id} | Name: ${c.first_name} | Industry: ${c.industry} | Interests: ${c.interests?.join(", ")}`).join("\n")}

---

**RESPONSE FORMAT (JSON ONLY):**
{
  "group_title": "A catchy name for the dinner (e.g. 'Tech & Design Synergy')",
  "rationale": "Why these 6 people fit together (e.g. 'This group mixes creative directors with technical founders for a holistic view of the industry.')",
  "selected_user_ids": ["UUID1", "UUID2", "UUID3", "UUID4", "UUID5", "UUID6"]
}

Base your selection on shared interests, complementary industries, or a good mix of backgrounds.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.1-pro",
                messages: [
                    { role: "system", content: "You are a social expert. Respond with valid JSON only." },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) throw new Error("AI Group generation failed");

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;
        const { group_title, rationale, selected_user_ids } = JSON.parse(content);

        // 3. Create Group Dinner
        const { data: dinner, error: dinnerError } = await supabase
            .from("group_dinners")
            .insert({
                title: group_title,
                description: rationale,
                scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
                status: "proposed",
            })
            .select()
            .single();

        if (dinnerError) throw dinnerError;

        // 4. Invite Members
        const memberInserts = selected_user_ids.map((uid: string) => ({
            group_dinner_id: dinner.id,
            user_id: uid,
            status: "pending",
        }));

        const { error: membersError } = await supabase
            .from("group_dinner_members")
            .insert(memberInserts);

        if (membersError) throw membersError;

        return new Response(
            JSON.stringify({ dinner, members: selected_user_ids }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in generate-group-dinners:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
