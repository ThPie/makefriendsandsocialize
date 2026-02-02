import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const RequestSchema = z.object({
  profileId: z.string().uuid("profileId must be a valid UUID"),
});

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
  core_values_ranked: string[] | null;
  status: string;
  is_active: boolean;
  // Relationship fields
  relationship_type: string | null;
  wants_children: string | null;
  has_children: boolean | null;
  smoking_status: string | null;
  drinking_status: string | null;
  love_language: string | null;
  attachment_style: string | null;
  introvert_extrovert: string | null;
  search_radius: number | null;
  // Gottman-inspired fields
  communication_style: string | null;
  repair_attempt_response: string | null;
  stress_response: string | null;
  past_relationship_learning: string | null;
  trust_fidelity_views: string | null;
  accountability_reflection: string | null;
  family_relationship: string | null;
  family_involvement_expectation: string | null;
  // Intimacy & Fear
  intimacy_expectations: string | null;
  finding_love_fear: string | null;
}

interface MatchResult {
  candidateId: string;
  score: number;
  reason: string;
  gottmanScore?: number;
  confidence?: number;
  dimensions?: {
    communication: number;
    values: number;
    goals: number;
    lifestyle: number;
    redFlags: number;
  };
}

// ============================================
// UTILITY FUNCTIONS (from Audit Recommendations)
// ============================================

// Rate limiting: 3 requests per hour per profile
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 3;

// Profile completeness threshold
const PROFILE_COMPLETENESS_THRESHOLD = 0.5; // 50%

// Batch size for parallel AI processing
const AI_BATCH_SIZE = 5;

// Hard dealbreaker check - runs BEFORE AI analysis to save API calls
const passesDealbreakerCheck = (
  target: DatingProfile,
  candidate: DatingProfile
): boolean => {
  // Children dealbreaker - absolute incompatibility
  if (
    target.wants_children === "No, definitely not" &&
    candidate.wants_children?.includes("Yes")
  ) {
    console.log(`DEALBREAKER: ${target.display_name} doesn't want kids, ${candidate.display_name} does`);
    return false;
  }
  if (
    target.wants_children?.includes("Yes") &&
    candidate.wants_children === "No, definitely not"
  ) {
    console.log(`DEALBREAKER: ${target.display_name} wants kids, ${candidate.display_name} definitely doesn't`);
    return false;
  }

  // Smoking dealbreaker (if specified in dealbreakers text)
  if (
    target.dealbreakers?.toLowerCase().includes("smoker") &&
    candidate.smoking_status === "Daily"
  ) {
    console.log(`DEALBREAKER: ${target.display_name} won't date smokers, ${candidate.display_name} smokes daily`);
    return false;
  }
  if (
    target.dealbreakers?.toLowerCase().includes("no smoking") &&
    candidate.smoking_status === "Daily"
  ) {
    console.log(`DEALBREAKER: ${target.display_name} won't date smokers, ${candidate.display_name} smokes daily`);
    return false;
  }

  // Relationship type dealbreaker
  if (
    target.relationship_type === "Long-term relationship" &&
    candidate.relationship_type === "Casual dating"
  ) {
    console.log(`DEALBREAKER: Relationship type mismatch (${target.display_name} wants long-term, ${candidate.display_name} wants casual)`);
    return false;
  }
  if (
    target.relationship_type === "Casual dating" &&
    candidate.relationship_type === "Long-term relationship"
  ) {
    console.log(`DEALBREAKER: Relationship type mismatch (${target.display_name} wants casual, ${candidate.display_name} wants long-term)`);
    return false;
  }

  return true;
};

// Calculate profile completeness for confidence scoring
const getProfileCompleteness = (profile: DatingProfile): number => {
  const importantFields = [
    "communication_style",
    "core_values_ranked",
    "wants_children",
    "conflict_resolution",
    "love_language",
    "attachment_style",
    "stress_response",
    "repair_attempt_response",
    "relationship_type",
    "intimacy_expectations",
  ];
  const filledCount = importantFields.filter(
    (field) => profile[field as keyof DatingProfile] !== null &&
      profile[field as keyof DatingProfile] !== undefined
  ).length;
  return filledCount / importantFields.length;
};

