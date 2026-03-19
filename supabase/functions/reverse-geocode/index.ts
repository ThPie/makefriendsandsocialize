import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Reverse geocode coordinates to city/state/country.
 * Uses a lightweight lookup. For production, integrate a geocoding API
 * (e.g., Google Maps, Mapbox, or OpenCage).
 */

// Major Canadian & US cities with bounding approximations
const CITIES = [
  { city: 'Montreal', state: 'QC', country: 'Canada', lat: 45.5017, lng: -73.5673 },
  { city: 'Toronto', state: 'ON', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Vancouver', state: 'BC', country: 'Canada', lat: 49.2827, lng: -123.1207 },
  { city: 'Ottawa', state: 'ON', country: 'Canada', lat: 45.4215, lng: -75.6972 },
  { city: 'Calgary', state: 'AB', country: 'Canada', lat: 51.0447, lng: -114.0719 },
  { city: 'Edmonton', state: 'AB', country: 'Canada', lat: 53.5461, lng: -113.4938 },
  { city: 'Winnipeg', state: 'MB', country: 'Canada', lat: 49.8951, lng: -97.1384 },
  { city: 'Quebec City', state: 'QC', country: 'Canada', lat: 46.8139, lng: -71.2080 },
  { city: 'Halifax', state: 'NS', country: 'Canada', lat: 44.6488, lng: -63.5752 },
  { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'IL', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { city: 'Miami', state: 'FL', country: 'USA', lat: 25.7617, lng: -80.1918 },
  { city: 'London', state: 'England', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Paris', state: 'Île-de-France', country: 'France', lat: 48.8566, lng: 2.3522 },
];

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

    const { latitude, longitude } = await req.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid coordinates' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find the nearest city
    let nearest = CITIES[0];
    let minDist = Infinity;

    for (const city of CITIES) {
      const dist = haversineKm(latitude, longitude, city.lat, city.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = city;
      }
    }

    // Only return a city if within 100km
    if (minDist > 100) {
      return new Response(
        JSON.stringify({ city: null, state: null, country: null, distance_km: minDist }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        city: nearest.city,
        state: nearest.state,
        country: nearest.country,
        distance_km: Math.round(minDist * 10) / 10,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('reverse-geocode error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
