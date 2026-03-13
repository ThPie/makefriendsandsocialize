import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Meetup sync — ATTENDEE-ONLY mode.
 * Meetup never creates new events. It only updates meetup_rsvp_count
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

    const upcomingEventsUrl = 'https://www.meetup.com/makefriendsandsocialize/events/';
    console.log('Scraping upcoming events from:', upcomingEventsUrl);

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
                    title: { type: 'string', description: 'The complete event title/name exactly as shown' },
                    rawDate: { type: 'string', description: 'The date text exactly as shown on the page like "THU, JAN 23, 2026"' },
                    attendees: { type: 'number', description: 'Number of attendees or RSVPs shown' },
                  },
                  required: ['title']
                },
                description: 'All upcoming events listed on this Meetup group events page'
              }
            },
            required: ['events']
          },
          prompt: 'IMPORTANT: Only extract events HOSTED BY "Make Friends and Socialize" group. DO NOT include "suggested events" or events from other groups. For each event get the title, date, and attendee count.'
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
    console.log('Found', extractedEvents.length, 'Meetup events');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Today in Mountain Time
    const MEETUP_TIME_ZONE = 'America/Denver';
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: MEETUP_TIME_ZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    const [currentYearStr, currentMonthStr] = today.split('-');
    const currentYear = Number(currentYearStr);
    const currentMonth = Number(currentMonthStr);

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
      .select('id, title, date, meetup_rsvp_count, eventbrite_rsvp_count, luma_rsvp_count')
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
        console.log('Skipping Meetup event (past or no date):', title);
        continue;
      }

      const meetupRsvp = event.attendees || 0;

      // Find matching existing event by fuzzy title on the same date
      const sameDateEvents = existingByDate.get(eventDate) || [];
      const normalizedTitle = normalizeTitle(title);
      let matchingEvent: any = null;

      for (const existing of sameDateEvents) {
        const existingNorm = normalizeTitle(existing.title);
        // Exact match
        if (normalizedTitle === existingNorm) {
          matchingEvent = existing;
          break;
        }
        // Fuzzy word-overlap match
        const wordsA = new Set<string>(normalizedTitle.split(' ').filter((w: string) => w.length > 3));
        const wordsB = new Set<string>(existingNorm.split(' ').filter((w: string) => w.length > 3));
        if (wordsA.size === 0 || wordsB.size === 0) continue;
        const intersection = [...wordsA].filter((w: string) => wordsB.has(w));
        const similarity = intersection.length / Math.min(wordsA.size, wordsB.size);
        if (similarity >= 0.5) {
          matchingEvent = existing;
          console.log(`Meetup matched: "${title}" ↔ "${existing.title}"`);
          break;
        }
      }

      if (matchingEvent) {
        // Only update meetup_rsvp_count and recalculate total — do NOT touch Eventbrite-owned fields
        const totalRsvp = meetupRsvp + (matchingEvent.eventbrite_rsvp_count || 0) + (matchingEvent.luma_rsvp_count || 0);
        const { error } = await supabase
          .from('events')
          .update({
            meetup_rsvp_count: meetupRsvp,
            rsvp_count: totalRsvp,
            updated_at: new Date().toISOString(),
          })
          .eq('id', matchingEvent.id);

        if (!error) updatedCount++;
        else console.error('Error updating event:', error);
      } else {
        // No matching event found — skip (Eventbrite owns event creation)
        console.log('No matching Eventbrite event for Meetup event, skipping:', title, eventDate);
        skippedCount++;
      }
    }

    console.log(`Meetup sync complete: ${updatedCount} updated, ${skippedCount} skipped (no match)`);

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
    console.error('Error in sync-meetup-upcoming-events function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
