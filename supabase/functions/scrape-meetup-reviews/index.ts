import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Review {
  name: string;
  quote: string;
  avatarUrl: string | null;
  rating: number;
  memberId?: string;
}

// Log helper for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SCRAPE-REVIEWS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reviews: Review[] = [];
    const memberAvatarMap: Map<string, string> = new Map();

    // Step 1: Scrape the main Meetup page
    const meetupUrl = 'https://www.meetup.com/makefriendsandsocialize/';
    logStep('Scraping Meetup page', { url: meetupUrl });

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: meetupUrl,
        formats: ['html', 'markdown'],
        onlyMainContent: false,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    const html = scrapeData.data?.html || scrapeData.html || '';
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';

    if (!scrapeResponse.ok) {
      console.error('Firecrawl API error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Scrape failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Scrape successful, parsing content');

    // Step 2: Extract member avatar URLs with their member IDs
    // Pattern to match member profile links with photos
    const memberWithPhotoPattern = /<a[^>]*href="[^"]*\/members\/(\d+)[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]*(?:meetupstatic\.com|secure-images)[^"]*)"[^>]*>/gi;
    let memberMatch;
    
    while ((memberMatch = memberWithPhotoPattern.exec(html)) !== null) {
      const memberId = memberMatch[1];
      let avatarUrl = memberMatch[2];
      
      // Upgrade to higher resolution
      avatarUrl = avatarUrl.replace(/\/thumb_/, '/highres_');
      if (!avatarUrl.includes('?w=')) {
        avatarUrl += (avatarUrl.includes('?') ? '&' : '?') + 'w=200';
      }
      
      if (!avatarUrl.includes('placeholder') && !memberAvatarMap.has(memberId)) {
        memberAvatarMap.set(memberId, avatarUrl);
      }
    }

    // Also try simpler pattern for member photos
    const simpleAvatarPattern = /<img[^>]*class="[^"]*(?:member|avatar|photo)[^"]*"[^>]*src="([^"]*(?:meetupstatic\.com|secure-images)[^"]*)"[^>]*>/gi;
    const avatarUrls: string[] = [];
    
    while ((memberMatch = simpleAvatarPattern.exec(html)) !== null && avatarUrls.length < 20) {
      let url = memberMatch[1];
      url = url.replace(/\/thumb_/, '/highres_');
      if (!url.includes('?w=')) {
        url += (url.includes('?') ? '&' : '?') + 'w=200';
      }
      if (!url.includes('placeholder') && !avatarUrls.includes(url)) {
        avatarUrls.push(url);
      }
    }

    logStep('Found member avatars', { fromMemberLinks: memberAvatarMap.size, fromImgTags: avatarUrls.length });

    // Step 3: Try to extract reviews from HTML - look for review/comment/testimonial sections
    // Meetup review patterns
    const reviewSectionPatterns = [
      // Look for review cards with member info
      /<div[^>]*class="[^"]*(?:review|comment|testimonial)[^"]*"[^>]*>[\s\S]*?<(?:p|div|span)[^>]*>([^<]{30,300})<\/(?:p|div|span)>[\s\S]*?<(?:span|div|a)[^>]*>([A-Z][a-z]+(?:\s+[A-Z]\.?)?)<\/(?:span|div|a)>/gi,
      // Look for blockquotes
      /<blockquote[^>]*>[\s\S]*?<p[^>]*>([^<]{30,300})<\/p>[\s\S]*?<(?:cite|footer|span)[^>]*>([A-Z][a-z]+(?:\s+[A-Z]\.?)?)<\/(?:cite|footer|span)>/gi,
    ];

    for (const pattern of reviewSectionPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && reviews.length < 10) {
        const quote = match[1].trim().replace(/^["']|["']$/g, '').replace(/<[^>]*>/g, '');
        const name = match[2].trim().replace(/<[^>]*>/g, '');
        
        if (quote.length > 25 && name.length > 2 && !reviews.some(r => r.quote === quote)) {
          reviews.push({
            name,
            quote,
            avatarUrl: null,
            rating: 5,
          });
        }
      }
    }

    // Step 4: Extract reviews from markdown
    const markdownPatterns = [
      // Quote followed by attribution
      />\s*([^>\n]{30,300})\n+(?:[-–—]\s*|\*\*)?([A-Z][a-z]+(?:\s+[A-Z]\.?)?)\*?\*?/g,
      // "Quote" - Name pattern
      /"([^"]{30,250})"\s*[-–—]\s*([A-Z][a-z]+(?:\s+[A-Z]\.?)?)/g,
      // Testimonial-like patterns
      /(?:loved|great|amazing|wonderful|fantastic)[^.!?]*[.!?][^.!?]*said\s+([A-Z][a-z]+(?:\s+[A-Z]\.?)?)/gi,
    ];

    for (const pattern of markdownPatterns) {
      let match;
      while ((match = pattern.exec(markdown)) !== null && reviews.length < 10) {
        const quote = match[1]?.trim().replace(/^["']|["']$/g, '');
        const name = match[2]?.trim();
        
        if (quote && name && quote.length > 25 && name.length > 2 && !reviews.some(r => r.quote === quote)) {
          reviews.push({
            name,
            quote,
            avatarUrl: null,
            rating: 5,
          });
        }
      }
    }

    logStep('Extracted reviews from HTML/Markdown', { count: reviews.length });

    // Step 5: Try Perplexity API for finding real reviews
    if (perplexityApiKey && reviews.length < 5) {
      logStep('Using Perplexity to find more reviews');
      
      try {
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [{
              role: 'user',
              content: `Find real member testimonials and reviews for the "MakeFriendsAndSocialize" Meetup group. 
              Return 5 reviews in this exact JSON format:
              [{"name": "First Name", "quote": "The actual review text..."}]
              Only include real reviews with actual member names. Focus on reviews that mention events, connections, or experiences.`
            }],
            search_domain_filter: ['meetup.com'],
            return_citations: true,
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          const content = perplexityData.choices?.[0]?.message?.content || '';
          
          // Try to parse JSON from the response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              const parsedReviews = JSON.parse(jsonMatch[0]);
              for (const review of parsedReviews) {
                if (review.name && review.quote && review.quote.length > 20) {
                  if (!reviews.some(r => r.quote === review.quote)) {
                    reviews.push({
                      name: review.name,
                      quote: review.quote,
                      avatarUrl: null,
                      rating: 5,
                    });
                  }
                }
              }
              logStep('Added reviews from Perplexity', { count: parsedReviews.length });
            } catch (parseError) {
              logStep('Failed to parse Perplexity response', { error: parseError });
            }
          }
        }
      } catch (perplexityError) {
        logStep('Perplexity API error', { error: perplexityError });
      }
    }

    // Step 6: Assign avatars to reviews
    // First use member-linked avatars, then fall back to generic avatars
    const allAvatars = [...memberAvatarMap.values(), ...avatarUrls];
    reviews.forEach((review, index) => {
      if (!review.avatarUrl && index < allAvatars.length) {
        review.avatarUrl = allAvatars[index];
      }
    });

    logStep('Final review count', { reviews: reviews.length, withAvatars: reviews.filter(r => r.avatarUrl).length });

    // Step 7: Store reviews in testimonials table
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    let insertedCount = 0;

    for (const review of reviews) {
      // Check if testimonial already exists by quote (to avoid duplicates)
      const { data: existing } = await supabase
        .from('testimonials')
        .select('id')
        .eq('quote', review.quote)
        .limit(1);

      if (!existing || existing.length === 0) {
        const { error } = await supabase
          .from('testimonials')
          .insert({
            name: review.name,
            quote: review.quote,
            image_url: review.avatarUrl,
            rating: review.rating,
            source: 'meetup',
            role: 'Meetup Member',
            is_approved: true,
            is_featured: true,
          });

        if (error) {
          console.error('Error inserting review:', error);
        } else {
          insertedCount++;
        }
      }
    }

    logStep('Inserted new reviews', { count: insertedCount });

    // Step 8: Update existing Meetup testimonials with avatar URLs if they don't have one
    if (allAvatars.length > 0) {
      const { data: meetupTestimonials } = await supabase
        .from('testimonials')
        .select('id, name, image_url')
        .eq('source', 'meetup')
        .is('image_url', null);

      if (meetupTestimonials) {
        let avatarIndex = 0;
        for (const testimonial of meetupTestimonials) {
          if (avatarIndex < allAvatars.length) {
            await supabase
              .from('testimonials')
              .update({ image_url: allAvatars[avatarIndex] })
              .eq('id', testimonial.id);
            avatarIndex++;
          }
        }
        logStep('Updated testimonials with avatars', { count: Math.min(meetupTestimonials.length, allAvatars.length) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reviewsFound: reviews.length,
          reviewsInserted: insertedCount,
          avatarsFound: allAvatars.length,
          memberAvatarsLinked: memberAvatarMap.size,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-meetup-reviews function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
