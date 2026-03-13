import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCorsHeaders } from '../_shared/cors.ts';

const LUMA_PROFILE_URL = 'https://lu.ma/user/PieDigit';

/**
 * Luma sync — ATTENDEE-ONLY mode.
 * Luma never creates new events. It only updates luma_rsvp_count
 * on existing events (owned by Eventbrite) when a fuzzy title match is found.
 */
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

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: LUMA_PROFILE_URL,
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
                    title: { type: 'string', description: 'The event title/name' },
                    rawDate: { type: 'string', description: 'The date as shown, e.g. "Sat, Mar 21"' },
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
          prompt: 'Extract ALL upcoming events from this Luma user profile. For each event get: title, date, number of attendees/registrations, and the direct event URL. Only extract future events.'
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

    const extractedEvents = scrapeData.data?.extract?.events || scrapeData.extract?.events || [];
    console.log('Found', extractedEvents.length, 'Luma events');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Today in Mountain Time
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Denver',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    const currentYear = parseInt(today.split('-')[0]);
    const currentMonth = parseInt(today.split('-')[1]);

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

    const normalizeTitle = (t: string): string =>
      t.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    // Get ALL existing future events for matching
    const { data: allExistingEvents } = await supabase
      .from('events')
      .select('id, title, date, luma_id, meetup_rsvp_count, eventbrite_rsvp_count, luma_rsvp_count')
      .gte('date', today)
      .neq('status', 'cancelled');

    const existingByDate = new Map<string, typeof allExistingEvents>();
    if (allExistingEvents) {
      for (const e of allExistingEvents) {
        const dateEvents = existingByDate.get(e.date) || [];
        dateEvents.push(e);
        existingByDate.set(e.date, dateEvents);
      }
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const event of extractedEvents) {
      if (!event.title?.trim()) continue;

      const title = event.title.trim();
      const dateStr = event.rawDate || event.date || '';
      const eventDate = parseEventDate(dateStr);

      if (!eventDate || eventDate < today) {
        console.log('Skipping Luma event (past or no date):', title);
        continue;
      }

      const attendeeCount = event.attendees || 0;
      const lumaId = event.lumaId || event.eventUrl?.split('/').pop() || null;

      // Find matching existing event
      const sameDateEvents = existingByDate.get(eventDate) || [];
      let matchingEvent: any = null;

      // First try luma_id match
      if (lumaId) {
        matchingEvent = sameDateEvents.find((e: any) => e.luma_id === lumaId) || null;
      }

      // Then try fuzzy title match
      if (!matchingEvent) {
        const normalizedTitle = normalizeTitle(title);
        for (const existing of sameDateEvents) {
          const existingNorm = normalizeTitle(existing.title);
          if (normalizedTitle === existingNorm) {
            matchingEvent = existing;
            break;
          }
          const wordsA = new Set<string>(normalizedTitle.split(' ').filter((w: string) => w.length > 3));
          const wordsB = new Set<string>(existingNorm.split(' ').filter((w: string) => w.length > 3));
          if (wordsA.size === 0 || wordsB.size === 0) continue;
          const intersection = [...wordsA].filter((w: string) => wordsB.has(w));
          const similarity = intersection.length / Math.min(wordsA.size, wordsB.size);
          if (similarity >= 0.5) {
            matchingEvent = existing;
            console.log(`Luma matched: "${title}" ↔ "${existing.title}"`);
            break;
          }
        }
      }

      if (matchingEvent) {
        // Only update luma-specific fields — do NOT touch Eventbrite-owned fields
        const totalRsvp = (matchingEvent.meetup_rsvp_count || 0) + (matchingEvent.eventbrite_rsvp_count || 0) + attendeeCount;
        const { error } = await supabase
          .from('events')
          .update({
            luma_id: lumaId,
            luma_rsvp_count: attendeeCount,
            rsvp_count: totalRsvp,
            updated_at: new Date().toISOString(),
          })
          .eq('id', matchingEvent.id);

        if (!error) updatedCount++;
        else console.error('Error updating event:', error);
      } else {
        // No matching event found — skip (Eventbrite owns event creation)
        console.log('No matching Eventbrite event for Luma event, skipping:', title, eventDate);
        skippedCount++;
      }
    }

    console.log(`Luma sync complete: ${updatedCount} updated, ${skippedCount} skipped (no match)`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventsFound: extractedEvents.length,
          eventsUpdated: updatedCount,
          eventsSkipped: skippedCount,
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
