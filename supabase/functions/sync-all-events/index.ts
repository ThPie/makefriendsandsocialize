import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Orchestrator function that:
 * 1. Calls sync-eventbrite-events FIRST (source of truth)
 * 2. Calls sync-meetup-upcoming-events (attendee-only)
 * 3. Calls sync-luma-events (attendee-only)
 * 4. Runs AI-powered cross-platform event matching for ambiguous cases
 * 5. Recalculates total RSVP counts
 * 6. Runs AI auto-tagging
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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results: Record<string, unknown> = {};

    const callFunction = async (name: string) => {
      const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time: new Date().toISOString() }),
      });
      return res.json();
    };

    // 1. Sync Eventbrite FIRST (source of truth for event cards)
    console.log('=== Step 1: Syncing Eventbrite events (primary source) ===');
    try {
      results.eventbrite = await callFunction('sync-eventbrite-events');
      console.log('Eventbrite sync result:', JSON.stringify(results.eventbrite));
    } catch (e) {
      console.error('Eventbrite sync error:', e);
      results.eventbrite = { error: e instanceof Error ? e.message : 'Failed' };
    }

    // 2. Sync Meetup (attendee counts only)
    console.log('=== Step 2: Syncing Meetup attendees ===');
    try {
      results.meetup = await callFunction('sync-meetup-upcoming-events');
      console.log('Meetup sync result:', JSON.stringify(results.meetup));
    } catch (e) {
      console.error('Meetup sync error:', e);
      results.meetup = { error: e instanceof Error ? e.message : 'Failed' };
    }

    // 3. Sync Luma (attendee counts only)
    console.log('=== Step 3: Syncing Luma attendees ===');
    try {
      results.luma = await callFunction('sync-luma-events');
      console.log('Luma sync result:', JSON.stringify(results.luma));
    } catch (e) {
      console.error('Luma sync error:', e);
      results.luma = { error: e instanceof Error ? e.message : 'Failed' };
    }

    // 4. AI-powered cross-platform matching for remaining duplicates
    console.log('=== Step 4: AI-powered cross-platform matching ===');
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

    let mergedCount = 0;

    if (allEvents && allEvents.length > 1) {
      // Group events by date
      const eventsByDate = new Map<string, typeof allEvents>();
      for (const event of allEvents) {
        const dateEvents = eventsByDate.get(event.date) || [];
        dateEvents.push(event);
        eventsByDate.set(event.date, dateEvents);
      }

      const normalize = (t: string) => t.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

      for (const [_date, dateEvents] of eventsByDate) {
        if (dateEvents.length < 2) continue;

        const processed = new Set<string>();

        for (let i = 0; i < dateEvents.length; i++) {
          if (processed.has(dateEvents[i].id)) continue;

          for (let j = i + 1; j < dateEvents.length; j++) {
            if (processed.has(dateEvents[j].id)) continue;

            const a = dateEvents[i];
            const b = dateEvents[j];

            const wordsA = new Set(normalize(a.title).split(' ').filter(w => w.length > 3));
            const wordsB = new Set(normalize(b.title).split(' ').filter(w => w.length > 3));
            if (wordsA.size === 0 || wordsB.size === 0) continue;

            const intersection = [...wordsA].filter(w => wordsB.has(w));
            const similarity = intersection.length / Math.min(wordsA.size, wordsB.size);

            let isSameEvent = similarity >= 0.6;

            // For borderline cases (0.3-0.6), use AI to decide
            if (!isSameEvent && similarity >= 0.3 && lovableApiKey) {
              try {
                console.log(`AI matching: "${a.title}" vs "${b.title}" (similarity: ${similarity.toFixed(2)})`);
                const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${lovableApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'google/gemini-2.5-flash-lite',
                    messages: [
                      {
                        role: 'system',
                        content: 'You determine if two event titles refer to the same event. Respond with ONLY "yes" or "no".'
                      },
                      {
                        role: 'user',
                        content: `Are these the same event?\nTitle A: "${a.title}"\nTitle B: "${b.title}"\nBoth are on the same date.`
                      }
                    ],
                    max_tokens: 5,
                  }),
                });

                if (aiResponse.ok) {
                  const aiData = await aiResponse.json();
                  const answer = (aiData.choices?.[0]?.message?.content || '').toLowerCase().trim();
                  isSameEvent = answer.startsWith('yes');
                  console.log(`AI says: ${answer} → ${isSameEvent ? 'MERGE' : 'KEEP SEPARATE'}`);
                }
              } catch (aiErr) {
                console.warn('AI matching failed, skipping:', aiErr);
              }
            }

            if (isSameEvent) {
              console.log(`Merging duplicate: "${a.title}" (${a.source}) + "${b.title}" (${b.source})`);

              // Eventbrite is always the primary; otherwise use priority order
              const aIsEventbrite = a.source === 'eventbrite';
              const bIsEventbrite = b.source === 'eventbrite';
              const primary = aIsEventbrite ? a : bIsEventbrite ? b : a;
              const secondary = aIsEventbrite ? b : bIsEventbrite ? a : b;

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

    // 5. Recalculate total rsvp_count
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

    // 6. Run AI auto-tagging
    console.log('=== Step 6: AI Auto-Tagging ===');
    try {
      results.autoTag = await callFunction('auto-tag-events');
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
