import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCorsHeaders } from '../_shared/cors.ts';

const LUMA_PROFILE_URL = 'https://lu.ma/user/PieDigit';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping Luma events from:', LUMA_PROFILE_URL);

    // Use Firecrawl to scrape Luma profile page
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: LUMA_PROFILE_URL,
        formats: ['extract', 'markdown'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              events: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'The event title/name' },
                    rawDate: { type: 'string', description: 'The date as shown, e.g. "Sat, Mar 21"' },
                    time: { type: 'string', description: 'Event time, e.g. "6:00 PM"' },
                    location: { type: 'string', description: 'Venue or location name' },
                    description: { type: 'string', description: 'Event description or summary' },
                    imageUrl: { type: 'string', description: 'Event cover image URL' },
                    attendees: { type: 'number', description: 'Number of people going/registered' },
                    eventUrl: { type: 'string', description: 'Direct URL to the event page on Luma' },
                    lumaId: { type: 'string', description: 'The Luma event ID from the URL' },
                  },
                  required: ['title'],
                },
                description: 'All upcoming events listed on this Luma profile'
              }
            },
            required: ['events']
          },
          prompt: 'Extract ALL upcoming events from this Luma user profile. For each event get: title, date, time, location/venue, description, image URL, number of attendees/registrations shown, and the direct event URL. Only extract events that are in the future.'
        },
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

    const extractedData = scrapeData.data?.extract || scrapeData.extract || {};
    const extractedEvents = extractedData.events || [];
    console.log('Found', extractedEvents.length, 'Luma events');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Today in Mountain Time
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Denver',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    const currentYear = parseInt(today.split('-')[0]);
    const currentMonth = parseInt(today.split('-')[1]);

    // Month name lookup
    const months: Record<string, string> = {
      'JAN': '01', 'JANUARY': '01', 'FEB': '02', 'FEBRUARY': '02',
      'MAR': '03', 'MARCH': '03', 'APR': '04', 'APRIL': '04',
      'MAY': '05', 'JUN': '06', 'JUNE': '06', 'JUL': '07', 'JULY': '07',
      'AUG': '08', 'AUGUST': '08', 'SEP': '09', 'SEPTEMBER': '09',
      'OCT': '10', 'OCTOBER': '10', 'NOV': '11', 'NOVEMBER': '11',
      'DEC': '12', 'DECEMBER': '12',
    };

    const parseEventDate = (dateStr: string): string | null => {
      if (!dateStr) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

      const upper = dateStr.toUpperCase();
      for (const [monthName, monthNum] of Object.entries(months)) {
        if (upper.includes(monthName)) {
          const dayMatch = dateStr.match(/(\d{1,2})/);
          const yearMatch = dateStr.match(/(\d{4})/);
          if (dayMatch) {
            const day = dayMatch[1].padStart(2, '0');
            const monthNumber = parseInt(monthNum);
            let year = yearMatch ? parseInt(yearMatch[1]) : currentYear;
            if (!yearMatch && monthNumber < currentMonth) year = currentYear + 1;
            return `${year}-${monthNum}-${day}`;
          }
        }
      }

      try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
      } catch { /* skip */ }

      return null;
    };

    let insertedCount = 0;
    let updatedCount = 0;

    for (const event of extractedEvents) {
      if (!event.title?.trim()) continue;

      const title = event.title.trim();
      const dateStr = event.rawDate || event.date || '';
      const eventDate = parseEventDate(dateStr);

      if (!eventDate || eventDate < today) {
        console.log('Skipping Luma event (past or no date):', title, dateStr);
        continue;
      }

      // Parse time to 24h
      let formattedTime = event.time || null;
      if (formattedTime) {
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

      const attendeeCount = event.attendees || 0;
      const lumaId = event.lumaId || event.eventUrl?.split('/').pop() || null;

      // --- Cross-platform matching ---
      // Fetch ALL events on this date for robust matching
      const { data: dateEvents } = await supabase
        .from('events')
        .select('id, title, source, luma_id, rsvp_count, meetup_rsvp_count, eventbrite_rsvp_count, luma_rsvp_count')
        .eq('date', eventDate);

      let titleMatch = dateEvents?.find(e => e.luma_id === lumaId && lumaId) || null;

      if (!titleMatch && dateEvents) {
        titleMatch = dateEvents.find(e => {
          const existingNorm = e.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
          const words1 = new Set(normalizedTitle.split(' ').filter((w: string) => w.length > 3));
          const words2 = new Set(existingNorm.split(' ').filter((w: string) => w.length > 3));
          if (words1.size === 0 || words2.size === 0) return false;
          const intersection = [...words1].filter((w: string) => words2.has(w));
          return intersection.length / Math.min(words1.size, words2.size) >= 0.5;
        }) || null;
      }

      if (titleMatch) {
        // Merge into existing event — only update luma-specific fields, preserve tags
        const mergedRsvp = (titleMatch.meetup_rsvp_count || 0) + (titleMatch.eventbrite_rsvp_count || 0) + attendeeCount;
        const { error } = await supabase
          .from('events')
          .update({
            luma_id: lumaId,
            luma_rsvp_count: attendeeCount,
            rsvp_count: mergedRsvp,
            external_url: event.eventUrl || LUMA_PROFILE_URL,
            updated_at: new Date().toISOString(),
            source: (titleMatch.source === 'meetup' || titleMatch.source === 'eventbrite') ? titleMatch.source : 'luma',
          })
          .eq('id', titleMatch.id);

        if (!error) updatedCount++;
        else console.error('Error updating event:', error);
      } else {
        // Insert new event
        const { error } = await supabase
          .from('events')
          .insert({
            title,
            date: eventDate,
            ...eventData,
            source: 'luma',
            tier: 'patron',
            city: 'Salt Lake City',
            country: 'United States',
            rsvp_count: attendeeCount,
            meetup_rsvp_count: 0,
            eventbrite_rsvp_count: 0,
          });

        if (error) console.error('Error inserting event:', error);
        else insertedCount++;
      }
    }

    console.log(`Luma sync complete: ${insertedCount} inserted, ${updatedCount} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventsFound: extractedEvents.length,
          eventsInserted: insertedCount,
          eventsUpdated: updatedCount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-luma-events:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
