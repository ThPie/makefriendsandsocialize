import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCorsHeaders } from '../_shared/cors.ts';

const EVENTBRITE_ORGANIZER_URL = 'https://www.eventbrite.com/o/make-friends-socialize-109567181801';

// Extract organizer ID from URL
const ORGANIZER_ID = '109567181801';

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

    console.log('Fetching Eventbrite events for organizer:', ORGANIZER_ID, 'token length:', eventbriteApiKey.length, 'first4:', eventbriteApiKey.substring(0, 4));

    // Fetch events from Eventbrite API (use token query param for compatibility)
    const eventsResponse = await fetch(
      `https://www.eventbriteapi.com/v3/organizations/${ORGANIZER_ID}/events/?status=live,started&order_by=start_asc&expand=venue,ticket_availability&token=${eventbriteApiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
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

    // Get today's date in Mountain Time
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Denver',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    let insertedCount = 0;
    let updatedCount = 0;

    for (const event of events) {
      const title = event.name?.text?.trim();
      if (!title) continue;

      // Parse date from Eventbrite format (ISO 8601)
      const startLocal = event.start?.local; // "2026-03-21T18:00:00"
      if (!startLocal) continue;

      const eventDate = startLocal.split('T')[0];
      if (eventDate < today) continue;

      // Parse time
      const timePart = startLocal.split('T')[1];
      const formattedTime = timePart ? timePart.substring(0, 5) : null;

      // Venue info
      const venue = event.venue;
      const venueName = venue?.name || null;
      const venueAddress = venue?.address?.localized_address_display || null;
      const city = venue?.address?.city || 'Salt Lake City';
      const country = venue?.address?.country || 'US';

      // Description
      const description = event.description?.text || event.summary || null;

      // Image
      const imageUrl = event.logo?.original?.url || event.logo?.url || null;

      // Ticket price
      let ticketPrice = 0;
      if (event.is_free === false && event.ticket_availability?.minimum_ticket_price) {
        ticketPrice = parseFloat(event.ticket_availability.minimum_ticket_price.major_value) || 0;
      }

      // Attendee count - fetch from attendees endpoint
      let attendeeCount = 0;
      try {
        const attendeeResponse = await fetch(
          `https://www.eventbriteapi.com/v3/events/${event.id}/attendees/?status=attending&token=${eventbriteApiKey}`,
        );
        if (attendeeResponse.ok) {
          const attendeeData = await attendeeResponse.json();
          attendeeCount = attendeeData.pagination?.object_count || 0;
        } else {
          // Consume the response body
          await attendeeResponse.text();
        }
      } catch (e) {
        console.error('Error fetching attendees for event', event.id, e);
      }

      const eventbriteId = event.id;

      // Check if event already exists (by eventbrite_id or title+date match)
      const { data: existing } = await supabase
        .from('events')
        .select('id, source, eventbrite_id, rsvp_count, meetup_rsvp_count, luma_rsvp_count')
        .or(`eventbrite_id.eq.${eventbriteId},and(title.ilike.%${title.substring(0, 30)}%,date.eq.${eventDate})`)
        .limit(1)
        .single();

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

      if (existing) {
        // Update existing event - merge attendee counts
        const mergedRsvp = (existing.meetup_rsvp_count || 0) + attendeeCount + (existing.luma_rsvp_count || 0);
        const { error } = await supabase
          .from('events')
          .update({
            ...eventData,
            rsvp_count: mergedRsvp,
            // Keep existing source if it was meetup (primary), otherwise set to eventbrite
            source: existing.source || 'eventbrite',
          })
          .eq('id', existing.id);

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
            source: 'eventbrite',
            tier: 'patron',
            rsvp_count: attendeeCount,
            meetup_rsvp_count: 0,
            luma_rsvp_count: 0,
          });

        if (error) console.error('Error inserting event:', error);
        else insertedCount++;
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
