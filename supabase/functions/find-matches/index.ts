import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  gender: string;
  target_gender: string;
  age_range_min: number;
  age_range_max: number;
  location: string | null;
  occupation: string | null;
  conflict_resolution: string | null;
  emotional_connection: string | null;
  tuesday_night_test: string | null;
  dealbreakers: string | null;
  core_values: string | null;
  status: string;
  is_active: boolean;
  // New fields
  relationship_type: string | null;
  wants_children: string | null;
  has_children: boolean | null;
  smoking_status: string | null;
  drinking_status: string | null;
  love_language: string | null;
  attachment_style: string | null;
  introvert_extrovert: string | null;
}

interface MatchResult {
  candidateId: string;
  score: number;
  reason: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId } = await req.json();

    if (!profileId) {
      throw new Error("profileId is required");
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the target profile
    const { data: targetProfile, error: profileError } = await supabase
      .from("dating_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError || !targetProfile) {
      throw new Error("Profile not found");
    }

    console.log(`Finding matches for: ${targetProfile.display_name}`);

    // Hard filter: Get candidates that match basic criteria
    let query = supabase
      .from("dating_profiles")
      .select("*")
      .neq("id", profileId)
      .in("status", ["approved", "vetted"])
      .eq("is_active", true);

    // Filter by target's gender preference
    if (targetProfile.target_gender !== "Everyone") {
      // If target wants "Men", candidates should be "Man"
      const genderMatch = targetProfile.target_gender === "Men" ? "Man" : "Woman";
      query = query.eq("gender", genderMatch);
    }

    // Filter by age range
    query = query
      .gte("age", targetProfile.age_range_min)
      .lte("age", targetProfile.age_range_max);

    const { data: candidates, error: candidatesError } = await query;

    if (candidatesError) {
      throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
    }

    console.log(`Found ${candidates?.length || 0} candidates after hard filter`);

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No compatible candidates found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reciprocal filter: Check if candidates would also be interested in target
    const reciprocalCandidates = candidates.filter((candidate: DatingProfile) => {
      // Check if candidate's target_gender matches target's gender
      if (candidate.target_gender === "Everyone") return true;
      const targetGenderMatch = candidate.target_gender === "Men" ? "Man" : "Woman";
      if (targetProfile.gender !== targetGenderMatch) return false;

      // Check if target's age falls within candidate's preferred range
      if (targetProfile.age < candidate.age_range_min || targetProfile.age > candidate.age_range_max) {
        return false;
      }

      return true;
    });

    console.log(`${reciprocalCandidates.length} candidates after reciprocal filter`);

    if (reciprocalCandidates.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No reciprocal matches found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // AI Analysis using Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const matchResults: MatchResult[] = [];

    // Process candidates in batches to avoid rate limits
    for (const candidate of reciprocalCandidates) {
      try {
        const prompt = `You are a professional matchmaker analyzing compatibility between two dating profiles.

Person A (${targetProfile.display_name}):
- Age: ${targetProfile.age}
- Location: ${targetProfile.location || "Not specified"}
- Occupation: ${targetProfile.occupation || "Not specified"}
- Relationship Type Seeking: ${targetProfile.relationship_type || "Not specified"}
- Wants Children: ${targetProfile.wants_children || "Not specified"}
- Has Children: ${targetProfile.has_children ? "Yes" : "No"}
- Smoking: ${targetProfile.smoking_status || "Not specified"}
- Drinking: ${targetProfile.drinking_status || "Not specified"}
- Love Language: ${targetProfile.love_language || "Not specified"}
- Attachment Style: ${targetProfile.attachment_style || "Not specified"}
- Social Energy: ${targetProfile.introvert_extrovert || "Not specified"}
- Conflict Resolution Style: ${targetProfile.conflict_resolution || "Not answered"}
- What Emotional Connection Means: ${targetProfile.emotional_connection || "Not answered"}
- Ideal Tuesday Night: ${targetProfile.tuesday_night_test || "Not answered"}
- Dealbreakers: ${targetProfile.dealbreakers || "None specified"}
- Core Values: ${targetProfile.core_values || "Not answered"}

Person B (${candidate.display_name}):
- Age: ${candidate.age}
- Location: ${candidate.location || "Not specified"}
- Occupation: ${candidate.occupation || "Not specified"}
- Relationship Type Seeking: ${candidate.relationship_type || "Not specified"}
- Wants Children: ${candidate.wants_children || "Not specified"}
- Has Children: ${candidate.has_children ? "Yes" : "No"}
- Smoking: ${candidate.smoking_status || "Not specified"}
- Drinking: ${candidate.drinking_status || "Not specified"}
- Love Language: ${candidate.love_language || "Not specified"}
- Attachment Style: ${candidate.attachment_style || "Not specified"}
- Social Energy: ${candidate.introvert_extrovert || "Not specified"}
- Conflict Resolution Style: ${candidate.conflict_resolution || "Not answered"}
- What Emotional Connection Means: ${candidate.emotional_connection || "Not answered"}
- Ideal Tuesday Night: ${candidate.tuesday_night_test || "Not answered"}
- Dealbreakers: ${candidate.dealbreakers || "None specified"}
- Core Values: ${candidate.core_values || "Not answered"}

Analyze their compatibility considering:
1. **Relationship Goals**: Are they looking for the same type of relationship?
2. **Family Plans**: Are their views on children compatible?
3. **Lifestyle Compatibility**: Do their smoking, drinking, and lifestyle habits align?
4. **Values Alignment**: Do their core values complement each other?
5. **Communication/Conflict Style**: Would they handle disagreements well together?
6. **Emotional Style**: Are their love languages and attachment styles compatible?
7. **Daily Life**: Would their ideal evenings work together? Introvert/extrovert balance?
8. **Dealbreaker Analysis**: Are there any obvious conflicts?

Return a JSON object with:
- "score": A number from 0 to 100 representing compatibility percentage
- "reason": A 2-3 sentence explanation of why they would or wouldn't be compatible

Be realistic and honest in scoring. Most people are not highly compatible. Give heavy weight to dealbreakers, children preferences, and relationship type alignment.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a professional matchmaker AI. Always respond with valid JSON only." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          console.error(`AI API error for candidate ${candidate.id}:`, await response.text());
          continue;
        }

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;

        if (content) {
          try {
            const parsed = JSON.parse(content);
            const score = parseInt(parsed.score) || 0;
            const reason = parsed.reason || "Compatibility analysis unavailable";

            console.log(`${candidate.display_name}: ${score}% - ${reason}`);

            // Only include matches with 60% or higher
            if (score >= 60) {
              matchResults.push({
                candidateId: candidate.id,
                score,
                reason,
              });
            }
          } catch (parseError) {
            console.error(`Failed to parse AI response for ${candidate.id}:`, parseError);
          }
        }
      } catch (aiError) {
        console.error(`AI analysis failed for candidate ${candidate.id}:`, aiError);
      }
    }

    console.log(`Found ${matchResults.length} matches with score >= 60%`);

    // Store matches in database
    for (const match of matchResults) {
      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from("dating_matches")
        .select("id")
        .or(`and(user_a_id.eq.${profileId},user_b_id.eq.${match.candidateId}),and(user_a_id.eq.${match.candidateId},user_b_id.eq.${profileId})`)
        .maybeSingle();

      if (existingMatch) {
        // Update existing match
        await supabase
          .from("dating_matches")
          .update({
            compatibility_score: match.score,
            match_reason: match.reason,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMatch.id);
      } else {
        // Insert new match
        await supabase.from("dating_matches").insert({
          user_a_id: profileId,
          user_b_id: match.candidateId,
          compatibility_score: match.score,
          match_reason: match.reason,
          status: "pending",
        });
      }
    }

    return new Response(
      JSON.stringify({
        matches: matchResults,
        message: `Found ${matchResults.length} compatible matches`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in find-matches function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
