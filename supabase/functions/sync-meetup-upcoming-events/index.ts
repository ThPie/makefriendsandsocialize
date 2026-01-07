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
        formats: ['extract', 'markdown', 'html'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              events: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'The complete event title/name exactly as shown' },
                    rawDate: { type: 'string', description: 'The date text exactly as shown on the page like "THU, JAN 23, 2026"' },
                    time: { type: 'string', description: 'Event start time like "6:00 PM MST"' },
                    location: { type: 'string', description: 'Full venue name and address' },
                    venueName: { type: 'string', description: 'Just the venue name like "HAVN at Salt Lake Crossing"' },
                    description: { type: 'string', description: 'Event description or summary text' },
                    imageUrl: { type: 'string', description: 'URL to the event cover image' },
                    price: { type: 'string', description: 'Ticket price if shown, e.g. "$50.00" or "Free"' },
                    attendees: { type: 'number', description: 'Number of attendees or RSVPs shown, look for text like "47 attendees" or "23 going"' },
                  },
                  required: ['title']
                },
                description: 'All upcoming events listed on this Meetup group events page'
              }
            },
            required: ['events']
          },
          prompt: 'This is a Meetup group events page. Extract ALL upcoming events shown. For each event card, get: 1) The full event title, 2) The date shown (e.g. "THU, JAN 23, 2026"), 3) The time (e.g. "6:00 PM MST"), 4) The venue name and location, 5) Any description text, 6) The event image URL, 7) The ticket price if shown. Look for event cards that show upcoming gatherings.'
        },
        onlyMainContent: false,
        waitFor: 5000,
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
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';

    console.log('Raw extracted events:', JSON.stringify(extractedEvents, null, 2));
    console.log('Markdown preview:', markdown.substring(0, 1000));

    // Extract image URLs from HTML as backup
    const eventImagePattern = /<img[^>]*src=["']([^"']*(?:meetupstatic\.com|secure\.meetupstatic\.com)[^"']*(?:event|photo)[^"']*)["'][^>]*>/gi;
    const eventImages: string[] = [];
    let imgMatch;
    while ((imgMatch = eventImagePattern.exec(html)) !== null && eventImages.length < 30) {
      let url = imgMatch[1];
      url = url.replace(/\/thumb_/, '/highres_').replace(/\/clean_/, '/highres_');
      if (!eventImages.includes(url)) {
        eventImages.push(url);
      }
    }
    console.log('Found', eventImages.length, 'images in HTML');

    interface ParsedEvent {
      title: string;
      date: string;
      time: string | null;
      location: string | null;
      venueName: string | null;
      description: string | null;
      imageUrl: string | null;
      price: number | null;
      rsvpCount: number | null;
    }

    // Helper function to parse various date formats
    const parseEventDate = (dateStr: string): string | null => {
      if (!dateStr) return null;
      
      // Already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Parse formats like "THU, JAN 23, 2026" or "January 23, 2026" or "FRI, JAN 23"
      const months: { [key: string]: string } = {
        'JAN': '01', 'JANUARY': '01',
        'FEB': '02', 'FEBRUARY': '02',
        'MAR': '03', 'MARCH': '03',
        'APR': '04', 'APRIL': '04',
        'MAY': '05',
        'JUN': '06', 'JUNE': '06',
        'JUL': '07', 'JULY': '07',
        'AUG': '08', 'AUGUST': '08',
        'SEP': '09', 'SEPTEMBER': '09',
        'OCT': '10', 'OCTOBER': '10',
        'NOV': '11', 'NOVEMBER': '11',
        'DEC': '12', 'DECEMBER': '12',
      };
      
      const upper = dateStr.toUpperCase();
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      for (const [monthName, monthNum] of Object.entries(months)) {
        if (upper.includes(monthName)) {
          const dayMatch = dateStr.match(/(\d{1,2})/);
          const yearMatch = dateStr.match(/(\d{4})/);
          
          if (dayMatch) {
            const day = dayMatch[1].padStart(2, '0');
            const monthNumber = parseInt(monthNum);
            
            // If year is specified, use it; otherwise infer from current date
            let year = yearMatch ? parseInt(yearMatch[1]) : currentYear;
            
            // If no year specified and the month is before current month, assume next year
            if (!yearMatch && monthNumber < currentMonth) {
              year = currentYear + 1;
            }
            
            return `${year}-${monthNum}-${day}`;
          }
        }
      }
      
      // Try native Date parsing as fallback
      try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
      } catch {
        // Continue
      }
      
      return null;
    };

    // Process and validate extracted events
    const validEvents: ParsedEvent[] = [];
    let imageIndex = 0;
    const today = new Date().toISOString().split('T')[0];

    console.log('Processing', extractedEvents.length, 'extracted events');

    for (const event of extractedEvents) {
      if (!event.title) {
        console.log('Skipping event without title');
        continue;
      }
      
      // Parse date from rawDate or date field
      const dateStr = event.rawDate || event.date || '';
      const eventDate = parseEventDate(dateStr);
      
      if (!eventDate) {
        console.log('Could not parse date for event:', event.title, 'raw:', dateStr);
        continue;
      }

      // Skip past events
      if (eventDate < today) {
        console.log('Skipping past event:', event.title, eventDate);
        continue;
      }

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

      console.log('Valid event found:', title, eventDate);

      validEvents.push({
        title,
        date: eventDate,
        time: formattedTime,
        location: event.location || null,
        venueName: event.venueName || null,
        description: event.description || null,
        imageUrl,
        price,
        rsvpCount: event.attendees || null,
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
        rsvp_count: event.rsvpCount || 0,
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

    // Generate AI images for Meetup events with meetupstatic images
    let imagesGenerated = 0;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (lovableApiKey) {
      // Find events with meetupstatic images that need AI-generated images
      const { data: meetupEvents } = await supabase
        .from('events')
        .select('id, title, description, image_url')
        .eq('source', 'meetup')
        .ilike('image_url', '%meetupstatic%')
        .limit(5);

      if (meetupEvents && meetupEvents.length > 0) {
        console.log('Generating AI images for', meetupEvents.length, 'Meetup events');

        for (const meetupEvent of meetupEvents) {
          try {
            const imagePrompt = `Elegant, sophisticated event photography for "${meetupEvent.title}". Premium networking event atmosphere with warm golden lighting, dark rich colors, upscale venue ambiance. No text, no words, no logos. Ultra high resolution, cinematic composition, luxury lifestyle aesthetic.`;

            const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [{ role: 'user', content: imagePrompt }],
                modalities: ['image', 'text'],
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

              if (generatedImageUrl) {
                // Update the event with the AI-generated image
                const { error: updateError } = await supabase
                  .from('events')
                  .update({ image_url: generatedImageUrl })
                  .eq('id', meetupEvent.id);

                if (!updateError) {
                  imagesGenerated++;
                  console.log('Generated AI image for:', meetupEvent.title);
                }
              }
            }
          } catch (imgError) {
            console.error('Error generating image for', meetupEvent.title, imgError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventsFound: validEvents.length,
          eventsInserted: insertedCount,
          eventsUpdated: updatedCount,
          imagesGenerated,
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