// Improved gender preference parsing (supports non-binary)
const parseGenderPreference = (pref: string): string[] => {
  if (pref === "Everyone") return ["Man", "Woman", "Non-binary", "Trans Man", "Trans Woman", "Other"];
  if (pref === "Men") return ["Man", "Trans Man"];
  if (pref === "Women") return ["Woman", "Trans Woman"];
  return [pref];
};

serve(async (req) => {
  // Handle CORS preflight
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
      const errorMessage = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error("Validation failed:", errorMessage);
      return new Response(
        JSON.stringify({ error: `Invalid input: ${errorMessage}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { profileId } = parseResult.data;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Gateway has already verified JWT if verify_jwt = true in config.toml
    // But we still fetch the user to verify ownership and get user ID
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or missing token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize admin client for sensitive operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the target profile and verify ownership
    const { data: targetProfile, error: profileError } = await supabase
      .from("dating_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError || !targetProfile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check ownership or admin status
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin');

    if (targetProfile.user_id !== user.id && !isAdmin) {
      console.error(`Security alert: User ${user.id} tried to find matches for profile ${profileId} owned by ${targetProfile.user_id}`);
      return new Response(
        JSON.stringify({ error: "You do not have permission to access this profile" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // RATE LIMITING CHECK
    // ============================================
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { data: recentCalls, error: rateLimitError } = await supabase
      .from("match_api_calls")
      .select("id")
      .eq("profile_id", profileId)
      .gte("created_at", oneHourAgo);

    // Log rate limit call (even if table doesn't exist yet)
    try {
      await supabase.from("match_api_calls").insert({ profile_id: profileId });
    } catch {
      console.log("Rate limit table not created yet - skipping rate limit tracking");
    }

    if (!rateLimitError && recentCalls && recentCalls.length >= RATE_LIMIT_MAX_REQUESTS) {
      console.log(`Rate limit exceeded for profile ${profileId}: ${recentCalls.length} calls in last hour`);
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. You can request new matches up to 3 times per hour.",
          retry_after_seconds: 3600
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Finding matches for: ${targetProfile.display_name}`);

    // Hard filter: Get candidates that match basic criteria
    let query = supabase
      .from("dating_profiles")
      .select("*")
      .neq("id", profileId)
      .in("status", ["approved", "vetted"])
      .eq("is_active", true);

    // Filter by target's gender preference (improved for non-binary support)
    if (targetProfile.target_gender !== "Everyone") {
      const acceptableGenders = parseGenderPreference(targetProfile.target_gender);
      query = query.in("gender", acceptableGenders);
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
      // Check if candidate's target_gender matches target's gender (improved)
      if (candidate.target_gender !== "Everyone") {
        const candidateAcceptsGenders = parseGenderPreference(candidate.target_gender);
        if (!candidateAcceptsGenders.includes(targetProfile.gender)) return false;
      }

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

    // ============================================
    // DEALBREAKER HARD FILTER (Runs BEFORE AI to save API calls)
    // ============================================
    const candidatesAfterDealbreakers = reciprocalCandidates.filter((candidate: DatingProfile) =>
      passesDealbreakerCheck(targetProfile, candidate)
    );
    console.log(`${candidatesAfterDealbreakers.length} candidates after dealbreaker filter (removed ${reciprocalCandidates.length - candidatesAfterDealbreakers.length})`);

    if (candidatesAfterDealbreakers.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No compatible matches after dealbreaker checks" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // PROFILE COMPLETENESS FILTER
    // ============================================
    const targetCompleteness = getProfileCompleteness(targetProfile);
    console.log(`Target profile completeness: ${Math.round(targetCompleteness * 100)}%`);

    const qualifiedCandidates = candidatesAfterDealbreakers.filter((candidate: DatingProfile) => {
      const completeness = getProfileCompleteness(candidate);
      if (completeness < PROFILE_COMPLETENESS_THRESHOLD) {
        console.log(`Skipping ${candidate.display_name}: Profile only ${Math.round(completeness * 100)}% complete`);
        return false;
      }
      return true;
    });

    console.log(`${qualifiedCandidates.length} candidates with sufficient profile data`);

    // AI Analysis using Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const matchResults: MatchResult[] = [];

    // Helper function to calculate shared core values
    const getSharedValues = (a: string[] | null, b: string[] | null): string[] => {
      if (!a || !b) return [];
      return a.filter(v => b.includes(v));
    };

    // ============================================
    // BATCH AI PROCESSING (Parallel with rate limiting)
    // ============================================

    // Helper to build prompt for a candidate
    const buildPrompt = (candidate: DatingProfile, sharedValues: string[]): string => {
      const candidateCompleteness = getProfileCompleteness(candidate);

      return `You are an expert matchmaker using Gottman Institute research and 50 years of relationship science to analyze compatibility.

**PERSON A: ${targetProfile.display_name}**
Basic Info:
- Age: ${targetProfile.age}
- Location: ${targetProfile.location || "Not specified"}
- Occupation: ${targetProfile.occupation || "Not specified"}
- Relationship Goal: ${targetProfile.relationship_type || "Not specified"}

Family & Future:
- Wants Children: ${targetProfile.wants_children || "Not specified"}
- Has Children: ${targetProfile.has_children ? "Yes" : "No"}
- Family Relationship: ${targetProfile.family_relationship || "Not specified"}
- In-Law Expectations: ${targetProfile.family_involvement_expectation || "Not specified"}

Lifestyle:
- Smoking: ${targetProfile.smoking_status || "Not specified"}
- Drinking: ${targetProfile.drinking_status || "Not specified"}

Personality:
- Love Language: ${targetProfile.love_language || "Not specified"}
- Attachment Style: ${targetProfile.attachment_style || "Not specified"}
- Social Energy: ${targetProfile.introvert_extrovert || "Not specified"}

**GOTTMAN-INSPIRED FACTORS (Critical for long-term success):**
- Communication Style: ${targetProfile.communication_style || "Not specified"}
- Repair Attempt Response: ${targetProfile.repair_attempt_response || "Not specified"}
- Stress Response: ${targetProfile.stress_response || "Not specified"}
- Past Relationship Learning: ${targetProfile.past_relationship_learning || "Not specified"}
- Trust/Fidelity Views: ${targetProfile.trust_fidelity_views || "Not specified"}
- Accountability Reflection: ${targetProfile.accountability_reflection || "Not specified"}

Core Values (Ranked): ${targetProfile.core_values_ranked?.join(", ") || targetProfile.core_values || "Not specified"}

Deep Dive:
- Conflict Resolution: ${targetProfile.conflict_resolution || "Not specified"}
- Emotional Connection: ${targetProfile.emotional_connection || "Not specified"}
- Ideal Tuesday Night: ${targetProfile.tuesday_night_test || "Not specified"}
- Dealbreakers: ${targetProfile.dealbreakers || "None specified"}

Physical Intimacy:
- Intimacy Expectations: ${targetProfile.intimacy_expectations || "Not specified"}

Self-Awareness:
- Finding Love Fear: ${targetProfile.finding_love_fear || "Not specified"}

---

**PERSON B: ${candidate.display_name}**
Basic Info:
- Age: ${candidate.age}
- Location: ${candidate.location || "Not specified"}
- Occupation: ${candidate.occupation || "Not specified"}
- Relationship Goal: ${candidate.relationship_type || "Not specified"}

Family & Future:
- Wants Children: ${candidate.wants_children || "Not specified"}
- Has Children: ${candidate.has_children ? "Yes" : "No"}
- Family Relationship: ${candidate.family_relationship || "Not specified"}
- In-Law Expectations: ${candidate.family_involvement_expectation || "Not specified"}

Lifestyle:
- Smoking: ${candidate.smoking_status || "Not specified"}
- Drinking: ${candidate.drinking_status || "Not specified"}

Personality:
- Love Language: ${candidate.love_language || "Not specified"}
- Attachment Style: ${candidate.attachment_style || "Not specified"}
- Social Energy: ${candidate.introvert_extrovert || "Not specified"}

**GOTTMAN-INSPIRED FACTORS (Critical for long-term success):**
- Communication Style: ${candidate.communication_style || "Not specified"}
- Repair Attempt Response: ${candidate.repair_attempt_response || "Not specified"}
- Stress Response: ${candidate.stress_response || "Not specified"}
- Past Relationship Learning: ${candidate.past_relationship_learning || "Not specified"}
- Trust/Fidelity Views: ${candidate.trust_fidelity_views || "Not specified"}
- Accountability Reflection: ${candidate.accountability_reflection || "Not specified"}

Core Values (Ranked): ${candidate.core_values_ranked?.join(", ") || candidate.core_values || "Not specified"}

Deep Dive:
- Conflict Resolution: ${candidate.conflict_resolution || "Not specified"}
- Emotional Connection: ${candidate.emotional_connection || "Not specified"}
- Ideal Tuesday Night: ${candidate.tuesday_night_test || "Not specified"}
- Dealbreakers: ${candidate.dealbreakers || "None specified"}

Physical Intimacy:
- Intimacy Expectations: ${candidate.intimacy_expectations || "Not specified"}

Self-Awareness:
- Finding Love Fear: ${candidate.finding_love_fear || "Not specified"}

---

**PROFILE COMPLETENESS:**
- Person A: ${Math.round(targetCompleteness * 100)}% complete
- Person B: ${Math.round(candidateCompleteness * 100)}% complete

**SHARED CORE VALUES: ${sharedValues.length > 0 ? sharedValues.join(", ") : "None identified"}**

---

**SCORING GUIDE (Weight these heavily):**

**COMMUNICATION & REPAIR (Gottman's #1 predictor) - 25% of score:**
- Both accept repair attempts readily → +25 points
- One resistant to repair attempts → -15 points (major red flag)
- Complementary communication styles → +10 points
- Both "shut down" or both "explode" → -10 points (conflict escalation pattern)

**STRESS RESPONSE COMPATIBILITY - 15% of score:**
- Both lean on partner → +15 (high interdependence)
- One needs space, one leans in → +8 (complementary if they understand each other)
- Both withdraw → -5 (isolation pattern risk)

**CORE VALUES ALIGNMENT - 25% of score:**
- 3+ shared values in top 5 → +25 points
- #1 value matches → +5 bonus
- 0 shared values → -15 points (fundamental incompatibility)

**RELATIONSHIP GOALS & FAMILY - 15% of score:**
- Same relationship goals → +15 points
- Children preferences aligned → +10 points
- Family involvement expectations match → +5 points

**ATTACHMENT STYLE - 10% of score:**
- Secure-Secure → +10 points (ideal)
- Secure paired with Anxious/Avoidant → +7 points (can work)
- Anxious-Avoidant → +3 points (challenging but workable)
- Both Avoidant → -5 points (connection difficulty)

**LIFESTYLE & INTIMACY - 10% of score:**
- Same intimacy expectations → +10 points
- Lifestyle habits align → +5 points

**CONFIDENCE SCORING:**
Evaluate how confident you are in this match based on:
- Profile completeness: ${Math.round(Math.min(targetCompleteness, candidateCompleteness) * 100)}% minimum
- Specificity of answers (vague vs detailed)
- Number of "Not specified" fields

Be realistic. Most people are NOT highly compatible. A 60%+ match meets our threshold for introduction.

Return JSON with:
- "score": 0-100 overall compatibility
- "gottman_score": 0-100 for communication/repair specifically
- "confidence": 0-100 (how confident in this score based on available data)
- "dimensions": { "communication": 0-100, "values": 0-100, "goals": 0-100, "lifestyle": 0-100, "red_flags": 0-100 }
- \"reason\": 2-3 sentence explanation (do NOT reveal specific personal details)`;
    };

    // Process a single candidate with AI
    const processCandidate = async (candidate: DatingProfile): Promise<MatchResult | null> => {
      try {
        const sharedValues = getSharedValues(
          targetProfile.core_values_ranked,
          candidate.core_values_ranked
        );

        const prompt = buildPrompt(candidate, sharedValues);

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              { role: "system", content: "You are an expert matchmaker using Gottman Institute research. Always respond with valid JSON only." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          console.error(`AI API error for candidate ${candidate.id}:`, await response.text());
          return null;
        }

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;

        if (!content) return null;

        const parsed = JSON.parse(content);
        const score = parseInt(parsed.score) || 0;
        const gottmanScore = parseInt(parsed.gottman_score) || score;
        const confidence = parseInt(parsed.confidence) || 70;
        const reason = parsed.reason || "Compatibility analysis unavailable";
        const dimensions = parsed.dimensions || {
          communication: gottmanScore,
          values: score,
          goals: score,
          lifestyle: score,
          red_flags: 80
        };

        console.log(`${candidate.display_name}: ${score}% (Gottman: ${gottmanScore}%, Confidence: ${confidence}%) - ${reason}`);

        // 60% threshold - provides foundation, real connection happens in person
        if (score >= 60) {
          return {
            candidateId: candidate.id,
            score,
            gottmanScore,
            confidence,
            reason,
            dimensions: {
              communication: parseInt(dimensions.communication) || gottmanScore,
              values: parseInt(dimensions.values) || score,
              goals: parseInt(dimensions.goals) || score,
              lifestyle: parseInt(dimensions.lifestyle) || score,
              redFlags: parseInt(dimensions.red_flags) || 80,
            },
          };
        }

        return null;
      } catch (error) {
        console.error(`AI analysis failed for candidate ${candidate.id}:`, { message: (error as Error).message });
        return null;
      }
    };

    if (qualifiedCandidates.length === 0) {
      console.log("No qualified candidates found after hard filters.");
      return new Response(
        JSON.stringify({
          matches: [],
          message: "No qualified candidates found in your area matching your basic preferences."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process candidates in batches of AI_BATCH_SIZE for parallel execution
    let aiFailuresCount = 0;
    for (let i = 0; i < qualifiedCandidates.length; i += AI_BATCH_SIZE) {
      const batch = qualifiedCandidates.slice(i, i + AI_BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / AI_BATCH_SIZE) + 1} of ${Math.ceil(qualifiedCandidates.length / AI_BATCH_SIZE)}`);

      const batchResults = await Promise.allSettled(
        batch.map((candidate: DatingProfile) => processCandidate(candidate))
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          matchResults.push(result.value);
        } else if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)) {
          aiFailuresCount++;
          if (result.status === 'rejected') {
            console.error("Batch item rejected:", result.reason);
          }
        }
      }
    }

    if (matchResults.length === 0 && aiFailuresCount > 0) {
      console.warn(`All ${aiFailuresCount} AI analyses failed or returned no matches.`);
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

      const matchDimensions = {
        communication: match.dimensions?.communication || match.gottmanScore || match.score,
        values: match.dimensions?.values || match.score,
        goals: match.dimensions?.goals || match.score,
        lifestyle: match.dimensions?.lifestyle || match.score,
        red_flags: match.dimensions?.redFlags || 80,
        gottman_score: match.gottmanScore || match.score,
        confidence: match.confidence || 70,
      };

      if (existingMatch) {
        // Update existing match
        await supabase
          .from("dating_matches")
          .update({
            compatibility_score: match.score,
            match_reason: match.reason,
            match_dimensions: matchDimensions,
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
          match_dimensions: matchDimensions,
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
    console.error("Error in find-matches function:", { message: (error as Error).message, name: (error as Error).name });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

