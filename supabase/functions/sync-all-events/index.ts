import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Orchestrator function that:
 * 1. Calls sync-meetup-upcoming-events
 * 2. Calls sync-eventbrite-events
 * 3. Calls sync-luma-events
 * 4. Runs cross-platform event matching to merge duplicate events & combine attendees
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results: Record<string, unknown> = {};

    // 1. Sync Meetup events
    console.log('=== Step 1: Syncing Meetup events ===');
    try {
      const meetupRes = await fetch(`${supabaseUrl}/functions/v1/sync-meetup-upcoming-events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time: new Date().toISOString() }),
      });
      results.meetup = await meetupRes.json();
      console.log('Meetup sync result:', JSON.stringify(results.meetup));
    } catch (e) {
      console.error('Meetup sync error:', e);
      results.meetup = { error: e instanceof Error ? e.message : 'Failed' };
    }

    // 2. Sync Eventbrite events
    console.log('=== Step 2: Syncing Eventbrite events ===');
    try {
      const eventbriteRes = await fetch(`${supabaseUrl}/functions/v1/sync-eventbrite-events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time: new Date().toISOString() }),
      });
      results.eventbrite = await eventbriteRes.json();
      console.log('Eventbrite sync result:', JSON.stringify(results.eventbrite));
    } catch (e) {
      console.error('Eventbrite sync error:', e);
      results.eventbrite = { error: e instanceof Error ? e.message : 'Failed' };
    }

    // 3. Sync Luma events
    console.log('=== Step 3: Syncing Luma events ===');
    try {
      const lumaRes = await fetch(`${supabaseUrl}/functions/v1/sync-luma-events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time: new Date().toISOString() }),
      });
      results.luma = await lumaRes.json();
      console.log('Luma sync result:', JSON.stringify(results.luma));
    } catch (e) {
      console.error('Luma sync error:', e);
      results.luma = { error: e instanceof Error ? e.message : 'Failed' };
    }

    // 4. Cross-platform event matching & merging
    console.log('=== Step 4: Cross-platform event matching ===');
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Denver',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    const { data: allEvents } = await supabase
      .from('events')
      .select('id, title, date, source, eventbrite_id, luma_id, rsvp_count, meetup_rsvp_count, eventbrite_rsvp_count, luma_rsvp_count')
      .gte('date', today)
      .neq('status', 'cancelled')
      .order('date', { ascending: true });

    if (allEvents && allEvents.length > 1) {
      // Group events by date for matching
      const eventsByDate = new Map<string, typeof allEvents>();
      for (const event of allEvents) {
        const dateEvents = eventsByDate.get(event.date) || [];
        dateEvents.push(event);
        eventsByDate.set(event.date, dateEvents);
      }

      let mergedCount = 0;

      for (const [date, dateEvents] of eventsByDate) {
        if (dateEvents.length < 2) continue;

        // Compare all pairs of events on the same date
        const processed = new Set<string>();

        for (let i = 0; i < dateEvents.length; i++) {
          if (processed.has(dateEvents[i].id)) continue;

          for (let j = i + 1; j < dateEvents.length; j++) {
            if (processed.has(dateEvents[j].id)) continue;

            const a = dateEvents[i];
            const b = dateEvents[j];

            // Calculate title similarity
            const normalize = (t: string) => t.toLowerCase().replace(/[^\\w\\s]/g, '').replace(/\\s+/g, ' ').trim();
            const wordsA = new Set(normalize(a.title).split(' ').filter(w => w.length > 3));
            const wordsB = new Set(normalize(b.title).split(' ').filter(w => w.length > 3));

            if (wordsA.size === 0 || wordsB.size === 0) continue;

            const intersection = [...wordsA].filter(w => wordsB.has(w));
            const similarity = intersection.length / Math.min(wordsA.size, wordsB.size);

            if (similarity >= 0.6) {
              console.log(`Merging duplicate: "${a.title}" (${a.source}) + "${b.title}" (${b.source})`);

              // Keep the older/primary event (meetup > eventbrite > luma priority)
              const priorityOrder = ['meetup', 'eventbrite', 'luma'];
              const aPriority = priorityOrder.indexOf(a.source || '') ?? 99;
              const bPriority = priorityOrder.indexOf(b.source || '') ?? 99;
              const primary = aPriority <= bPriority ? a : b;
              const secondary = aPriority <= bPriority ? b : a;

              // Merge platform-specific counts into primary
              const mergedMeetup = Math.max(primary.meetup_rsvp_count || 0, secondary.meetup_rsvp_count || 0);
              const mergedEventbrite = Math.max(primary.eventbrite_rsvp_count || 0, secondary.eventbrite_rsvp_count || 0);
              const mergedLuma = Math.max(primary.luma_rsvp_count || 0, secondary.luma_rsvp_count || 0);
              const totalRsvp = mergedMeetup + mergedEventbrite + mergedLuma;

              await supabase
                .from('events')
                .update({
                  meetup_rsvp_count: mergedMeetup,
                  eventbrite_rsvp_count: mergedEventbrite,
                  luma_rsvp_count: mergedLuma,
                  rsvp_count: totalRsvp,
                  eventbrite_id: primary.eventbrite_id || secondary.eventbrite_id,
                  luma_id: primary.luma_id || secondary.luma_id,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', primary.id);

              // Delete the duplicate secondary event
              await supabase
                .from('events')
                .delete()
                .eq('id', secondary.id);

              processed.add(secondary.id);
              mergedCount++;
            }
          }
        }
      }

      results.matching = { mergedCount };
      console.log(`Cross-platform matching complete: ${mergedCount} events merged`);
    }

    // 5. Recalculate total rsvp_count for all events that have platform-specific counts
    const { data: eventsToRecalc } = await supabase
      .from('events')
      .select('id, meetup_rsvp_count, eventbrite_rsvp_count, luma_rsvp_count')
      .gte('date', today)
      .neq('status', 'cancelled');

    if (eventsToRecalc) {
      for (const event of eventsToRecalc) {
        const platformTotal = (event.meetup_rsvp_count || 0) + (event.eventbrite_rsvp_count || 0) + (event.luma_rsvp_count || 0);
        if (platformTotal > 0) {
          await supabase
            .from('events')
            .update({ rsvp_count: platformTotal })
            .eq('id', event.id);
        }
      }
    }

    // 6. Run AI auto-tagging on events with missing/platform-only tags
    console.log('=== Step 6: AI Auto-Tagging ===');
    try {
      const tagRes = await fetch(`${supabaseUrl}/functions/v1/auto-tag-events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time: new Date().toISOString() }),
      });
      results.autoTag = await tagRes.json();
      console.log('Auto-tag result:', JSON.stringify(results.autoTag));
    } catch (e) {
      console.error('Auto-tag error:', e);
      results.autoTag = { error: e instanceof Error ? e.message : 'Failed' };
    }

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-all-events:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
