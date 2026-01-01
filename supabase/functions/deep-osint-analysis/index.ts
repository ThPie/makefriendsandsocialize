import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MemberData {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  country?: string;
  jobTitle?: string;
  industry?: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  scanType?: 'automatic' | 'manual' | 'periodic';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const memberData: MemberData = await req.json();
    const { userId, firstName, lastName, email, city, country, jobTitle, industry, bio, socialLinks, scanType = 'manual' } = memberData;

    console.log('Starting OSINT analysis for user:', userId);

    const findings: Record<string, unknown> = {};
    const redFlags: string[] = [];
    const positiveSignals: string[] = [];
    const sourcesChecked: string[] = [];
    let identityScore = 50;
    let socialConsistencyScore = 50;

    // 1. Basic Identity Checks
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    
    if (email) {
      // Check email domain reputation
      const emailDomain = email.split('@')[1];
      const disposableEmailDomains = ['tempmail.com', 'guerrillamail.com', 'mailinator.com', 'throwaway.email', '10minutemail.com'];
      
      if (disposableEmailDomains.some(d => emailDomain?.includes(d))) {
        redFlags.push('Disposable email address detected');
        identityScore -= 20;
      } else {
        positiveSignals.push('Using non-disposable email domain');
        identityScore += 5;
      }
      
      sourcesChecked.push(`Email domain check: ${emailDomain}`);
      findings.emailAnalysis = { domain: emailDomain, isDisposable: disposableEmailDomains.some(d => emailDomain?.includes(d)) };
    }

    // 2. Web Search with Perplexity (if available)
    if (perplexityApiKey && fullName) {
      try {
        console.log('Running Perplexity web search...');
        
        // Search for news/public records
        const searchQueries = [
          `"${fullName}" ${city || ''} ${country || ''} news OR court OR arrest OR fraud`,
          `"${fullName}" ${jobTitle || ''} ${industry || ''} professional background`,
        ];

        for (const query of searchQueries) {
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
                  content: 'You are a background check analyst. Provide factual findings about the person. Be objective and note any concerning information or positive professional signals. If you find nothing notable, say "No significant findings."' 
                },
                { role: 'user', content: `Search for information about: ${query}` }
              ],
              search_recency_filter: 'year',
            }),
          });

          if (perplexityResponse.ok) {
            const data = await perplexityResponse.json();
            const content = data.choices?.[0]?.message?.content || '';
            const citations = data.citations || [];
            
            sourcesChecked.push(...citations.slice(0, 5));
            
            if (!findings.webSearchResults) {
              findings.webSearchResults = [];
            }
            (findings.webSearchResults as Array<{query: string; result: string; citations: string[]}>).push({
              query,
              result: content,
              citations,
            });

            // Check for concerning keywords
            const concerningKeywords = ['arrested', 'convicted', 'fraud', 'scam', 'lawsuit', 'charged', 'indicted', 'accused'];
            const positiveKeywords = ['award', 'recognized', 'published', 'founded', 'executive', 'speaker', 'expert'];
            
            concerningKeywords.forEach(keyword => {
              if (content.toLowerCase().includes(keyword)) {
                redFlags.push(`Web search found mention of "${keyword}"`);
                identityScore -= 10;
              }
            });

            positiveKeywords.forEach(keyword => {
              if (content.toLowerCase().includes(keyword)) {
                positiveSignals.push(`Web search found positive mention: "${keyword}"`);
                identityScore += 5;
              }
            });
          }
        }
      } catch (error) {
        console.error('Perplexity search error:', error);
        findings.perplexityError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // 3. Social Media Scraping with Firecrawl (if available)
    if (firecrawlApiKey && socialLinks) {
      try {
        console.log('Running Firecrawl social media analysis...');
        
        const socialProfiles = Object.entries(socialLinks).filter(([_, url]) => url);
        
        for (const [platform, url] of socialProfiles) {
          if (!url) continue;
          
          try {
            const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${firecrawlApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url,
                formats: ['markdown'],
                onlyMainContent: true,
              }),
            });

            if (firecrawlResponse.ok) {
              const data = await firecrawlResponse.json();
              sourcesChecked.push(url);
              
              if (!findings.socialProfiles) {
                findings.socialProfiles = {};
              }
              (findings.socialProfiles as Record<string, unknown>)[platform] = {
                url,
                scraped: true,
                content: data.data?.markdown?.substring(0, 2000) || 'No content retrieved',
              };
              
              // Check name consistency
              const profileContent = data.data?.markdown?.toLowerCase() || '';
              if (fullName && profileContent.includes(fullName.toLowerCase())) {
                positiveSignals.push(`Name matches on ${platform}`);
                socialConsistencyScore += 10;
              }
              
              // Check for job title match
              if (jobTitle && profileContent.includes(jobTitle.toLowerCase())) {
                positiveSignals.push(`Job title verified on ${platform}`);
                socialConsistencyScore += 5;
              }
            }
          } catch (error) {
            console.error(`Error scraping ${platform}:`, error);
          }
        }

        // Check social profile consistency
        if (Object.keys(socialProfiles).length >= 2) {
          positiveSignals.push('Multiple social profiles provided');
          socialConsistencyScore += 10;
        }
      } catch (error) {
        console.error('Firecrawl error:', error);
        findings.firecrawlError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // 4. AI Analysis with Lovable AI
    let riskAssessment = '';
    let aiRecommendation: 'approve' | 'investigate' | 'suspend' | 'remove' = 'approve';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (lovableApiKey) {
      try {
        console.log('Running AI threat analysis...');
        
        const analysisPrompt = `You are a security analyst reviewing a member application for a private social club. Analyze the following information and provide a risk assessment.

Member Information:
- Name: ${fullName || 'Not provided'}
- Email: ${email || 'Not provided'}
- Location: ${city || ''}, ${country || ''}
- Job Title: ${jobTitle || 'Not provided'}
- Industry: ${industry || 'Not provided'}
- Bio: ${bio || 'Not provided'}

Investigation Findings:
- Red Flags Found: ${redFlags.length > 0 ? redFlags.join(', ') : 'None'}
- Positive Signals: ${positiveSignals.length > 0 ? positiveSignals.join(', ') : 'None'}
- Current Identity Score: ${identityScore}/100
- Social Consistency Score: ${socialConsistencyScore}/100

Web Search Results:
${JSON.stringify(findings.webSearchResults || 'No web search performed', null, 2)}

Provide your analysis in the following format:
1. RISK ASSESSMENT: (2-3 sentences summarizing overall risk)
2. SEVERITY: (low, medium, high, or critical)
3. RECOMMENDATION: (approve, investigate, suspend, or remove)
4. REASONING: (Brief explanation of your recommendation)`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are an expert security analyst with experience in background checks, fraud detection, and risk assessment. Be thorough but fair in your analysis.' },
              { role: 'user', content: analysisPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices?.[0]?.message?.content || '';
          
          riskAssessment = aiContent;
          findings.aiAnalysis = aiContent;

          // Parse AI recommendations
          const severityMatch = aiContent.toLowerCase().match(/severity:\s*(low|medium|high|critical)/);
          if (severityMatch) {
            severity = severityMatch[1] as typeof severity;
          }

          const recommendationMatch = aiContent.toLowerCase().match(/recommendation:\s*(approve|investigate|suspend|remove)/);
          if (recommendationMatch) {
            aiRecommendation = recommendationMatch[1] as typeof aiRecommendation;
          }
        }
      } catch (error) {
        console.error('AI analysis error:', error);
        findings.aiError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Determine final status based on findings
    let status: 'pending' | 'clean' | 'flagged' | 'under_review' = 'pending';
    
    if (redFlags.length === 0 && severity === 'low') {
      status = 'clean';
    } else if (['critical', 'high'].includes(severity)) {
      status = 'flagged';
    } else if (redFlags.length > 0 || ['medium'].includes(severity)) {
      status = 'under_review';
    }

    // Clamp scores
    identityScore = Math.max(0, Math.min(100, identityScore));
    socialConsistencyScore = Math.max(0, Math.min(100, socialConsistencyScore));

    // Save report to database
    const { data: report, error: insertError } = await supabase
      .from('member_security_reports')
      .insert({
        user_id: userId,
        scan_type: scanType,
        status,
        severity,
        findings,
        red_flags: redFlags,
        positive_signals: positiveSignals,
        identity_score: identityScore,
        social_consistency_score: socialConsistencyScore,
        risk_assessment: riskAssessment,
        ai_recommendation: aiRecommendation,
        sources_checked: sourcesChecked,
        scanned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving report:', insertError);
      throw insertError;
    }

    console.log('OSINT analysis complete. Report ID:', report.id);

    // Send security alert email for critical/high severity
    if (['critical', 'high'].includes(severity)) {
      try {
        console.log('Sending security alert for high/critical severity...');
        const alertResponse = await fetch(`${supabaseUrl}/functions/v1/send-security-alert`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportId: report.id,
            userId,
            severity,
            redFlags,
            aiRecommendation,
            riskAssessment,
          }),
        });
        
        if (!alertResponse.ok) {
          console.error('Failed to send security alert:', await alertResponse.text());
        } else {
          console.log('Security alert sent successfully');
        }
      } catch (alertError) {
        console.error('Error sending security alert:', alertError);
        // Don't fail the whole request if alert fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      report,
      summary: {
        status,
        severity,
        redFlagsCount: redFlags.length,
        positiveSignalsCount: positiveSignals.length,
        identityScore,
        socialConsistencyScore,
        recommendation: aiRecommendation,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OSINT analysis error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
