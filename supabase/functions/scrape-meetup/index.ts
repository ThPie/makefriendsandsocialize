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

    const { meetupUrl } = await req.json();
    const urlToScrape = meetupUrl || 'https://www.meetup.com/makefriendsandsocialize/';

    console.log('Scraping Meetup URL:', urlToScrape);

    // Scrape the Meetup page using Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: urlToScrape,
        formats: ['html', 'markdown'],
        onlyMainContent: false,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl API error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Scrape failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = scrapeData.data?.html || scrapeData.html || '';
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';

    console.log('Scrape successful, parsing data...');

    // Extract member count from the page
    let memberCount = 0;
    
    // Try to find member count patterns like "928 members" or "1,234 members"
    const memberPatterns = [
      /(\d{1,3}(?:,\d{3})*)\s*members/i,
      /(\d+)\s*members/i,
      /members[:\s]*(\d{1,3}(?:,\d{3})*)/i,
    ];

    for (const pattern of memberPatterns) {
      const match = markdown.match(pattern) || html.match(pattern);
      if (match) {
        memberCount = parseInt(match[1].replace(/,/g, ''), 10);
        console.log('Found member count:', memberCount);
        break;
      }
    }

    // Extract avatar URLs from the HTML
    const avatarUrls: string[] = [];
    
    // Common patterns for Meetup member avatars
    const imgPatterns = [
      /<img[^>]*src=["']([^"']*secure\.meetupstatic\.com[^"']*member[^"']*)["'][^>]*>/gi,
      /<img[^>]*src=["']([^"']*meetupstatic\.com[^"']*member[^"']*)["'][^>]*>/gi,
      /<img[^>]*src=["']([^"']*secure\.meetupstatic\.com[^"']*highres_[^"']*)["'][^>]*>/gi,
      /<img[^>]*src=["']([^"']*secure\.meetupstatic\.com\/photos\/member[^"']*)["'][^>]*>/gi,
    ];

    for (const pattern of imgPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && avatarUrls.length < 10) {
        const url = match[1];
        // Filter out default avatars and very small images
        if (!url.includes('placeholder') && !avatarUrls.includes(url)) {
          avatarUrls.push(url);
        }
      }
    }

    console.log('Found avatar URLs:', avatarUrls.length);

    // If we didn't find enough avatars, use placeholder avatars
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face',
    ];

    const finalAvatars = avatarUrls.length >= 5 ? avatarUrls.slice(0, 6) : defaultAvatars;

    // Store in Supabase
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Check if we have existing stats
    const { data: existingStats } = await supabase
      .from('meetup_stats')
      .select('id')
      .limit(1);

    let result;
    if (existingStats && existingStats.length > 0) {
      // Update existing record
      result = await supabase
        .from('meetup_stats')
        .update({
          member_count: memberCount,
          avatar_urls: finalAvatars,
          meetup_url: urlToScrape,
          last_updated: new Date().toISOString(),
        })
        .eq('id', existingStats[0].id)
        .select();
    } else {
      // Insert new record
      result = await supabase
        .from('meetup_stats')
        .insert({
          member_count: memberCount,
          avatar_urls: finalAvatars,
          meetup_url: urlToScrape,
        })
        .select();
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ success: false, error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully updated meetup stats:', result.data);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          memberCount,
          avatarUrls: finalAvatars,
          lastUpdated: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-meetup function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
