import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Lightweight endpoint for Home Screen Widgets to fetch fresh data.
 * Widgets call this periodically via background refresh (WidgetKit timeline / Glance worker).
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Parallel queries for widget data
    const [eventsResult, notifResult, quoteResult, profileResult] = await Promise.all([
      supabase
        .from('events')
        .select('title, date, time, venue_name')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3),
      supabase
        .from('notification_queue')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false),
      supabase
        .from('daily_quotes')
        .select('quote_text')
        .eq('quote_date', today)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('created_at, first_name')
        .eq('id', user.id)
        .single(),
    ]);

    const nextEvent = eventsResult.data?.[0];

    const payload = {
      nextEvent: nextEvent
        ? {
            title: nextEvent.title,
            date: nextEvent.date,
            time: nextEvent.time,
            venue: nextEvent.venue_name,
            daysUntil: Math.ceil(
              (new Date(nextEvent.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            ),
          }
        : null,
      upcomingEvents: (eventsResult.data || []).map((e: any) => ({
        title: e.title,
        date: e.date,
      })),
      unreadCount: notifResult.count || 0,
      dailyQuote: quoteResult.data?.quote_text || null,
      firstName: profileResult.data?.first_name || null,
      memberSince: profileResult.data?.created_at || null,
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('widget-data error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
