import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Target audience segments with their search configurations
const AUDIENCE_SEGMENTS = {
  singles: {
    name: 'Singles',
    keywords: [
      'looking for relationship',
      'tired of dating apps meaningful connection',
      'where to meet quality singles',
      'single professional dating',
      'want to find partner',
    ],
    platforms: ['reddit', 'hinge', 'bumble'],
    scoreBoost: 20,
  },
  couples: {
    name: 'Couples',
    keywords: [
      'couple looking for couple friends',
      'married couples social groups',
      'double date events',
      'couples night out activities',
      'need couple friends',
    ],
    platforms: ['facebook', 'meetup', 'reddit'],
    scoreBoost: 10,
  },
  new_in_town: {
    name: 'New in Town',
    keywords: [
      'just moved looking for friends',
      'new to city how to meet people',
      'relocated feeling lonely',
      'recently moved need social life',
      'new resident making friends',
    ],
    platforms: ['reddit', 'facebook', 'nextdoor'],
    scoreBoost: 20,
  },
  professionals: {
    name: 'Young Professionals',
    keywords: [
      'young professionals networking',
      'professional singles events',
      'after work social clubs',
      'career networking social',
      'professional happy hour',
    ],
    platforms: ['linkedin', 'meetup', 'eventbrite'],
    scoreBoost: 15,
  },
  expats: {
    name: 'Expats',
    keywords: [
      'expat community',
      'international professionals',
      'moved from abroad',
      'expat social events',
      'foreign nationals meetup',
    ],
    platforms: ['facebook', 'internations', 'meetup'],
    scoreBoost: 15,
  },
  empty_nesters: {
    name: 'Empty Nesters',
    keywords: [
      'empty nesters social groups',
      'over 50 social clubs',
      'adult children left home friends',
      'mature singles dating',
      'active seniors social',
    ],
    platforms: ['facebook', 'meetup', 'ourtime'],
    scoreBoost: 10,
  },
  newly_single: {
    name: 'Newly Single',
    keywords: [
      'recently divorced dating again',
      'newly single how to meet people',
      'getting back into dating',
      'post divorce social life',
      'starting over after breakup',
    ],
    platforms: ['reddit', 'facebook', 'bumble'],
    scoreBoost: 15,
  },
};

const TARGET_CITIES = [
  'New York',
  'Los Angeles', 
  'Chicago',
  'Miami',
  'San Francisco',
  'Boston',
  'Seattle',
  'Austin',
  'Denver',
  'Atlanta',
];

interface Lead {
  source_platform: string;
  source_url: string;
  lead_name: string;
  lead_email: string | null;
  lead_location: string;
  lead_interests: string[];
  relevance_score: number;
  outreach_suggestion: string;
  raw_content: string;
  audience_segment: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting scheduled lead discovery...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (!perplexityKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const discoveryRunId = crypto.randomUUID();
    const allLeads: Lead[] = [];
    const segmentStats: Record<string, number> = {};

    // Process each audience segment
    for (const [segmentKey, segment] of Object.entries(AUDIENCE_SEGMENTS)) {
      console.log(`\n📊 Processing segment: ${segment.name}`);
      segmentStats[segmentKey] = 0;

      // Pick 2 random cities and 2 random keywords per segment to avoid rate limits
      const selectedCities = TARGET_CITIES.sort(() => Math.random() - 0.5).slice(0, 2);
      const selectedKeywords = segment.keywords.sort(() => Math.random() - 0.5).slice(0, 2);

      for (const city of selectedCities) {
        for (const keyword of selectedKeywords) {
          const searchQuery = `${keyword} ${city} site:reddit.com OR site:facebook.com OR site:meetup.com`;
          
          console.log(`🔍 Searching: "${searchQuery}"`);

          try {
            // Search with Perplexity
            const searchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${perplexityKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'sonar',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a research assistant finding people who are looking for social connections, dating, or community. Return detailed information about posts, discussions, or profiles you find.'
                  },
                  {
                    role: 'user',
                    content: `Find recent discussions, posts, or threads where people are: ${keyword} in ${city}. Focus on genuine expressions of interest in meeting people, dating, or joining social groups. Include URLs and usernames when possible.`
                  }
                ],
                search_recency_filter: 'month',
              }),
            });

