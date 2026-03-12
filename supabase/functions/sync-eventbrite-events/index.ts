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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const eventbriteApiKey = Deno.env.get('EVENTBRITE_API_KEY');
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

    const ORGANIZER_ID = organizations[0].id;
    console.log('Using organization ID:', ORGANIZER_ID);

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

      const eventData = {
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
        tags: ['eventbrite'],
        updated_at: new Date().toISOString(),
        eventbrite_id: eventbriteId,
        eventbrite_rsvp_count: attendeeCount,
        external_url: event.url,
      };

      if (match) {
        // Merge into existing event — sum platform-specific counts
        const mergedRsvp = (match.meetup_rsvp_count || 0) + attendeeCount + (match.luma_rsvp_count || 0);
        const { error } = await supabase
          .from('events')
          .update({
            ...eventData,
            rsvp_count: mergedRsvp,
            // Keep meetup as primary source if it was the original
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
            ...eventData,
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
        data: { eventsFound: events.length, eventsInserted: insertedCount, eventsUpdated: updatedCount },
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
