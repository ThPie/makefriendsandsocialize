import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';



interface SocialProfile {
  linkedin_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId } = await req.json();

    if (!profileId) {
      throw new Error("profileId is required");
    }

    console.log(`Verifying social profiles for: ${profileId}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the profile
    const { data: profile, error: profileError } = await supabase
      .from("dating_profiles")
      .select("id, display_name, linkedin_url, instagram_url, facebook_url, twitter_url, bio, occupation")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    // Get Firecrawl API key
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const socialProfiles: { platform: string; url: string; content: string }[] = [];

    // Scrape each social profile if Firecrawl is available
    if (FIRECRAWL_API_KEY) {
      const urls = [
        { platform: "LinkedIn", url: profile.linkedin_url },
        { platform: "Instagram", url: profile.instagram_url },
        { platform: "Facebook", url: profile.facebook_url },
        { platform: "Twitter/X", url: profile.twitter_url },
      ].filter(item => item.url);

      for (const { platform, url } of urls) {
        if (!url) continue;

        try {
          console.log(`Scraping ${platform}: ${url}`);
          
          const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url,
              formats: ["markdown"],
              onlyMainContent: true,
            }),
          });

          if (scrapeResponse.ok) {
            const scrapeData = await scrapeResponse.json();
            const content = scrapeData.data?.markdown || scrapeData.markdown || "";
            if (content) {
              socialProfiles.push({ platform, url, content: content.substring(0, 3000) });
            }
          } else {
            console.error(`Failed to scrape ${platform}:`, await scrapeResponse.text());
            socialProfiles.push({ platform, url, content: `[Could not access - profile may be private or URL invalid]` });
          }
        } catch (error) {
          console.error(`Error scraping ${platform}:`, error);
          socialProfiles.push({ platform, url, content: `[Error accessing profile]` });
        }
      }
    }

    // Build the analysis prompt
    const profileContext = `
Profile Name: ${profile.display_name}
Occupation: ${profile.occupation || "Not specified"}
Bio: ${profile.bio || "Not provided"}

Social Media Profiles Found:
${socialProfiles.length > 0 
  ? socialProfiles.map(p => `
--- ${p.platform} (${p.url}) ---
${p.content}
`).join("\n")
  : "No social media profiles were provided or could be scraped."}
`;

    const analysisPrompt = `You are a background verification specialist for a premium matchmaking service. Your job is to review dating applicants' social media profiles for any red flags that would make them unsuitable for our community.

Analyze the following profile and their social media presence:

${profileContext}

Look for the following red flags:
1. **Fake/Bot Accounts**: Does the profile seem genuine? Are there signs of fake followers, stolen photos, or AI-generated content?
2. **Inappropriate Content**: Excessive explicit content, drug use glorification, extreme violence
3. **Harassment/Toxicity**: Evidence of harassment, bullying, hate speech, or extreme political views
4. **Relationship Red Flags**: Signs of being in a relationship, married, or patterns of concerning dating behavior
5. **Identity Concerns**: Does the social media match the profile info (name, occupation, location)?
6. **Scam Indicators**: MLM promotion, crypto scams, or other suspicious commercial activity
7. **Criminal Behavior**: Any evidence of illegal activities

Return a JSON object with:
- "status": "clean" | "flagged" | "unverified"
- "confidence": A number from 0 to 100 representing how confident you are in this assessment
- "summary": A 2-3 sentence summary of your findings
- "red_flags": An array of specific concerns found (empty if clean)
- "positive_signals": An array of positive indicators found
- "recommendation": Your recommendation for the admin (approve, investigate further, or reject)

Be thorough but fair. Not having social media is not a red flag. Having private accounts is normal. Focus on actual concerning content, not lifestyle preferences.`;

    // Analyze with AI
    console.log("Analyzing with AI...");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a thorough but fair background verification AI. Always respond with valid JSON only." },
          { role: "user", content: analysisPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("Failed to analyze profile with AI");
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;

    let analysis = {
      status: "unverified" as const,
      confidence: 0,
      summary: "Unable to analyze profile",
      red_flags: [] as string[],
      positive_signals: [] as string[],
      recommendation: "investigate",
    };

    if (content) {
      try {
        analysis = JSON.parse(content);
        console.log("Analysis result:", analysis);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
      }
    }

    // Build notes for admin
    const verificationNotes = `
## Social Verification Report
**Date:** ${new Date().toISOString()}
**Confidence:** ${analysis.confidence}%
**Recommendation:** ${analysis.recommendation}

### Summary
${analysis.summary}

${analysis.red_flags.length > 0 ? `### ⚠️ Red Flags
${analysis.red_flags.map(f => `- ${f}`).join("\n")}` : ""}

${analysis.positive_signals.length > 0 ? `### ✅ Positive Signals
${analysis.positive_signals.map(s => `- ${s}`).join("\n")}` : ""}

### Profiles Checked
${socialProfiles.length > 0 
  ? socialProfiles.map(p => `- ${p.platform}: ${p.url}`).join("\n")
  : "No social profiles provided"}
`.trim();

    // Update the profile with verification results
    const { error: updateError } = await supabase
      .from("dating_profiles")
      .update({
        social_verification_status: analysis.status,
        social_verification_notes: verificationNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      throw new Error("Failed to save verification results");
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: analysis.status,
        summary: analysis.summary,
        recommendation: analysis.recommendation,
        red_flags: analysis.red_flags,
        positive_signals: analysis.positive_signals,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-social-profiles:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
