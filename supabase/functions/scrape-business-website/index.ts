import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Scraping service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('[SCRAPE-BUSINESS] Scraping:', formattedUrl);

    // Scrape the website for branding + content
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'links', 'branding'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('[SCRAPE-BUSINESS] Firecrawl error:', scrapeData);
      return new Response(JSON.stringify({ error: 'Failed to scrape website' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = scrapeData.data || scrapeData;
    const metadata = data?.metadata || {};
    const branding = data?.branding || {};
    const markdown = data?.markdown || '';

    // Extract useful info
    const businessName = metadata?.title?.split('|')[0]?.split('-')[0]?.split('–')[0]?.trim() || '';
    const description = metadata?.description || '';
    const logoUrl = branding?.images?.logo || branding?.logo || metadata?.ogImage || '';

    // Try to determine industry from content
    const industryKeywords: Record<string, string[]> = {
      'Technology': ['software', 'tech', 'digital', 'app', 'saas', 'cloud', 'ai', 'data', 'platform'],
      'Finance': ['finance', 'banking', 'investment', 'accounting', 'insurance', 'fintech', 'wealth'],
      'Healthcare': ['health', 'medical', 'wellness', 'clinic', 'therapy', 'pharma', 'care'],
      'Real Estate': ['real estate', 'property', 'realty', 'housing', 'construction', 'architecture'],
      'Legal': ['law', 'legal', 'attorney', 'lawyer', 'litigation', 'compliance'],
      'Marketing': ['marketing', 'advertising', 'branding', 'seo', 'social media', 'creative agency', 'pr'],
      'Consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
      'Hospitality': ['restaurant', 'hotel', 'hospitality', 'catering', 'travel', 'tourism'],
      'Retail': ['retail', 'ecommerce', 'e-commerce', 'shop', 'store', 'fashion', 'clothing'],
      'Manufacturing': ['manufacturing', 'industrial', 'production', 'factory', 'engineering'],
    };

    const lowerContent = (markdown + ' ' + description + ' ' + businessName).toLowerCase();
    let detectedIndustry = '';
    let maxMatches = 0;
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      const matches = keywords.filter(k => lowerContent.includes(k)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedIndustry = industry;
      }
    }

    // Extract services from content (look for common patterns)
    const services: string[] = [];

    // Try to extract location from metadata or content
    const location = '';

    const result = {
      business_name: businessName,
      description: description.slice(0, 500),
      industry: detectedIndustry,
      logo_url: logoUrl,
      location,
      services,
      website: formattedUrl,
    };

    console.log('[SCRAPE-BUSINESS] Extracted:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[SCRAPE-BUSINESS] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process website' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
