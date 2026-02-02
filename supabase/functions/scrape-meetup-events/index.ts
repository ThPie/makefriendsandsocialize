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

    // RE-ENABLED with stricter filtering for "Make Friends and Socialize" group only
    const ENABLE_MEETUP_SCRAPE = true;

    const pastEventsUrl = 'https://www.meetup.com/makefriendsandsocialize/events/?type=past';
    console.log('Scraping past events from:', pastEventsUrl);

    // Use Firecrawl's extract format with JSON schema
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: pastEventsUrl,
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
                    time: { type: 'string', description: 'Event start time like "7:00 PM"' },
                    location: { type: 'string', description: 'Full venue name and address' },
                    attendees: { type: 'number', description: 'Number of people who attended' },
                    imageUrl: { type: 'string', description: 'URL to the event cover image' },
                  },
                  required: ['title', 'date']
                },
                description: 'List of past events from the Meetup page'
              }
            },
            required: ['events']
          },
          prompt: 'IMPORTANT: Only extract past events HOSTED BY "Make Friends and Socialize" group. DO NOT include "suggested events", "similar events", or events from other Meetup groups. Look ONLY in the main past events list. Events should typically be at HAVN at Salt Lake Crossing or Salt Lake City venues. For each event, get the complete event title, the date (YYYY-MM-DD), the start time, the venue/location, number of attendees, and the event image URL.'
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
      imageUrl: string | null;
      attendees: number | null;
    }

    // Process and validate extracted events
    const validEvents: ParsedEvent[] = [];
    let imageIndex = 0;

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

      // Clean title
      const title = event.title.trim();
      if (title.length < 5 || title.length > 300) continue;

      // Skip navigation items
      const skipWords = ['Events', 'Members', 'Photos', 'Discussions', 'About', 'See all', 'Load more'];
      if (skipWords.some(w => title === w || title.startsWith(w + ' '))) continue;

      // STRICT VALIDATION: Only accept events from "Make Friends and Socialize" group
      const venue = (event.location || '').toLowerCase();
      
      const isValidVenue = venue.includes('havn') || 
                           venue.includes('salt lake') || 
                           venue.includes('slc') ||
                           venue === '';
      
      // Skip events that are clearly from other groups
      const suspiciousKeywords = ['singles mix', 'mingle', 'quiet conversation', 'speed dating', 'christian', 'jewish', 'muslim', 'hindu', 'senior', 'over 40', 'over 50', 'lgbtq', 'divorce', 'widowed'];
      const titleLower = title.toLowerCase();
      const isSuspiciousEvent = suspiciousKeywords.some(kw => titleLower.includes(kw));
      
      if (isSuspiciousEvent && !isValidVenue) {
        console.log('Skipping past event from another group:', title);
        continue;
      }

      // Use extracted image or fallback to scraped images
      let imageUrl = event.imageUrl || null;
      if (!imageUrl && eventImages[imageIndex]) {
        imageUrl = eventImages[imageIndex];
        imageIndex++;
      }

      validEvents.push({
        title,
        date: eventDate,
        time: event.time || null,
        location: event.location || null,
        imageUrl,
        attendees: typeof event.attendees === 'number' ? event.attendees : null,
      });
    }

    console.log('Validated', validEvents.length, 'events');

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
        time: event.time || '7:00 PM',
        location: event.location || 'New York, NY',
        image_url: event.imageUrl,
        status: 'past',
        source: 'meetup',
        tags: ['meetup', 'imported'],
        updated_at: new Date().toISOString(),
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
            city: 'New York',
            country: 'United States',
            description: event.attendees ? `${event.attendees} attendees` : 'Imported from Meetup',
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
          events: validEvents.slice(0, 5),
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