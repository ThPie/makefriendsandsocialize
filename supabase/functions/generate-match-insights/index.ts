import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from '../_shared/cors.ts';



// Input validation schema
const RequestSchema = z.object({
    matchId: z.string().uuid("matchId must be a valid UUID"),
});

interface DatingProfile {
    id: string;
    user_id: string;
    display_name: string;
    age: number;
    gender: string;
    location: string | null;
    occupation: string | null;
    bio: string | null;
    core_values_ranked: string[] | null;
    communication_style: string | null;
    love_language: string | null;
    attachment_style: string | null;
    relationship_type: string | null;
    wants_children: string | null;
    stress_response: string | null;
    repair_attempt_response: string | null;
    conflict_resolution: string | null;
}

interface MatchDimensions {
    communication?: number;
    values?: number;
    goals?: number;
    lifestyle?: number;
}

interface Match {
    id: string;
    user_a_id: string;
    user_b_id: string;
    compatibility_score: number;
    match_reason: string;
    match_dimensions: MatchDimensions | null;
    status: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get authorization header for user context
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse and validate input
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return new Response(
                JSON.stringify({ error: "Invalid JSON body" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const parseResult = RequestSchema.safeParse(body);
        if (!parseResult.success) {
            const errorMessage = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return new Response(
                JSON.stringify({ error: `Invalid input: ${errorMessage}` }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { matchId } = parseResult.data;

        // Initialize Supabase clients
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

        // User client for auth check
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Service client for data operations
        const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

        // Verify user is authenticated
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get the match
        const { data: match, error: matchError } = await serviceClient
            .from("dating_matches")
            .select("*")
            .eq("id", matchId)
            .single();

        if (matchError || !match) {
            return new Response(
                JSON.stringify({ error: "Match not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get both profiles
        const { data: profiles, error: profilesError } = await serviceClient
            .from("dating_profiles")
            .select("*")
            .in("id", [match.user_a_id, match.user_b_id]);

        if (profilesError || !profiles || profiles.length !== 2) {
            return new Response(
                JSON.stringify({ error: "Profiles not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const profileA = profiles.find((p: DatingProfile) => p.id === match.user_a_id) as DatingProfile;
        const profileB = profiles.find((p: DatingProfile) => p.id === match.user_b_id) as DatingProfile;

        // Verify requesting user is part of this match
        const userProfile = profiles.find((p: DatingProfile) => p.user_id === user.id);
        if (!userProfile) {
            return new Response(
                JSON.stringify({ error: "You are not part of this match" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if match is revealed (mutual_yes)
        if (match.status !== "mutual_yes") {
            return new Response(
                JSON.stringify({ error: "Match insights are only available for revealed matches" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Generate AI insights
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
            throw new Error("LOVABLE_API_KEY is not configured");
        }

        // Calculate shared values
        const sharedValues = (profileA.core_values_ranked || []).filter(
            (v: string) => profileB.core_values_ranked?.includes(v)
        );

        const prompt = `You are an expert relationship coach generating personalized insights for a matched couple.

**PERSON A:**
- Name: ${profileA.display_name}
- Age: ${profileA.age}
- Occupation: ${profileA.occupation || "Not specified"}
- Location: ${profileA.location || "Not specified"}
- Core Values: ${profileA.core_values_ranked?.join(", ") || "Not specified"}
- Communication Style: ${profileA.communication_style || "Not specified"}
- Love Language: ${profileA.love_language || "Not specified"}
- Conflict Resolution: ${profileA.conflict_resolution || "Not specified"}

**PERSON B:**
- Name: ${profileB.display_name}
- Age: ${profileB.age}
- Occupation: ${profileB.occupation || "Not specified"}
- Location: ${profileB.location || "Not specified"}
- Core Values: ${profileB.core_values_ranked?.join(", ") || "Not specified"}
- Communication Style: ${profileB.communication_style || "Not specified"}
- Love Language: ${profileB.love_language || "Not specified"}
- Conflict Resolution: ${profileB.conflict_resolution || "Not specified"}

**SHARED VALUES:** ${sharedValues.length > 0 ? sharedValues.join(", ") : "None identified"}
**COMPATIBILITY SCORE:** ${match.compatibility_score}%

Generate personalized match insights. Return JSON with:
- "matchExplanation": 2-3 sentences explaining WHY these two are compatible (be specific, reference their actual traits)
- "conversationStarters": Array of 3 specific conversation topics based on their shared interests
- "relationshipStrengths": Array of 3 things they can uniquely offer each other
- "potentialChallenges": Array of 2 areas where they may need to communicate carefully
- "dateIdeas": Array of 3 date ideas that would appeal to both based on their profiles
- "milestones": Array of 6 relationship milestones with "title", "description", "timeframe", and "confidence" (0-100)

Be warm, encouraging, and specific. Don't be generic.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    { role: "system", content: "You are an expert relationship coach. Always respond with valid JSON only." },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            console.error("AI API error:", await response.text());
            throw new Error("Failed to generate insights");
        }

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("No content in AI response");
        }

        const insights = JSON.parse(content);

        // Add match metadata to insights
        const fullInsights = {
            ...insights,
            matchId,
            compatibilityScore: match.compatibility_score,
            sharedValues,
            matchDimensions: match.match_dimensions,
            generatedAt: new Date().toISOString(),
        };

        return new Response(
            JSON.stringify(fullInsights),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in generate-match-insights function:", {
            message: (error as Error).message,
            name: (error as Error).name
        });
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
