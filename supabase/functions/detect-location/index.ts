import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    const realIp = req.headers.get('x-real-ip');
    
    let clientIp = cfConnectingIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp;
    
    console.log('Detecting location for IP:', clientIp);

    if (!clientIp) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not determine client IP', country: null, state: null, city: null, isVpn: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try ipapi.co first
    try {
      const apiUrl = `https://ipapi.co/${clientIp}/json/`;
      console.log('Trying ipapi.co:', apiUrl);
      const response = await fetch(apiUrl);
      
      if (response.status === 429) {
        console.warn('ipapi.co rate limited, falling back to ip-api.com');
        throw new Error('rate_limited');
      }
      
      if (!response.ok) {
        console.warn('ipapi.co returned status:', response.status);
        throw new Error('api_error');
      }

      const data = await response.json();
      
      if (data.error) {
        console.warn('ipapi.co error:', data.reason);
        throw new Error('api_error');
      }
      
      const isVpn = data.org?.toLowerCase().includes('vpn') || data.org?.toLowerCase().includes('hosting') || false;
      
      console.log('ipapi.co response:', { country: data.country_name, region: data.region, city: data.city });
      
      return new Response(
        JSON.stringify({ success: true, country: data.country_name || null, state: data.region || null, city: data.city || null, isVpn }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (primaryError) {
      console.warn('Primary geo API failed, trying fallback ip-api.com:', primaryError);
    }

    // Fallback: ip-api.com (HTTP only, but fine from server-side)
    try {
      const fallbackUrl = `http://ip-api.com/json/${clientIp}?fields=status,country,regionName,city,proxy,hosting`;
      console.log('Trying ip-api.com:', fallbackUrl);
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData.status === 'fail') {
        console.warn('ip-api.com failed:', fallbackData.message);
        return new Response(
          JSON.stringify({ success: false, error: 'Geolocation lookup failed', country: null, state: null, city: null, isVpn: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const isVpn = fallbackData.proxy === true || fallbackData.hosting === true;
      
      console.log('ip-api.com response:', { country: fallbackData.country, region: fallbackData.regionName, city: fallbackData.city });
      
      return new Response(
        JSON.stringify({ success: true, country: fallbackData.country || null, state: fallbackData.regionName || null, city: fallbackData.city || null, isVpn }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fallbackError) {
      console.warn('Fallback geo API also failed:', fallbackError);
      return new Response(
        JSON.stringify({ success: false, error: 'Geolocation service unavailable', country: null, state: null, city: null, isVpn: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in detect-location function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Internal server error', country: null, state: null, city: null, isVpn: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