            if (!searchResponse.ok) {
              console.error(`Perplexity error: ${searchResponse.status}`);
              continue;
            }

            const searchData = await searchResponse.json();
            const searchContent = searchData.choices?.[0]?.message?.content || '';

            if (!searchContent) continue;

            // Analyze with Lovable AI
            const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  {
                    role: 'system',
                    content: `You are a lead qualification expert for an exclusive social/dating community. Analyze discussions and extract potential leads.

For each lead found, provide:
1. source_platform: reddit/facebook/meetup/twitter/other
2. source_url: URL if available, otherwise construct a plausible one
3. lead_name: username or name (can be partial)
4. lead_location: city/location mentioned
5. lead_interests: array of interests
6. relevance_score: 0-100 based on:
   - +${segment.scoreBoost} base for ${segment.name} segment
   - +20 if expressing loneliness or desire for quality connections
   - +15 if professional background mentioned
   - +15 if frustrated with dating apps
   - +10 if recently moved/new in town
   - +10 if specific interests mentioned
7. outreach_suggestion: personalized message approach
8. raw_content: the original post/comment text

Return as JSON array. Only include leads with score >= 50.`
                  },
                  {
                    role: 'user',
                    content: `Analyze this for ${segment.name} leads in ${city}:\n\n${searchContent}`
                  }
                ],
              }),
            });

            if (!analysisResponse.ok) {
              console.error(`Lovable AI error: ${analysisResponse.status}`);
              continue;
            }

            const analysisData = await analysisResponse.json();
            const analysisContent = analysisData.choices?.[0]?.message?.content || '';

            // Parse leads from response
            try {
              const jsonMatch = analysisContent.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                const leads = JSON.parse(jsonMatch[0]) as Lead[];
                const qualifiedLeads = leads.filter(l => l.relevance_score >= 50);
                
                for (const lead of qualifiedLeads) {
                  lead.audience_segment = segmentKey;
                  allLeads.push(lead);
                  segmentStats[segmentKey]++;
                }
                
                console.log(`✅ Found ${qualifiedLeads.length} qualified leads for ${segment.name} in ${city}`);
              }
            } catch (parseError) {
              console.error('Failed to parse leads:', parseError);
            }

            // Rate limiting pause
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (searchError) {
            console.error(`Search error for ${segment.name}:`, searchError);
          }
        }
      }
    }

    console.log(`\n📥 Total leads found: ${allLeads.length}`);

    // Deduplicate by source_url or lead_name
    const seenKeys = new Set<string>();
    const uniqueLeads = allLeads.filter(lead => {
      const key = lead.source_url || lead.lead_name || '';
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });

    console.log(`📥 Unique leads after dedup: ${uniqueLeads.length}`);

    // Save to database
    if (uniqueLeads.length > 0) {
      const leadsToInsert = uniqueLeads.slice(0, 50).map(lead => ({
        source_platform: lead.source_platform || 'unknown',
        source_url: lead.source_url,
        lead_name: lead.lead_name,
        lead_email: lead.lead_email,
        lead_location: lead.lead_location,
        lead_interests: lead.lead_interests || [],
        relevance_score: lead.relevance_score,
        outreach_suggestion: lead.outreach_suggestion,
        raw_content: lead.raw_content?.substring(0, 5000),
        audience_segment: lead.audience_segment,
        discovery_run_id: discoveryRunId,
        is_automated: true,
        status: 'new',
      }));

      const { error: insertError } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      console.log(`✅ Saved ${leadsToInsert.length} leads to database`);
    }

    const summary = {
      success: true,
      discovery_run_id: discoveryRunId,
      total_leads_found: uniqueLeads.length,
      leads_saved: Math.min(uniqueLeads.length, 50),
      segment_breakdown: segmentStats,
      timestamp: new Date().toISOString(),
    };

    console.log('📊 Discovery complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scheduled discovery error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
