import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Meetup sync — ATTENDEE-ONLY mode.
 * Two-phase approach:
 * 1. Scrape the listing page for event links
 * 2. Scrape each individual event page for accurate attendee counts
 * Meetup never creates new events — only updates meetup_rsvp_count on existing DB events.
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Today in Mountain Time
    const MEETUP_TIME_ZONE = 'America/Denver';
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: MEETUP_TIME_ZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    // PHASE 1: Discover all event URLs from the group page using Firecrawl map
    const groupUrl = 'https://www.meetup.com/makefriendsandsocialize/';
    console.log('Phase 1: Mapping event URLs from:', groupUrl);

    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: groupUrl,
        search: 'events',
        limit: 100,
        includeSubdomains: false,
      }),
    });

    const mapData = await mapResponse.json();
    const allLinks: string[] = mapData.links || mapData.data?.links || [];
    
    // Filter for individual event page URLs (pattern: /events/XXXXXX/)
    const eventUrlPattern = /\/makefriendsandsocialize\/events\/(\d+)\/?/;
    const eventUrls = [...new Set(
      allLinks
        .filter((link: string) => eventUrlPattern.test(link))
        .map((link: string) => {
          const match = link.match(eventUrlPattern);
          return match ? `https://www.meetup.com/makefriendsandsocialize/events/${match[1]}/` : null;
        })
        .filter(Boolean) as string[]
    )];

    console.log(`Found ${eventUrls.length} individual event URLs:`, eventUrls);

    // PHASE 2: Scrape each individual event page for title, date, and attendee count
    const months: Record<string, string> = {
      'JAN': '01', 'JANUARY': '01', 'FEB': '02', 'FEBRUARY': '02',
      'MAR': '03', 'MARCH': '03', 'APR': '04', 'APRIL': '04',
      'MAY': '05', 'JUN': '06', 'JUNE': '06', 'JUL': '07', 'JULY': '07',
      'AUG': '08', 'AUGUST': '08', 'SEP': '09', 'SEPTEMBER': '09',
      'OCT': '10', 'OCTOBER': '10', 'NOV': '11', 'NOVEMBER': '11',
      'DEC': '12', 'DECEMBER': '12',
    };

    const [currentYearStr, currentMonthStr] = today.split('-');
    const currentYear = Number(currentYearStr);
    const currentMonth = Number(currentMonthStr);

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

    // Scrape each event page
    interface MeetupEvent {
      title: string;
      date: string | null;
      attendees: number;
    }
    const meetupEvents: MeetupEvent[] = [];

    for (const eventUrl of eventUrls) {
      try {
        console.log('Scraping individual event page:', eventUrl);
        const scrapeResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: eventUrl,
            formats: ['extract'],
            extract: {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'The event title/name' },
                  date: { type: 'string', description: 'The event date, e.g. "Wed, Apr 2, 2026"' },
                  attendeeCount: { type: 'number', description: 'The number of attendees shown on the page (look for a number near "Attendees" heading)' },
                },
                required: ['title', 'date', 'attendeeCount']
              },
              prompt: 'Extract the event title, date, and the attendee count number shown near the "Attendees" section heading.'
            },
            waitFor: 3000,
          }),
        });

        const scrapeData = await scrapeResp.json();
        const extracted = scrapeData.data?.extract || scrapeData.extract;

        if (extracted?.title) {
          const eventDate = parseEventDate(extracted.date || '');
          meetupEvents.push({
            title: extracted.title.trim(),
            date: eventDate,
            attendees: extracted.attendeeCount || 0,
          });
          console.log(`  → "${extracted.title}" | ${eventDate} | ${extracted.attendeeCount} attendees`);
        }
      } catch (err) {
        console.error('Error scraping event page:', eventUrl, err);
      }
    }

    console.log(`Phase 2 complete: scraped ${meetupEvents.length} events`);

    // PHASE 3: Match with existing DB events and update meetup_rsvp_count
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

    for (const event of meetupEvents) {
      if (!event.title || !event.date || event.date < today) {
        console.log('Skipping (past or no date):', event.title);
        continue;
      }

      const meetupRsvp = event.attendees || 0;
      const sameDateEvents = existingByDate.get(event.date) || [];
      const normalizedTitle = normalizeTitle(event.title);
      let matchingEvent: any = null;

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
          console.log(`Matched: "${event.title}" ↔ "${existing.title}"`);
          break;
        }
      }

      if (matchingEvent) {
        const totalRsvp = meetupRsvp + (matchingEvent.eventbrite_rsvp_count || 0) + (matchingEvent.luma_rsvp_count || 0);
        const { error } = await supabase
          .from('events')
          .update({
            meetup_rsvp_count: meetupRsvp,
            rsvp_count: totalRsvp,
            updated_at: new Date().toISOString(),
          })
          .eq('id', matchingEvent.id);

        if (!error) {
          updatedCount++;
          console.log(`Updated "${matchingEvent.title}": meetup=${meetupRsvp}, total=${totalRsvp}`);
        } else {
          console.error('Error updating event:', error);
        }
      } else {
        console.log('No matching DB event for Meetup event:', event.title, event.date);
        skippedCount++;
      }
    }

    console.log(`Meetup sync complete: ${updatedCount} updated, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventUrlsFound: eventUrls.length,
          eventsScraped: meetupEvents.length,
          eventsUpdated: updatedCount,
          eventsSkipped: skippedCount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-meetup-upcoming-events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
