import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple city → approximate coordinates lookup for events.
// In production, use a geocoding API. This provides the framework.
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'montreal': { lat: 45.5017, lng: -73.5673 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'vancouver': { lat: 49.2827, lng: -123.1207 },
  'ottawa': { lat: 45.4215, lng: -75.6972 },
  'calgary': { lat: 51.0447, lng: -114.0719 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { latitude, longitude, radius_km = 50 } = await req.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid coordinates' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get upcoming events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, date, city, location')
      .gte('date', new Date().toISOString().split('T')[0])
      .neq('status', 'cancelled')
      .order('date', { ascending: true })
      .limit(100);

    if (eventsError) {
      return new Response(JSON.stringify({ events: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate distance for each event based on city
    const nearbyEvents = (events || [])
      .map((event) => {
        const cityKey = (event.city || event.location || '').toLowerCase().trim();
        const cityCoords = CITY_COORDS[cityKey];

        if (!cityCoords) return null;

        const distance_km = Math.round(haversineKm(latitude, longitude, cityCoords.lat, cityCoords.lng) * 10) / 10;

        if (distance_km > radius_km) return null;

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          city: event.city,
          distance_km,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance_km - b.distance_km);

    return new Response(JSON.stringify({ events: nearbyEvents }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('nearby-events error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
