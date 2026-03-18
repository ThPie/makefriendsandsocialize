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

// Diverse search queries rotated daily — covering the entire internet
const SEARCH_QUERIES = [
  // Reddit-focused
  "site:reddit.com making friends as an adult 2025 2026",
  "site:reddit.com loneliness epidemic solutions",
  "site:reddit.com social clubs for professionals",
  "site:reddit.com men's groups brotherhood vulnerability",
  "site:reddit.com women's circles empowerment community",
  "site:reddit.com couples social life tips",
  "site:reddit.com entrepreneur loneliness networking",
  // LinkedIn-focused
  "site:linkedin.com professional networking community building trends",
  "site:linkedin.com founders circle mastermind groups",
  "site:linkedin.com women leadership community",
  // Twitter/X-focused
  "site:x.com OR site:twitter.com adult friendship loneliness trending",
  "site:x.com OR site:twitter.com social clubs community viral",
  // News & blogs
  "adult friendship crisis 2025 2026 research study",
  "loneliness epidemic solutions community clubs",
  "slow dating movement intentional relationships trend",
  "attachment style dating psychology trending",
  "men mental health friendship groups rising",
  "women empowerment circles social clubs growing",
  "couples socializing double dates community trend",
  "outdoor adventure social bonding fitness groups",
  "francophone community building expats networking",
  "personality quizzes self-awareness social media trending",
  "social skills adults tips viral",
  "networking events alternatives community based",
  "relationship psychology trending topics",
  "friendship recession statistics latest",
];

/** Use Perplexity to search the real internet */
async function searchWithPerplexity(
  query: string,
  apiKey: string
): Promise<{ content: string; citations: string[] }> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content:
            "You are a trend research analyst. Find the most recent, specific, and data-rich information. Include exact numbers, dates, quotes, subreddit names, hashtags, viral post details, and article titles. Be extremely specific — no generic summaries.",
        },
        {
          role: "user",
          content: `Search the internet for the latest trending discussions, viral posts, news articles, and data about: "${query}"

Include:
- Specific Reddit threads with upvote counts and subreddit names
- LinkedIn viral posts with engagement numbers
- Twitter/X trending hashtags and viral tweets
- Recent news articles with publication dates
- Google Trends data or search volume insights
- TikTok or Instagram trends if relevant
- Academic studies or surveys published recently

Be extremely specific with URLs, dates, and numbers.`,
        },
      ],
      search_recency_filter: "month",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Perplexity error:", response.status, errText);
    throw new Error(`Perplexity search failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
  };
}

/** Use Firecrawl to scrape a specific trending page for deeper content */
async function scrapeWithFirecrawl(
  url: string,
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) return "";
    const data = await response.json();
    // Truncate to avoid massive payloads
    const markdown = data.data?.markdown || data.markdown || "";
    return markdown.slice(0, 3000);
  } catch {
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pick 3 random queries for this run
    const shuffled = [...SEARCH_QUERIES].sort(() => Math.random() - 0.5);
    const todaysQueries = shuffled.slice(0, 3);

    const researchResults: any[] = [];

    for (const query of todaysQueries) {
      const circle = CIRCLES[Math.floor(Math.random() * CIRCLES.length)];

      // Step 1: Real internet search via Perplexity
      console.log(`🔍 Searching: "${query}"`);
      let searchResult: { content: string; citations: string[] };
      try {
        searchResult = await searchWithPerplexity(query, PERPLEXITY_API_KEY);
      } catch (err) {
        console.error("Perplexity search failed:", err);
        continue;
      }

      // Step 2: Optionally scrape the top citation for deeper content
      let scrapedContent = "";
      if (FIRECRAWL_API_KEY && searchResult.citations.length > 0) {
        const topUrl = searchResult.citations[0];
        console.log(`📄 Scraping: ${topUrl}`);
        scrapedContent = await scrapeWithFirecrawl(topUrl, FIRECRAWL_API_KEY);
      }

      // Step 3: Use AI to analyze the real search results and produce structured research
      const analysisResponse = await fetch(
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
                content: `You are a content strategist for MakeFriends & Socialize, a premium social club. Analyze real internet research data and extract actionable insights for blog content creation.

The club has these circles: The Gentlemen, The Ladies Society, Les Amis (Francophone), Couple's Circle, Active & Outdoor, Founders Circle, Soul Maps (psychology quizzes), and Dating & Relationships (slow dating).`,
              },
              {
                role: "user",
                content: `Here are REAL search results from across the internet about "${query}":

--- SEARCH RESULTS ---
${searchResult.content}

--- SOURCES ---
${searchResult.citations.join("\n")}

${scrapedContent ? `--- SCRAPED ARTICLE CONTENT ---\n${scrapedContent.slice(0, 2000)}` : ""}

Analyze these real findings for the "${circle}" circle. Focus on what's genuinely trending right now and how MakeFriends & Socialize can create content that rides these trends.

Return your analysis using the tool provided.`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "save_research",
                  description: "Save analyzed trend research",
                  parameters: {
                    type: "object",
                    properties: {
                      topic: {
                        type: "string",
                        description: "Specific trending topic identified",
                      },
                      source_platforms: {
                        type: "string",
                        description: "Actual platforms where this was found (e.g. Reddit r/socialskills, LinkedIn, NYTimes)",
                      },
                      trend_summary: {
                        type: "string",
                        description: "400-600 word summary with specific data points, URLs, quotes, and viral content details from the real search results",
                      },
                      key_insights: {
                        type: "array",
                        items: { type: "string" },
                        description: "5-8 specific, data-backed insights from the real search results",
                      },
                      suggested_title: {
                        type: "string",
                        description: "SEO-optimized blog title that rides this trend (under 60 chars)",
                      },
                      suggested_angle: {
                        type: "string",
                        description: "The unique angle MakeFriends & Socialize should take, tied to specific circle features",
                      },
                      relevance_score: {
                        type: "number",
                        description: "1-100 relevance to the platform based on virality, timeliness, and audience fit",
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

      if (!analysisResponse.ok) {
        if (analysisResponse.status === 429 || analysisResponse.status === 402) {
          console.warn(`AI rate limited (${analysisResponse.status}), stopping`);
          break;
        }
        console.error("AI analysis error:", analysisResponse.status);
        continue;
      }

      const aiResult = await analysisResponse.json();
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
            raw_data: {
              query,
              citations: searchResult.citations,
              perplexity_content: searchResult.content.slice(0, 2000),
            },
          });

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          researchResults.push({
            topic: research.topic,
            circle,
            suggested_title: research.suggested_title,
            sources: searchResult.citations.slice(0, 3),
          });
          console.log(`✅ Saved research: "${research.topic}" (score: ${research.relevance_score})`);
        }
      }

      // Delay between queries to respect rate limits
      await new Promise((r) => setTimeout(r, 3000));
    }

    console.log(`🏁 Research complete: ${researchResults.length} findings from real internet data`);

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
