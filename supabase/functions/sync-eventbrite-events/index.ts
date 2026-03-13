import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCorsHeaders } from '../_shared/cors.ts';

// Normalize title for fuzzy matching
const normalizeTitle = (t: string) =>
  t.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

// Calculate word-overlap similarity between two titles
const titleSimilarity = (a: string, b: string): number => {
  const wordsA = new Set(normalizeTitle(a).split(' ').filter(w => w.length > 3));
  const wordsB = new Set(normalizeTitle(b).split(' ').filter(w => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  return intersection.length / Math.min(wordsA.size, wordsB.size);
};

const extractFollowerCount = (text: string): number | null => {
  const patterns = [
    /(\d{1,3}(?:[,.]\d{3})*|\d+)\s*\+?\s*followers?/i,
    /followers?\s*[:\-]?\s*(\d{1,3}(?:[,.]\d{3})*|\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const parsed = Number.parseInt(match[1].replace(/[,.]/g, ''), 10);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
  }

  return null;
};

const fetchEventbriteFollowerCount = async (
  organizationId: string,
  eventbriteApiKey: string,
  firecrawlApiKey?: string,
  publicOrganizerId?: string,
): Promise<number | null> => {
  // 1) Try Eventbrite organization API directly first
  try {
    const orgDetailsResponse = await fetch(
      `https://www.eventbriteapi.com/v3/organizations/${organizationId}/?token=${eventbriteApiKey}`,
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (orgDetailsResponse.ok) {
      const orgDetails = await orgDetailsResponse.json();
      const directCount = [
        orgDetails?.num_followers,
        orgDetails?.followers,
        orgDetails?.follower_count,
        orgDetails?.followers_count,
      ].find((value) => typeof value === 'number' && Number.isFinite(value));

      if (typeof directCount === 'number') {
        return Math.max(0, Math.floor(directCount));
      }

      const parsedFromJson = extractFollowerCount(JSON.stringify(orgDetails));
      if (parsedFromJson !== null) return parsedFromJson;
    }
  } catch (error) {
    console.warn('Could not fetch follower count from Eventbrite org API:', error);
  }

  // 2) Fallback: scrape organizer public page
  if (!firecrawlApiKey) return null;

  const candidateUrls = [
    `https://www.eventbrite.com/o/${organizationId}`,
    `https://www.eventbrite.com/organizations/${organizationId}`,
    ...(publicOrganizerId ? [`https://www.eventbrite.com/o/${publicOrganizerId}`] : []),
  ];

  for (const url of candidateUrls) {
    try {
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'html'],
          onlyMainContent: false,
          waitFor: 3000,
        }),
      });

      if (!scrapeResponse.ok) continue;

      const scrapeData = await scrapeResponse.json();
      const pageText = `${scrapeData?.data?.markdown || ''}\n${scrapeData?.data?.html || ''}`;
      const parsed = extractFollowerCount(pageText);
      if (parsed !== null) return parsed;
    } catch (error) {
      console.warn(`Could not scrape Eventbrite followers from ${url}:`, error);
    }
  }

  return null;
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const eventbriteApiKey = Deno.env.get('EVENTBRITE_API_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!eventbriteApiKey) {
      console.error('EVENTBRITE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Eventbrite API key not configured' }),
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

    // Discover the organization ID for this token
    console.log('Discovering organization ID from token...');
    const orgResponse = await fetch(
      `https://www.eventbriteapi.com/v3/users/me/organizations/?token=${eventbriteApiKey}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!orgResponse.ok) {
      const errText = await orgResponse.text();
      console.error('Failed to get organizations:', orgResponse.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to get organizations [${orgResponse.status}]: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orgData = await orgResponse.json();
    const organizations = orgData.organizations || [];
    console.log('Found organizations:', organizations.map((o: any) => `${o.name} (${o.id})`));

    if (organizations.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No organizations found for this token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ORGANIZER_ID = String(organizations[0].id);
    console.log('Using organization ID:', ORGANIZER_ID);

    let eventbriteFollowerCount: number | null = null;

    // Fetch events from Eventbrite API
    const eventsResponse = await fetch(
      `https://www.eventbriteapi.com/v3/organizations/${ORGANIZER_ID}/events/?status=live,started&order_by=start_asc&expand=venue,ticket_availability&token=${eventbriteApiKey}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!eventsResponse.ok) {
      const errText = await eventsResponse.text();
      console.error('Eventbrite API error:', eventsResponse.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: `Eventbrite API error [${eventsResponse.status}]: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const eventsData = await eventsResponse.json();
    const events = eventsData.events || [];
    console.log('Found', events.length, 'Eventbrite events');

    try {
      const publicOrganizerId = events.find((event: any) => event?.organizer_id)?.organizer_id;
      eventbriteFollowerCount = await fetchEventbriteFollowerCount(
        ORGANIZER_ID,
        eventbriteApiKey,
        firecrawlApiKey || undefined,
        publicOrganizerId ? String(publicOrganizerId) : undefined,
      );

      if (eventbriteFollowerCount !== null) {
        const { data: latestStats } = await supabase
          .from('meetup_stats')
          .select('id')
          .order('last_updated', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestStats?.id) {
          const { error: statsUpdateError } = await supabase
            .from('meetup_stats')
            .update({
              eventbrite_follower_count: eventbriteFollowerCount,
              last_updated: new Date().toISOString(),
            })
            .eq('id', latestStats.id);

          if (statsUpdateError) {
            console.error('Failed to update eventbrite follower count:', statsUpdateError);
          } else {
            console.log('Updated Eventbrite follower count:', eventbriteFollowerCount);
          }
        }
      }
    } catch (error) {
      console.warn('Could not refresh Eventbrite follower count:', error);
    }

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Denver',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    // Pre-fetch ALL future events from DB for cross-platform matching
    const { data: allExistingEvents } = await supabase
      .from('events')
      .select('id, title, date, source, eventbrite_id, rsvp_count, meetup_rsvp_count, eventbrite_rsvp_count, luma_rsvp_count')
      .gte('date', today)
      .neq('status', 'cancelled');

    // Build lookup maps
    const byEventbriteId = new Map<string, any>();
    const byDate = new Map<string, any[]>();
    if (allExistingEvents) {
      for (const e of allExistingEvents) {
        if (e.eventbrite_id) byEventbriteId.set(e.eventbrite_id, e);
        const dateEvents = byDate.get(e.date) || [];
        dateEvents.push(e);
        byDate.set(e.date, dateEvents);
      }
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const event of events) {
      const title = event.name?.text?.trim();
      if (!title) continue;

      const startLocal = event.start?.local;
      if (!startLocal) continue;

      const eventDate = startLocal.split('T')[0];
      if (eventDate < today) continue;

      const timePart = startLocal.split('T')[1];
      const formattedTime = timePart ? timePart.substring(0, 5) : null;

      const venue = event.venue;
      const venueName = venue?.name || null;
      const venueAddress = venue?.address?.localized_address_display || null;
      const city = venue?.address?.city || 'Salt Lake City';
      const country = venue?.address?.country || 'US';
      const description = event.description?.text || event.summary || null;
      const imageUrl = event.logo?.original?.url || event.logo?.url || null;

      let ticketPrice = 0;
      if (event.is_free === false && event.ticket_availability?.minimum_ticket_price) {
        ticketPrice = parseFloat(event.ticket_availability.minimum_ticket_price.major_value) || 0;
      }

      // Fetch attendee count
      let attendeeCount = 0;
      try {
        const attendeeResponse = await fetch(
          `https://www.eventbriteapi.com/v3/events/${event.id}/attendees/?status=attending&token=${eventbriteApiKey}`,
        );
        if (attendeeResponse.ok) {
          const attendeeData = await attendeeResponse.json();
          attendeeCount = attendeeData.pagination?.object_count || 0;
        } else {
          await attendeeResponse.text();
        }
      } catch (e) {
        console.error('Error fetching attendees for event', event.id, e);
      }

      const eventbriteId = String(event.id);

      // --- Cross-platform matching ---
      // 1) Match by eventbrite_id
      let match = byEventbriteId.get(eventbriteId);

      // 2) Match by title similarity on the same date
      if (!match) {
        const sameDateEvents = byDate.get(eventDate) || [];
        for (const existing of sameDateEvents) {
          if (titleSimilarity(title, existing.title) >= 0.5) {
            match = existing;
            console.log(`Matched by title: "${title}" ↔ "${existing.title}" (${existing.source})`);
            break;
          }
        }
      }

      if (match) {
        // Merge into existing event — only update platform-specific fields, preserve tags
        const mergedRsvp = (match.meetup_rsvp_count || 0) + attendeeCount + (match.luma_rsvp_count || 0);
        const { error } = await supabase
          .from('events')
          .update({
            eventbrite_id: eventbriteId,
            eventbrite_rsvp_count: attendeeCount,
            rsvp_count: mergedRsvp,
            external_url: event.url,
            image_url: imageUrl || undefined,
            description: description || undefined,
            venue_name: venueName || undefined,
            venue_address: venueAddress || undefined,
            ticket_price: ticketPrice,
            updated_at: new Date().toISOString(),
            // Keep existing source priority
            source: match.source === 'meetup' ? 'meetup' : (match.source || 'eventbrite'),
          })
          .eq('id', match.id);

        if (!error) {
          updatedCount++;
          // Update our local map so subsequent matches see the updated eventbrite_id
          match.eventbrite_id = eventbriteId;
          match.eventbrite_rsvp_count = attendeeCount;
        } else {
          console.error('Error updating event:', error);
        }
      } else {
        // No match found — insert new event
        const { data: inserted, error } = await supabase
          .from('events')
          .insert({
            title,
            date: eventDate,
            time: formattedTime,
            location: venueAddress || `${city}, ${country === 'US' ? 'UT' : country}`,
            venue_name: venueName,
            venue_address: venueAddress,
            city,
            country: country === 'US' ? 'United States' : country,
            image_url: imageUrl,
            description,
            ticket_price: ticketPrice,
            currency: 'USD',
            status: 'published',
            tags: [],
            eventbrite_id: eventbriteId,
            eventbrite_rsvp_count: attendeeCount,
            external_url: event.url,
            source: 'eventbrite',
            tier: 'patron',
            rsvp_count: attendeeCount,
            meetup_rsvp_count: 0,
            luma_rsvp_count: 0,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error inserting event:', error);
        } else {
          insertedCount++;
          // Add to local maps for subsequent matching
          const newEvent = { id: inserted.id, title, date: eventDate, source: 'eventbrite', eventbrite_id: eventbriteId, meetup_rsvp_count: 0, eventbrite_rsvp_count: attendeeCount, luma_rsvp_count: 0, rsvp_count: attendeeCount };
          byEventbriteId.set(eventbriteId, newEvent);
          const dateEvents = byDate.get(eventDate) || [];
          dateEvents.push(newEvent);
          byDate.set(eventDate, dateEvents);
        }
      }
    }

    console.log(`Eventbrite sync complete: ${insertedCount} inserted, ${updatedCount} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventsFound: events.length,
          eventsInserted: insertedCount,
          eventsUpdated: updatedCount,
          eventbriteFollowerCount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-eventbrite-events:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
