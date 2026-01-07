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

    const upcomingEventsUrl = 'https://www.meetup.com/makefriendsandsocialize/events/';
    console.log('Scraping upcoming events from:', upcomingEventsUrl);

    // Use Firecrawl's extract format with JSON schema
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: upcomingEventsUrl,
        formats: ['extract', 'html'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              events: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'The full event title/name' },
                    date: { type: 'string', description: 'Event date in YYYY-MM-DD format' },
                    time: { type: 'string', description: 'Event start time like "6:00 PM" or "18:00"' },
                    location: { type: 'string', description: 'Full venue name and address' },
                    venueName: { type: 'string', description: 'Just the venue name' },
                    description: { type: 'string', description: 'Event description or summary' },
                    imageUrl: { type: 'string', description: 'URL to the event cover image' },
                    price: { type: 'string', description: 'Ticket price if any, e.g. "$50" or "Free"' },
                  },
                  required: ['title', 'date']
                },
                description: 'List of upcoming events from the Meetup page'
              }
            },
            required: ['events']
          },
          prompt: 'Extract all upcoming events from this Meetup page. For each event, get the complete event title, the scheduled date (format as YYYY-MM-DD), the start time, the venue/location, venue name, description, event image URL, and ticket price. Focus on future events only.'
        },
        onlyMainContent: false,
        waitFor: 3000,
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

    console.log('Scrape successful, processing extracted data...');

    // Get the extracted data
    const extractedData = scrapeData.data?.extract || scrapeData.extract || {};
    const extractedEvents = extractedData.events || [];
    const html = scrapeData.data?.html || scrapeData.html || '';

    console.log('Extracted', extractedEvents.length, 'events');

    // Extract image URLs from HTML as backup
    const eventImagePattern = /<img[^>]*src=["']([^"']*meetupstatic\.com\/photos\/event[^"']*)["'][^>]*>/gi;
    const eventImages: string[] = [];
    let imgMatch;
    while ((imgMatch = eventImagePattern.exec(html)) !== null && eventImages.length < 30) {
      let url = imgMatch[1];
      url = url.replace(/\/thumb_/, '/highres_').replace(/\/clean_/, '/highres_');
      if (!eventImages.includes(url)) {
        eventImages.push(url);
      }
    }

    interface ParsedEvent {
      title: string;
      date: string;
      time: string | null;
      location: string | null;
      venueName: string | null;
      description: string | null;
      imageUrl: string | null;
      price: number | null;
    }

    // Process and validate extracted events
    const validEvents: ParsedEvent[] = [];
    let imageIndex = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const event of extractedEvents) {
      if (!event.title || !event.date) continue;
      
      // Validate and format date
      let eventDate = event.date;
      try {
        const parsed = new Date(event.date);
        if (!isNaN(parsed.getTime())) {
          eventDate = parsed.toISOString().split('T')[0];
        }
      } catch {
        // Keep original if parsing fails
      }

      // Skip if date is invalid format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) continue;

      // Skip past events
      if (eventDate < today) continue;

      // Clean title
      const title = event.title.trim();
      if (title.length < 5 || title.length > 300) continue;

      // Skip navigation items
      const skipWords = ['Events', 'Members', 'Photos', 'Discussions', 'About', 'See all', 'Load more'];
      if (skipWords.some(w => title === w || title.startsWith(w + ' '))) continue;

      // Use extracted image or fallback to scraped images
      let imageUrl = event.imageUrl || null;
      if (!imageUrl && eventImages[imageIndex]) {
        imageUrl = eventImages[imageIndex];
        imageIndex++;
      }

      // Parse price
      let price: number | null = null;
      if (event.price) {
        const priceMatch = event.price.match(/\$?(\d+(?:\.\d{2})?)/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1]);
        }
      }

      // Format time to 24h format for storage
      let formattedTime = event.time || null;
      if (formattedTime) {
        // Try to standardize time format
        const timeMatch = formattedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2];
          const period = timeMatch[3]?.toUpperCase();
          
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
      }

      validEvents.push({
        title,
        date: eventDate,
        time: formattedTime,
        location: event.location || null,
        venueName: event.venueName || null,
        description: event.description || null,
        imageUrl,
        price,
      });
    }

    console.log('Validated', validEvents.length, 'upcoming events');

    // Store events in database
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    let insertedCount = 0;
    let updatedCount = 0;

    for (const event of validEvents) {
      // Check if event already exists by title and date
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('title', event.title)
        .eq('date', event.date)
        .limit(1);

      const eventData = {
        time: event.time || '18:00',
        location: event.location || 'Salt Lake City, UT',
        venue_name: event.venueName || 'HAVN at Salt Lake Crossing',
        image_url: event.imageUrl,
        status: 'published',
        source: 'meetup',
        ticket_price: event.price || 0,
        currency: 'USD',
        tags: ['meetup', 'networking'],
        updated_at: new Date().toISOString(),
        description: event.description || 'Join us for this exciting networking event!',
      };

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', existing[0].id);

        if (!error) updatedCount++;
        else console.error('Error updating event:', error);
      } else {
        const { error } = await supabase
          .from('events')
          .insert({
            title: event.title,
            date: event.date,
            ...eventData,
            tier: 'patron',
            city: 'Salt Lake City',
            country: 'United States',
          });

        if (error) {
          console.error('Error inserting event:', error);
        } else {
          insertedCount++;
        }
      }
    }

    console.log('Inserted', insertedCount, 'new events, updated', updatedCount);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventsFound: validEvents.length,
          eventsInserted: insertedCount,
          eventsUpdated: updatedCount,
          events: validEvents,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-meetup-upcoming-events function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
