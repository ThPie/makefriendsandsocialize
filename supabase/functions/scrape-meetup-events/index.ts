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

    const pastEventsUrl = 'https://www.meetup.com/makefriendsandsocialize/events/?type=past';
    console.log('Scraping past events from:', pastEventsUrl);

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: pastEventsUrl,
        formats: ['html', 'markdown'],
        onlyMainContent: false,
        waitFor: 3000, // Wait for dynamic content
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

    console.log('Scrape successful, parsing past events...');

    interface ParsedEvent {
      title: string;
      date: string;
      time: string | null;
      location: string | null;
      description: string | null;
      imageUrl: string | null;
      meetupUrl: string | null;
      attendees: number | null;
    }

    const events: ParsedEvent[] = [];

    // Parse events from markdown - Meetup lists events in a structured format
    // Pattern: Event title followed by date, time, location, attendees
    const eventBlocks = markdown.split(/(?=\n##\s|\n\*\*[A-Z])/);
    
    for (const block of eventBlocks) {
      if (block.length < 50) continue;
      
      // Extract title - usually the first heading or bold text
      const titleMatch = block.match(/(?:##\s*|\*\*)(.*?)(?:\*\*|\n)/);
      if (!titleMatch) continue;
      
      const title = titleMatch[1].trim();
      if (title.length < 5 || title.length > 200) continue;
      
      // Skip navigation/menu items
      if (['Events', 'Members', 'Photos', 'Discussions', 'About'].includes(title)) continue;
      
      // Extract date - various formats like "Sat, Dec 14, 2024" or "December 14, 2024"
      const datePatterns = [
        /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
        /([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i,
        /(\d{1,2}\/\d{1,2}\/\d{4})/,
        /(\d{4}-\d{2}-\d{2})/,
      ];
      
      let eventDate: string | null = null;
      for (const pattern of datePatterns) {
        const match = block.match(pattern);
        if (match) {
          // Parse and format to ISO date
          try {
            const parsed = new Date(match[1]);
            if (!isNaN(parsed.getTime())) {
              eventDate = parsed.toISOString().split('T')[0];
              break;
            }
          } catch {
            // Try next pattern
          }
        }
      }
      
      if (!eventDate) continue; // Skip if no valid date found
      
      // Extract time
      const timeMatch = block.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
      const eventTime = timeMatch ? timeMatch[1] : null;
      
      // Extract location
      const locationMatch = block.match(/(?:at|@|Location:|📍)\s*([^,\n]{5,100})/i);
      const location = locationMatch ? locationMatch[1].trim() : null;
      
      // Extract attendees count
      const attendeesMatch = block.match(/(\d+)\s*(?:attendees?|went|attended)/i);
      const attendees = attendeesMatch ? parseInt(attendeesMatch[1], 10) : null;
      
      // Extract description (first paragraph after title)
      const descMatch = block.match(/\n\n([^*#\n][^\n]{20,500})/);
      const description = descMatch ? descMatch[1].trim() : null;

      events.push({
        title,
        date: eventDate,
        time: eventTime,
        location,
        description,
        imageUrl: null,
        meetupUrl: null,
        attendees,
      });
    }

    // Also try to extract event image URLs from HTML
    const eventImagePattern = /<img[^>]*src=["']([^"']*meetupstatic\.com\/photos\/event[^"']*)["'][^>]*>/gi;
    const eventImages: string[] = [];
    let imgMatch;
    while ((imgMatch = eventImagePattern.exec(html)) !== null && eventImages.length < events.length * 2) {
      let url = imgMatch[1];
      // Upgrade to higher resolution
      url = url.replace(/\/thumb_/, '/highres_');
      if (!eventImages.includes(url)) {
        eventImages.push(url);
      }
    }

    // Assign images to events
    events.forEach((event, index) => {
      if (eventImages[index]) {
        event.imageUrl = eventImages[index];
      }
    });

    console.log('Parsed', events.length, 'past events');

    // Store events in database
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    let insertedCount = 0;
    let updatedCount = 0;

    for (const event of events) {
      // Check if event already exists by title and date
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('title', event.title)
        .eq('date', event.date)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            time: event.time,
            location: event.location,
            description: event.description,
            image_url: event.imageUrl,
            status: 'past',
            tags: ['meetup', 'imported'],
          })
          .eq('id', existing[0].id);

        if (!error) updatedCount++;
      } else {
        // Insert new event
        const { error } = await supabase
          .from('events')
          .insert({
            title: event.title,
            date: event.date,
            time: event.time || '19:00',
            location: event.location || 'New York, NY',
            description: event.description,
            image_url: event.imageUrl,
            status: 'past',
            tier: 'patron',
            city: 'New York',
            country: 'United States',
            tags: ['meetup', 'imported'],
          });

        if (error) {
          console.error('Error inserting event:', error);
        } else {
          insertedCount++;
        }
      }
    }

    console.log('Inserted', insertedCount, 'new events, updated', updatedCount, 'existing events');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventsFound: events.length,
          eventsInserted: insertedCount,
          eventsUpdated: updatedCount,
          events: events.slice(0, 5), // Return first 5 for preview
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-meetup-events function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
