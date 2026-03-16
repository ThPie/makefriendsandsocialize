import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';



serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from various headers (Cloudflare, standard proxies, direct)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    const realIp = req.headers.get('x-real-ip');
    
    let clientIp = cfConnectingIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp;
    
    console.log('Detecting location for IP:', clientIp);
    console.log('Headers:', {
      'x-forwarded-for': forwardedFor,
      'cf-connecting-ip': cfConnectingIp,
      'x-real-ip': realIp
    });

    // If no IP found, we can't detect location
    if (!clientIp) {
      console.log('No client IP found in headers');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Could not determine client IP',
          country: null,
          state: null,
          city: null,
          isVpn: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call ip-api.com for geolocation and VPN detection
    // Using HTTPS endpoint (pro endpoint works with HTTPS)
    // Fallback: try HTTPS first, if it fails return graceful null response
    let data: any;
    try {
      const apiUrl = `https://ipapi.co/${clientIp}/json/`;
      console.log('Calling ipapi.co:', apiUrl);
      const response = await fetch(apiUrl);
      data = await response.json();
      
      // ipapi.co returns { error: true } on failure
      if (data.error) {
        console.warn('ipapi.co error:', data.reason);
        return new Response(
          JSON.stringify({
            success: false,
            error: data.reason || 'Geolocation lookup failed',
            country: null,
            state: null,
            city: null,
            isVpn: false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Map ipapi.co response format
      const isVpn = data.org?.toLowerCase().includes('vpn') || data.org?.toLowerCase().includes('hosting') || false;
      
      console.log('ipapi.co response:', { country: data.country_name, region: data.region, city: data.city });
      
      return new Response(
        JSON.stringify({
          success: true,
          country: data.country_name || null,
          state: data.region || null,
          city: data.city || null,
          isVpn: isVpn
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (geoError) {
      console.warn('Geolocation API failed, returning null location:', geoError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Geolocation service unavailable',
          country: null,
          state: null,
          city: null,
          isVpn: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('ip-api.com response:', data);

    if (data.status === 'fail') {
      console.error('ip-api.com error:', data.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || 'Geolocation lookup failed',
          country: null,
          state: null,
          city: null,
          isVpn: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // VPN detection: proxy flag OR hosting flag (datacenter IPs are often VPNs)
    const isVpn = data.proxy === true || data.hosting === true;
    
    console.log('VPN detection:', { proxy: data.proxy, hosting: data.hosting, isVpn });

    return new Response(
      JSON.stringify({
        success: true,
        country: data.country || null,
        state: data.regionName || null,
        city: data.city || null,
        isVpn: isVpn
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-location function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        country: null,
        state: null,
        city: null,
        isVpn: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
