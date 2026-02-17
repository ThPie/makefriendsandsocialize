import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';



serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Use Mountain Time (UTC-7) for date calculations since events are in Salt Lake City
    // This ensures events don't get marked as "past" while they're still happening locally
    const nowUtc = new Date();
    const mountainTimeOffset = -7 * 60; // UTC-7 in minutes
    const mountainTime = new Date(nowUtc.getTime() + (mountainTimeOffset * 60 * 1000) + (nowUtc.getTimezoneOffset() * 60 * 1000));
    const today = mountainTime.toISOString().split('T')[0];
    
    console.log('Starting scheduled event sync...');
    console.log('Today:', today);

    // STEP 1: Mark past events as expired
    const { data: expiredEvents, error: expireError } = await supabase
      .from('events')
      .update({ status: 'past' })
      .lt('date', today)
      .neq('status', 'past')
      .neq('status', 'cancelled')
      .select('id, title');

    if (expireError) {
      console.error('Error marking events as expired:', expireError);
    } else {
      console.log(`Marked ${expiredEvents?.length || 0} events as past`);
    }

    // STEP 2: Sync upcoming events from Meetup (if Firecrawl is configured)
    let syncResult = { eventsFound: 0, eventsInserted: 0, eventsUpdated: 0 };
    
    if (firecrawlApiKey) {
      console.log('Syncing upcoming events from Meetup...');
      
      const upcomingEventsUrl = 'https://www.meetup.com/makefriendsandsocialize/events/';
      
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: upcomingEventsUrl,
          formats: ['extract'],
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
                      price: { type: 'string', description: 'Ticket price if any' },
                      hostName: { type: 'string', description: 'Name of the group hosting the event' },
                    },
                    required: ['title', 'date']
                  },
                }
              },
              required: ['events']
            },
            prompt: 'IMPORTANT: Only extract events that are HOSTED BY "Make Friends and Socialize" group. DO NOT include "suggested events", "events near you", or events from other Meetup groups shown in sidebars. Look for events in the main content area that show "Make Friends and Socialize" as the host. For each event, extract the title, date (YYYY-MM-DD format), time, venue (should be HAVN at Salt Lake Crossing or similar Salt Lake City venues), description, and image URL.'
          },
          onlyMainContent: false,
          waitFor: 3000,
        }),
      });

      if (scrapeResponse.ok) {
        const scrapeData = await scrapeResponse.json();
        const extractedEvents = scrapeData.data?.extract?.events || scrapeData.extract?.events || [];
        
        console.log(`Found ${extractedEvents.length} events from Meetup`);

        for (const event of extractedEvents) {
          if (!event.title || !event.date) continue;
          
          // Validate date format
          let eventDate = event.date;
          try {
            const parsed = new Date(event.date);
            if (!isNaN(parsed.getTime())) {
              eventDate = parsed.toISOString().split('T')[0];
            }
          } catch {
            continue;
          }

          if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || eventDate < today) continue;

          const title = event.title.trim();
          if (title.length < 5 || title.length > 300) continue;

          // STRICT VALIDATION: Only accept events from your group
          // Check venue - should be HAVN, Salt Lake Crossing, or Salt Lake City area
          const venue = (event.venueName || event.location || '').toLowerCase();
          const host = (event.hostName || '').toLowerCase();
          
          const isValidVenue = venue.includes('havn') || 
                               venue.includes('salt lake') || 
                               venue.includes('slc') ||
                               venue === ''; // Allow if no venue specified (we'll default to HAVN)
          
          const isValidHost = host === '' || // Allow if no host extracted
                              host.includes('make friends') || 
                              host.includes('socialize');
          
          // Skip events that are clearly from other groups
          const suspiciousKeywords = ['singles mix', 'mingle', 'quiet conversation', 'speed dating', 'christian', 'jewish', 'muslim', 'hindu', 'senior', 'over 40', 'over 50', 'lgbtq'];
          const titleLower = title.toLowerCase();
          const isSuspiciousEvent = suspiciousKeywords.some(kw => titleLower.includes(kw));
          
          if (isSuspiciousEvent && !isValidVenue) {
            console.log('Skipping suspicious event (likely from another group):', title);
            continue;
          }

          // Format time
          let formattedTime = event.time || '18:00';
          const timeMatch = formattedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const period = timeMatch[3]?.toUpperCase();
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
          }

          // Parse price
          let price = 0;
          if (event.price) {
            const priceMatch = event.price.match(/\$?(\d+(?:\.\d{2})?)/);
            if (priceMatch) price = parseFloat(priceMatch[1]);
          }

          syncResult.eventsFound++;

          // Check if exists
          const { data: existing } = await supabase
            .from('events')
            .select('id')
            .eq('title', title)
            .eq('date', eventDate)
            .limit(1);

          const eventData = {
            time: formattedTime,
            location: event.location || 'Salt Lake City, UT',
            venue_name: event.venueName || 'HAVN at Salt Lake Crossing',
            image_url: event.imageUrl || null,
            status: 'published',
            source: 'meetup',
            ticket_price: price,
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
            if (!error) syncResult.eventsUpdated++;
          } else {
            const { error } = await supabase
              .from('events')
              .insert({
                title,
                date: eventDate,
                ...eventData,
                tier: 'patron',
                city: 'Salt Lake City',
                country: 'United States',
              });
            if (!error) syncResult.eventsInserted++;
          }
        }
      } else {
        console.error('Failed to scrape Meetup:', await scrapeResponse.text());
      }
    } else {
      console.log('Firecrawl not configured, skipping Meetup sync');
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      expiredEvents: expiredEvents?.length || 0,
      meetupSync: syncResult,
    };

    console.log('Scheduled sync complete:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scheduled-event-sync:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
