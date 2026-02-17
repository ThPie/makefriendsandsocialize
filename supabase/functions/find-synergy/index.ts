import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from '../_shared/cors.ts';



// Input validation schema
const RequestSchema = z.object({
    businessId: z.string().uuid("businessId must be a valid UUID"),
});

interface BusinessProfile {
    id: string;
    user_id: string;
    business_name: string;
    industry: string | null;
    category: string | null;
    description: string | null;
    services: string[] | null;
    location: string | null;
    logo_url: string | null;
    website: string | null;
}

interface SynergyResult {
    candidateId: string;
    score: number;
    synergyType: string;
    collaborationHooks: string[];
    aiAnalysis: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Parse and validate input
        const body = await req.json();
        const parseResult = RequestSchema.safeParse(body);
        if (!parseResult.success) {
            return new Response(
                JSON.stringify({ error: `Invalid input: ${parseResult.error.message}` }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }
        const { businessId } = parseResult.data;

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get the target business
        const { data: targetBusiness, error: targetError } = await supabase
            .from("business_profiles")
            .select("*")
            .eq("id", businessId)
            .single();

        if (targetError || !targetBusiness) {
            return new Response(
                JSON.stringify({ error: "Business profile not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get potential candidates (all other approved businesses)
        // In a real app, we might filter by category or proximity initially
        const { data: candidates, error: candidatesError } = await supabase
            .from("business_profiles")
            .select("*")
            .neq("id", businessId)
            .eq("status", "approved");

        if (candidatesError) throw candidatesError;

        if (!candidates || candidates.length === 0) {
            return new Response(
                JSON.stringify({ matches: [], message: "No other businesses found for matching" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

        const synergyResults: SynergyResult[] = [];

        // Helper to process a potential synergy via AI
        const processSynergy = async (candidate: BusinessProfile): Promise<SynergyResult | null> => {
            try {
                const prompt = `You are an elite B2B consultant and matchmaker. Analyze the potential for synergy between two companies in a premium business network.

**COMPANY A: ${targetBusiness.business_name}**
- Industry: ${targetBusiness.industry || "Not specified"}
- Category: ${targetBusiness.category || "Not specified"}
- Description: ${targetBusiness.description || "Not specified"}
- Services: ${targetBusiness.services?.join(", ") || "Not specified"}
- Location: ${targetBusiness.location || "Not specified"}

**COMPANY B: ${candidate.business_name}**
- Industry: ${candidate.industry || "Not specified"}
- Category: ${candidate.category || "Not specified"}
- Description: ${candidate.description || "Not specified"}
- Services: ${candidate.services?.join(", ") || "Not specified"}
- Location: ${candidate.location || "Not specified"}

---

**CRITERIA:**
1. **Complementary Services**: Do they provide services that solve different parts of a customer's problem? (e.g., Luxury Travel Agent & High-end Real Estate)
2. **Supply Chain**: Is one a potential vendor or partner for the other?
3. **Cross-Pollination**: Do they serve the same high-net-worth demographic but in different industries?
4. **Geographic Synergy**: Are they located near each other for easy collaboration?

---

**RESPONSE FORMAT (JSON ONLY):**
{
  "score": 0-100,
  "synergy_type": "one_word_category",
  "collaboration_hooks": ["hook 1", "hook 2", "hook 3"],
  "ai_analysis": "2-3 sentence strategic rationale for this match"
}

Hooks should be specific conversation starters like "You both serve the Miami luxury market" or "Your design services could elevate their product launches."`;

                const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${LOVABLE_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.5-pro",
                        messages: [
                            { role: "system", content: "You are a strategic B2B matchmaker. Always respond with valid JSON only." },
                            { role: "user", content: prompt },
                        ],
                        response_format: { type: "json_object" },
                    }),
                });

                if (!response.ok) return null;

                const aiResult = await response.json();
                const content = aiResult.choices?.[0]?.message?.content;
                if (!content) return null;

                const parsed = JSON.parse(content);

                // We only care about high synergy scores (> 50)
                if (parsed.score >= 50) {
                    return {
                        candidateId: candidate.id,
                        score: parsed.score,
                        synergyType: parsed.synergy_type,
                        collaborationHooks: parsed.collaboration_hooks,
                        aiAnalysis: parsed.ai_analysis
                    };
                }
                return null;
            } catch (error) {
                console.error(`Synergy analysis failed for ${candidate.id}:`, error);
                return null;
            }
        };

        // Parallel processing with batching (limit to 5 to avoid API time-outs)
        const BATCH_SIZE = 5;
        for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
            const batch = candidates.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(batch.map(c => processSynergy(c)));

            for (const result of batchResults) {
                if (result) synergyResults.push(result);
            }
        }

        // Save/Update results in database
        for (const result of synergyResults) {
            // Order IDs alphabetically to handle bidirectional pair consistently
            const [idA, idB] = [businessId, result.candidateId].sort();

            const { error: upsertError } = await supabase
                .from("business_synergy_matches")
                .upsert({
                    business_a_id: idA,
                    business_b_id: idB,
                    score: result.score,
                    synergy_type: result.synergyType,
                    collaboration_hooks: result.collaborationHooks,
                    ai_analysis: result.aiAnalysis,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: "business_a_id, business_b_id"
                });

            if (upsertError) console.error("Error saving synergy match:", upsertError);
        }

        return new Response(
            JSON.stringify({
                matches_found: synergyResults.length,
                matches: synergyResults
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in find-synergy function:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
