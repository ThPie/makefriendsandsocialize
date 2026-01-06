import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const meetupUrl = 'https://www.meetup.com/makefriendsandsocialize/';
    console.log('Scraping Meetup page for reviews:', meetupUrl);

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

    console.log('Scrape successful, parsing reviews...');

    // Extract reviews from the page
    interface Review {
      name: string;
      quote: string;
      avatarUrl: string | null;
      rating: number;
    }

    const reviews: Review[] = [];

    // Pattern to find review sections - Meetup typically shows them in a reviews/feedback area
    // Look for review patterns with member photos and quotes
    const reviewPatterns = [
      // Pattern for review text with quotation marks
      /"([^"]{20,300})"\s*[-–—]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*)?)/g,
      // Pattern for testimonial-like content
      /(?:review|testimonial|feedback)[^<]*<[^>]*>([^<]{20,300})<[^>]*>[^<]*<[^>]*>([A-Z][a-z]+(?:\s+[A-Z][a-z]*)?)/gi,
    ];

    // Try to extract reviews from markdown first
    const markdownReviewPattern = />\s*([^>\n]{30,250})\n\n[-–—]?\s*\*?\*?([A-Z][a-z]+(?:\s+[A-Z]\.?)?)\*?\*?/g;
    let match;
    while ((match = markdownReviewPattern.exec(markdown)) !== null && reviews.length < 6) {
      const quote = match[1].trim().replace(/^["']|["']$/g, '');
      const name = match[2].trim();
      
      if (quote.length > 20 && name.length > 2) {
        reviews.push({
          name,
          quote,
          avatarUrl: null,
          rating: 5,
        });
      }
    }

    // Extract member avatar URLs associated with reviews if found
    const memberAvatarPattern = /<img[^>]*src=["']([^"']*meetupstatic\.com\/photos\/member[^"']*)["'][^>]*>/gi;
    const avatarUrls: string[] = [];
    
    while ((match = memberAvatarPattern.exec(html)) !== null && avatarUrls.length < 10) {
      let url = match[1];
      // Upgrade to higher resolution
      url = url.replace(/\/thumb_/, '/highres_');
      if (!url.includes('?w=')) {
        url += (url.includes('?') ? '&' : '?') + 'w=200';
      }
      if (!avatarUrls.includes(url) && !url.includes('placeholder')) {
        avatarUrls.push(url);
      }
    }

    console.log('Found', reviews.length, 'reviews and', avatarUrls.length, 'avatar URLs');

    // Match avatars to reviews
    reviews.forEach((review, index) => {
      if (avatarUrls[index]) {
        review.avatarUrl = avatarUrls[index];
      }
    });

    // Store reviews in testimonials table
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

    console.log('Inserted', insertedCount, 'new reviews');

    // Also update existing Meetup testimonials with avatar URLs if they don't have one
    if (avatarUrls.length > 0) {
      const { data: meetupTestimonials } = await supabase
        .from('testimonials')
        .select('id, name, image_url')
        .eq('source', 'meetup')
        .is('image_url', null);

      if (meetupTestimonials) {
        let avatarIndex = 0;
        for (const testimonial of meetupTestimonials) {
          if (avatarIndex < avatarUrls.length) {
            await supabase
              .from('testimonials')
              .update({ image_url: avatarUrls[avatarIndex] })
              .eq('id', testimonial.id);
            avatarIndex++;
          }
        }
        console.log('Updated', Math.min(meetupTestimonials.length, avatarUrls.length), 'testimonials with avatars');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reviewsFound: reviews.length,
          reviewsInserted: insertedCount,
          avatarsFound: avatarUrls.length,
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
