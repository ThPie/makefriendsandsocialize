import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CIRCLES = [
  "The Gentlemen",
  "The Ladies Society",
  "Les Amis",
  "Couple's Circle",
  "Active & Outdoor",
  "Founders Circle",
  "Soul Maps",
  "Dating & Relationships",
];

const SEARCH_QUERIES = [
  "making friends as an adult tips",
  "loneliness epidemic adults",
  "how to build community",
  "professional networking events",
  "couples social activities",
  "men's mental health friendship",
  "women empowerment circles",
  "outdoor fitness social groups",
  "entrepreneur loneliness",
  "attachment style relationships",
  "slow dating movement",
  "social clubs for professionals",
  "friendship psychology research",
  "adult social skills",
  "community building trends",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pick 3 random search queries for today's research
    const shuffled = SEARCH_QUERIES.sort(() => Math.random() - 0.5);
    const todaysQueries = shuffled.slice(0, 3);

    const researchResults: any[] = [];

    for (const query of todaysQueries) {
      // Use Lovable AI to simulate trend research and analysis
      const circle = CIRCLES[Math.floor(Math.random() * CIRCLES.length)];

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
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
                content: `You are a trend researcher for MakeFriends & Socialize, a premium social club. Your job is to find trending topics on Reddit, LinkedIn, Twitter/X, Google Trends, and news sites about social connection, friendship, dating, community building, and personal growth.

Analyze real current trends and present findings as if you've searched multiple platforms. Be specific with data points, subreddit names, viral posts, and trending hashtags. Focus on what's actually trending in social/community/friendship/dating spaces.`,
              },
              {
                role: "user",
                content: `Research the current trending discussions and content around: "${query}"

Search across these platforms:
- Reddit (r/socialskills, r/MakeFriendsHere, r/dating, r/entrepreneur, r/selfimprovement)
- LinkedIn trending posts about networking and professional relationships
- Google Trends for related search terms
- Twitter/X hashtags and viral discussions
- News articles about loneliness, social clubs, community building

For the "${circle}" circle specifically, find angles that would resonate.

Return your findings using the tool provided.`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "save_research",
                  description: "Save trend research findings",
                  parameters: {
                    type: "object",
                    properties: {
                      topic: { type: "string", description: "Main topic researched" },
                      source_platforms: {
                        type: "string",
                        description: "Comma-separated platforms where trends were found (e.g. Reddit, LinkedIn, Google Trends)",
                      },
                      trend_summary: {
                        type: "string",
                        description: "300-500 word summary of what's trending and why it matters",
                      },
                      key_insights: {
                        type: "array",
                        items: { type: "string" },
                        description: "5-8 specific insights with data points",
                      },
                      suggested_title: {
                        type: "string",
                        description: "A compelling blog post title based on these trends",
                      },
                      suggested_angle: {
                        type: "string",
                        description: "The unique angle MakeFriends & Socialize should take",
                      },
                      relevance_score: {
                        type: "number",
                        description: "1-100 how relevant this is to the platform",
                      },
                    },
                    required: [
                      "topic",
                      "source_platforms",
                      "trend_summary",
                      "key_insights",
                      "suggested_title",
                      "suggested_angle",
                      "relevance_score",
                    ],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: {
              type: "function",
              function: { name: "save_research" },
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn("Rate limited, stopping research for today");
          break;
        }
        if (response.status === 402) {
          console.warn("Payment required for AI usage");
          break;
        }
        console.error("AI error:", response.status);
        continue;
      }

      const aiResult = await response.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

      if (toolCall) {
        const research = JSON.parse(toolCall.function.arguments);
        
        const { error: insertError } = await supabase
          .from("content_research")
          .insert({
            topic: research.topic,
            circle,
            source_platform: research.source_platforms,
            trend_summary: research.trend_summary,
            key_insights: research.key_insights,
            suggested_title: research.suggested_title,
            suggested_angle: research.suggested_angle,
            relevance_score: research.relevance_score,
            status: "new",
            raw_data: { query, ai_response: research },
          });

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          researchResults.push({
            topic: research.topic,
            circle,
            suggested_title: research.suggested_title,
          });
        }
      }

      // Small delay between requests
      await new Promise((r) => setTimeout(r, 2000));
    }

    console.log(`✅ Trend research complete: ${researchResults.length} findings saved`);

    return new Response(
      JSON.stringify({
        success: true,
        findings_count: researchResults.length,
        findings: researchResults,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Trend researcher error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
