import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from '../_shared/cors.ts';



// Input validation schema
const RequestSchema = z.object({
  profileId: z.string().uuid("profileId must be a valid UUID").optional(),
  batchAll: z.boolean().optional(),
}).refine(
  (data) => data.profileId || data.batchAll,
  { message: "Either profileId or batchAll must be provided" }
);

interface NormalizedConflictStyle {
  primary_style: "collaborative" | "avoidant" | "competitive" | "accommodating" | "compromising" | "unknown";
  emotional_regulation: "high" | "medium" | "low";
  repair_receptivity: number; // 1-10
}

interface NormalizedConnectionStyle {
  intimacy_preference: "deep" | "moderate" | "surface";
  vulnerability_comfort: number; // 1-10
  love_languages_detected: string[];
  attachment_tendency: "secure" | "anxious" | "avoidant" | "fearful" | "unknown";
}

interface NormalizedLifestyle {
  lifestyle_energy: "active" | "balanced" | "relaxed";
  social_preference: "together" | "independent" | "flexible";
  routine_compatibility: string[];
  financial_mindset: "saver" | "spender" | "balanced" | "unknown";
}

interface CompatibilityDimensions {
  communication_score: number;
  values_score: number;
  goals_score: number;
  lifestyle_score: number;
  gottman_factors_score: number;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ');
      console.error("Validation failed:", errorMessage);
      return new Response(
        JSON.stringify({ error: `Invalid input: ${errorMessage}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { profileId, batchAll } = parseResult.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let profilesToProcess: Array<Record<string, unknown>> = [];

    if (batchAll) {
      // Get all profiles that haven't been preprocessed or need reprocessing
      const { data: profiles, error } = await supabase
        .from("dating_profiles")
        .select("*")
        .in("status", ["vetted", "approved", "new", "pending"])
        .or("last_preprocessed_at.is.null,last_preprocessed_at.lt." + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      profilesToProcess = profiles || [];
      console.log(`Batch processing ${profilesToProcess.length} profiles`);
    } else if (profileId) {
      const { data: profile, error: profileError } = await supabase
        .from("dating_profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      profilesToProcess = [profile];
    }

    if (profilesToProcess.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No profiles to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (const profile of profilesToProcess) {
      try {
        console.log(`Pre-processing profile for: ${profile.display_name}`);

        const prompt = `You are a relationship psychology expert. Analyze this dating profile and normalize the free-text answers into structured categories.

**PROFILE DATA:**
- Communication Style: ${profile.communication_style || "Not specified"}
- Conflict Resolution: ${profile.conflict_resolution || "Not specified"}
- Repair Attempt Response: ${profile.repair_attempt_response || "Not specified"}
- Stress Response: ${profile.stress_response || "Not specified"}
- Emotional Connection: ${profile.emotional_connection || "Not specified"}
- Support Style: ${profile.support_style || "Not specified"}
- Vulnerability Check: ${profile.vulnerability_check || "Not specified"}
- Love Language: ${profile.love_language || "Not specified"}
- Attachment Style: ${profile.attachment_style || "Not specified"}
- Tuesday Night Test: ${profile.tuesday_night_test || "Not specified"}
- Financial Philosophy: ${profile.financial_philosophy || "Not specified"}
- Core Values Ranked: ${(profile.core_values_ranked as string[])?.join(", ") || profile.core_values || "Not specified"}
- Accountability Reflection: ${profile.accountability_reflection || "Not specified"}
- Past Relationship Learning: ${profile.past_relationship_learning || "Not specified"}
- Trust/Fidelity Views: ${profile.trust_fidelity_views || "Not specified"}

**NORMALIZE INTO THESE CATEGORIES:**

1. conflict_style_normalized:
   - primary_style: One of "collaborative", "avoidant", "competitive", "accommodating", "compromising", "unknown"
   - emotional_regulation: "high", "medium", or "low" based on how they describe handling emotions
   - repair_receptivity: 1-10 score based on how open they are to repair attempts after conflict

2. connection_style_normalized:
   - intimacy_preference: "deep", "moderate", or "surface" based on emotional depth they seek
   - vulnerability_comfort: 1-10 score based on their openness about vulnerability
   - love_languages_detected: Array of detected love languages from their answers
   - attachment_tendency: "secure", "anxious", "avoidant", "fearful", or "unknown"

3. lifestyle_normalized:
   - lifestyle_energy: "active", "balanced", or "relaxed" based on Tuesday night test
   - social_preference: "together", "independent", or "flexible"
   - routine_compatibility: Array of lifestyle traits (e.g., ["early_riser", "homebody", "spontaneous"])
   - financial_mindset: "saver", "spender", "balanced", or "unknown"

4. compatibility_dimensions (pre-computed scores 0-100):
   - communication_score: Based on clarity and style of communication answers
   - values_score: Based on core values depth and specificity
   - goals_score: Based on relationship goal alignment indicators
   - lifestyle_score: Based on lifestyle compatibility indicators
   - gottman_factors_score: Based on repair receptivity, conflict style, stress response

Return a JSON object with these four keys. Be conservative in scoring - only rate high if there's clear evidence.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { 
                role: "system", 
                content: "You are a relationship psychology expert. Analyze profiles and return structured JSON only." 
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI API error:", errorText);
          throw new Error("Failed to analyze profile with AI");
        }

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("No response from AI");
        }

        let normalized;
        try {
          normalized = JSON.parse(content);
        } catch (parseError) {
          console.error("Failed to parse AI response:", content);
          throw new Error("Invalid AI response format");
        }

        console.log("Normalized data:", JSON.stringify(normalized, null, 2));

        // Update the profile with normalized data
        const { error: updateError } = await supabase
          .from("dating_profiles")
          .update({
            conflict_style_normalized: normalized.conflict_style_normalized || null,
            connection_style_normalized: normalized.connection_style_normalized || null,
            lifestyle_normalized: normalized.lifestyle_normalized || null,
            compatibility_dimensions: normalized.compatibility_dimensions || null,
            last_preprocessed_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Failed to update profile:", updateError);
          throw new Error("Failed to save normalized data");
        }

        processedCount++;
        console.log(`Successfully pre-processed profile: ${profile.display_name}`);
      } catch (profileError) {
        console.error(`Error processing ${profile.display_name}:`, profileError);
        errors.push(`${profile.display_name}: ${profileError instanceof Error ? profileError.message : "Unknown error"}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: batchAll 
          ? `Processed ${processedCount} of ${profilesToProcess.length} profiles`
          : "Profile pre-processed successfully",
        processed: processedCount,
        total: profilesToProcess.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in preprocess-dating-profile:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
