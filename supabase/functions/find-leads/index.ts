import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from '../_shared/cors.ts';



interface SearchResult {
  url: string;
  title: string;
  description: string;
  content?: string;
}

interface Lead {
  source_platform: string;
  source_url: string | null;
  lead_name: string | null;
  lead_email: string | null;
  lead_location: string | null;
  lead_interests: string[];
  relevance_score: number;
  outreach_suggestion: string;
  raw_content: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetCities, targetKeywords, maxResults = 20 } = await req.json();

    console.log("Starting lead discovery agent...");
    console.log("Target cities:", targetCities);
    console.log("Target keywords:", targetKeywords);

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!PERPLEXITY_API_KEY || !LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required API keys");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build search queries based on cities and keywords
    const cities = targetCities?.length > 0 ? targetCities : ["New York", "Los Angeles", "Chicago", "Miami"];
    const keywords = targetKeywords?.length > 0 ? targetKeywords : ["looking for friends", "new to city", "social events", "networking group", "meet new people"];

    const allLeads: Lead[] = [];

    // Phase 1: Search using Perplexity
    console.log("Phase 1: Searching with Perplexity...");
    
    for (const city of cities.slice(0, 3)) {
      for (const keyword of keywords.slice(0, 2)) {
        const searchQuery = `${keyword} ${city} site:reddit.com OR site:facebook.com OR site:meetup.com`;
        
        try {
          const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar",
              messages: [
                {
                  role: "system",
                  content: "You are a lead discovery assistant. Find people who are actively looking to meet new people, make friends, attend social events, or join communities. Return relevant posts, profiles, or discussions."
                },
                {
                  role: "user",
                  content: `Find recent posts or discussions from people ${keyword} in ${city}. Focus on Reddit, Facebook groups, and Meetup. List the most relevant and recent results with URLs if available.`
                }
              ],
              max_tokens: 1000,
            }),
          });

          if (perplexityResponse.ok) {
            const perplexityData = await perplexityResponse.json();
            const content = perplexityData.choices?.[0]?.message?.content || "";
            const citations = perplexityData.citations || [];

            console.log(`Found ${citations.length} citations for "${keyword} ${city}"`);

            // Parse the response to extract potential leads
            if (content && citations.length > 0) {
              // Use Lovable AI to analyze and extract leads from the content
              const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${LOVABLE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages: [
                    {
                      role: "system",
                      content: `You are a lead qualification expert. Analyze social media posts and discussions to identify potential leads for a premium social/dating community.

Extract leads in this JSON format:
{
  "leads": [
    {
      "source_platform": "reddit|facebook|meetup|twitter|other",
      "source_url": "url if available or null",
      "lead_name": "username or name if mentioned, otherwise null",
      "lead_location": "city/area mentioned",
      "lead_interests": ["interest1", "interest2"],
      "relevance_score": 0-100,
      "outreach_suggestion": "personalized message suggestion",
      "raw_content": "original post or discussion snippet"
    }
  ]
}

Score leads higher if they:
- Are actively seeking social connections
- Recently moved to a new city
- Express interest in quality/curated experiences
- Mention feeling lonely or wanting meaningful connections
- Are professionals or have higher education`
                    },
                    {
                      role: "user",
                      content: `Analyze this search result and extract qualified leads:\n\nSearch: "${keyword} ${city}"\n\nContent:\n${content}\n\nCitations:\n${citations.join("\n")}`
                    }
                  ],
                  tools: [
                    {
                      type: "function",
                      function: {
                        name: "extract_leads",
                        description: "Extract qualified leads from search results",
                        parameters: {
                          type: "object",
                          properties: {
                            leads: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  source_platform: { type: "string" },
                                  source_url: { type: "string" },
                                  lead_name: { type: "string" },
                                  lead_location: { type: "string" },
                                  lead_interests: { type: "array", items: { type: "string" } },
                                  relevance_score: { type: "number" },
                                  outreach_suggestion: { type: "string" },
                                  raw_content: { type: "string" }
                                },
                                required: ["source_platform", "lead_location", "relevance_score", "outreach_suggestion", "raw_content"]
                              }
                            }
                          },
                          required: ["leads"]
                        }
                      }
                    }
                  ],
                  tool_choice: { type: "function", function: { name: "extract_leads" } }
                }),
              });

              if (analysisResponse.ok) {
                const analysisData = await analysisResponse.json();
                const toolCall = analysisData.choices?.[0]?.message?.tool_calls?.[0];
                
                if (toolCall?.function?.arguments) {
                  try {
                    const parsed = JSON.parse(toolCall.function.arguments);
                    if (parsed.leads && Array.isArray(parsed.leads)) {
                      allLeads.push(...parsed.leads.filter((l: Lead) => l.relevance_score >= 50));
                    }
                  } catch (e) {
                    console.error("Failed to parse leads:", e);
                  }
                }
              }
            }
          }
        } catch (searchError) {
          console.error(`Search error for ${keyword} ${city}:`, searchError);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Phase 2: Deep scrape high-value URLs with Firecrawl (if available)
    if (FIRECRAWL_API_KEY && allLeads.length > 0) {
      console.log("Phase 2: Deep scraping with Firecrawl...");
      
      const urlsToScrape = allLeads
        .filter(l => l.source_url && l.relevance_score >= 70)
        .slice(0, 5)
        .map(l => l.source_url);

      for (const url of urlsToScrape) {
        if (!url) continue;
        
        try {
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
            const markdown = scrapeData.data?.markdown || scrapeData.markdown;
            
            if (markdown) {
              // Update the lead with richer content
              const leadIndex = allLeads.findIndex(l => l.source_url === url);
              if (leadIndex !== -1) {
                allLeads[leadIndex].raw_content = markdown.slice(0, 2000);
              }
            }
          }
        } catch (scrapeError) {
          console.error(`Scrape error for ${url}:`, scrapeError);
        }

        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Phase 3: Save leads to database
    console.log(`Phase 3: Saving ${allLeads.length} leads to database...`);
    
    const leadsToInsert = allLeads
      .slice(0, maxResults)
      .map(lead => ({
        source_platform: lead.source_platform || "unknown",
        source_url: lead.source_url || null,
        lead_name: lead.lead_name || null,
        lead_email: lead.lead_email || null,
        lead_location: lead.lead_location || null,
        lead_interests: lead.lead_interests || [],
        relevance_score: Math.min(100, Math.max(0, lead.relevance_score || 50)),
        outreach_suggestion: lead.outreach_suggestion || "",
        raw_content: (lead.raw_content || "").slice(0, 5000),
        status: "new",
      }));

    let insertedCount = 0;
    if (leadsToInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("leads")
        .insert(leadsToInsert)
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        insertedCount = inserted?.length || 0;
      }
    }

    console.log(`Successfully inserted ${insertedCount} leads`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Discovered and saved ${insertedCount} leads`,
        summary: {
          totalFound: allLeads.length,
          savedToDb: insertedCount,
          citiesSearched: cities.slice(0, 3).length,
          keywordsUsed: keywords.slice(0, 2).length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Lead discovery error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
