import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';



const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-BUSINESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { business_id } = await req.json();
    if (!business_id) {
      throw new Error('business_id is required');
    }

    logStep('Fetching business profile', { business_id });

    // Fetch the business profile
    const { data: business, error: businessError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      throw new Error('Business profile not found');
    }

    logStep('Business found', { name: business.business_name, website: business.website });

    // Create or update verification report with pending status
    const { data: existingReport } = await supabase
      .from('business_verification_reports')
      .select('id')
      .eq('business_id', business_id)
      .single();

    const reportData = {
      business_id,
      status: 'processing',
      sources_checked: [] as string[],
      positive_signals: [] as string[],
      red_flags: [] as string[],
      findings: {} as Record<string, any>,
    };

    if (existingReport) {
      await supabase
        .from('business_verification_reports')
        .update(reportData)
        .eq('id', existingReport.id);
    } else {
      await supabase
        .from('business_verification_reports')
        .insert(reportData);
    }

    logStep('Report created/updated, starting verification');

    let verificationScore = 50; // Base score
    const sourcesChecked: string[] = [];
    const positiveSignals: string[] = [];
    const redFlags: string[] = [];
    const findings: Record<string, any> = {};

    // 1. Verify website using Firecrawl (if available)
    if (firecrawlApiKey && business.website) {
      try {
        logStep('Scraping website with Firecrawl', { url: business.website });
        
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: business.website,
            formats: ['markdown', 'branding'],
            onlyMainContent: false,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        
        if (scrapeResponse.ok && scrapeData.success) {
          sourcesChecked.push('Website');
          findings.website = {
            accessible: true,
            title: scrapeData.data?.metadata?.title,
            description: scrapeData.data?.metadata?.description,
          };
          
          positiveSignals.push('Website is accessible and operational');
          verificationScore += 10;

          // Check if website content mentions the business name
          const markdown = scrapeData.data?.markdown || '';
          if (markdown.toLowerCase().includes(business.business_name.toLowerCase())) {
            positiveSignals.push('Business name found on website');
            verificationScore += 5;
          }

          // Check for branding consistency
          if (scrapeData.data?.branding) {
            findings.branding = scrapeData.data.branding;
            positiveSignals.push('Professional branding detected');
            verificationScore += 5;
          }
        } else {
          redFlags.push('Website could not be accessed');
          verificationScore -= 10;
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logStep('Website scrape failed', { error: errorMessage });
        redFlags.push('Website verification failed');
      }
    }

    // 2. Search for business information using Perplexity (if available)
    if (perplexityApiKey) {
      try {
        logStep('Searching for business with Perplexity');

        const searchQuery = `"${business.business_name}" ${business.industry || ''} ${business.location || ''} reviews reputation`;
        
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [
              {
                role: 'system',
                content: 'You are a business verification assistant. Analyze the business and provide factual information about its legitimacy, reputation, and online presence. Be objective and concise.',
              },
              {
                role: 'user',
                content: `Please verify the following business:
                
Business Name: ${business.business_name}
Industry: ${business.industry || 'Not specified'}
Location: ${business.location || 'Not specified'}
Website: ${business.website || 'Not provided'}
Description: ${business.description || 'Not provided'}

Please provide:
1. Is this business findable online?
2. Any reviews or ratings found?
3. Any news mentions (positive or negative)?
4. Any red flags or concerns?
5. Overall legitimacy assessment (1-10)`,
              },
            ],
            max_tokens: 1000,
          }),
        });

        const perplexityData = await perplexityResponse.json();
        
        if (perplexityResponse.ok && perplexityData.choices?.[0]?.message?.content) {
          sourcesChecked.push('Web Search');
          const aiResponse = perplexityData.choices[0].message.content;
          findings.webSearch = {
            response: aiResponse,
            citations: perplexityData.citations || [],
          };

          // Parse the AI response for signals
          const lowerResponse = aiResponse.toLowerCase();
          
          if (lowerResponse.includes('reviews') && !lowerResponse.includes('no reviews')) {
            positiveSignals.push('Online reviews found');
            verificationScore += 10;
          }
          
          if (lowerResponse.includes('established') || lowerResponse.includes('reputable')) {
            positiveSignals.push('Business appears established');
            verificationScore += 10;
          }

          if (lowerResponse.includes('legitimate') || lowerResponse.includes('verified')) {
            positiveSignals.push('Business appears legitimate');
            verificationScore += 10;
          }

          if (lowerResponse.includes('concern') || lowerResponse.includes('suspicious')) {
            redFlags.push('Some concerns identified in web search');
            verificationScore -= 15;
          }

          if (lowerResponse.includes('not found') || lowerResponse.includes('no information')) {
            redFlags.push('Limited online presence');
            verificationScore -= 5;
          }

          // Extract legitimacy score if mentioned
          const scoreMatch = aiResponse.match(/legitimacy[^0-9]*(\d+)/i);
          if (scoreMatch) {
            const aiScore = parseInt(scoreMatch[1]);
            verificationScore += (aiScore - 5) * 3; // Adjust based on AI score
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logStep('Perplexity search failed', { error: errorMessage });
      }
    }

    // 3. Basic checks
    if (business.contact_email) {
      positiveSignals.push('Contact email provided');
      verificationScore += 5;
      sourcesChecked.push('Contact Information');
    }

    if (business.services && business.services.length > 0) {
      positiveSignals.push('Services clearly defined');
      verificationScore += 5;
    }

    if (business.description && business.description.length > 100) {
      positiveSignals.push('Detailed business description');
      verificationScore += 5;
    }

    // Clamp score between 0 and 100
    verificationScore = Math.max(0, Math.min(100, verificationScore));

    // Determine recommendation
    let aiRecommendation = 'approve';
    if (verificationScore < 30) {
      aiRecommendation = 'reject';
    } else if (verificationScore < 60) {
      aiRecommendation = 'review';
    }

    logStep('Verification complete', { 
      score: verificationScore, 
      positiveSignals: positiveSignals.length,
      redFlags: redFlags.length,
    });

    // Update the report with final results
    await supabase
      .from('business_verification_reports')
      .update({
        status: 'completed',
        verification_score: verificationScore,
        sources_checked: sourcesChecked,
        positive_signals: positiveSignals,
        red_flags: redFlags,
        findings,
        ai_recommendation: aiRecommendation,
      })
      .eq('business_id', business_id);

    return new Response(
      JSON.stringify({
        success: true,
        verification_score: verificationScore,
        positive_signals: positiveSignals,
        red_flags: redFlags,
        ai_recommendation: aiRecommendation,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('ERROR', { message: errorMessage });
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
