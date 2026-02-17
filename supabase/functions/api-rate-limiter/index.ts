import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';



// Rate limit configuration: 100 requests per 15 minutes per IP
const MAX_REQUESTS = 100;
const WINDOW_MINUTES = 15;

/**
 * API Rate Limiter - Protects against DDoS attacks
 * Limits: 100 requests per 15 minutes per IP address
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get IP address from various headers
    const ipAddress = 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const { endpoint, action } = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check') {
      // Check rate limit status without incrementing
      const { data: rateLimit, error } = await supabase.rpc('check_api_rate_limit', {
        _ip_address: ipAddress,
        _endpoint: endpoint,
        _max_requests: MAX_REQUESTS,
        _window_minutes: WINDOW_MINUTES
      });

      if (error) {
        console.error('Rate limit check error:', error);
        // On error, allow the request to prevent blocking legitimate users
        return new Response(
          JSON.stringify({ allowed: true, remaining: MAX_REQUESTS, resetAt: null }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const limitStatus = rateLimit?.[0] || { allowed: true, remaining_requests: MAX_REQUESTS, reset_at: null };

      return new Response(
        JSON.stringify({
          allowed: limitStatus.allowed,
          remaining: limitStatus.remaining_requests,
          resetAt: limitStatus.reset_at,
          limit: MAX_REQUESTS
        }),
        { 
          status: limitStatus.allowed ? 200 : 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': limitStatus.remaining_requests.toString(),
            'X-RateLimit-Reset': limitStatus.reset_at || ''
          } 
        }
      );
    }

    if (action === 'increment' || action === 'check_and_increment') {
      // Check first if action is check_and_increment
      if (action === 'check_and_increment') {
        const { data: rateLimit } = await supabase.rpc('check_api_rate_limit', {
          _ip_address: ipAddress,
          _endpoint: endpoint,
          _max_requests: MAX_REQUESTS,
          _window_minutes: WINDOW_MINUTES
        });

        const limitStatus = rateLimit?.[0] || { allowed: true, remaining_requests: MAX_REQUESTS, reset_at: null };

        if (!limitStatus.allowed) {
          console.warn(`Rate limit exceeded for IP ${ipAddress} on endpoint ${endpoint}`);
          return new Response(
            JSON.stringify({
              allowed: false,
              remaining: 0,
              resetAt: limitStatus.reset_at,
              limit: MAX_REQUESTS,
              error: 'Rate limit exceeded. Please try again later.'
            }),
            { 
              status: 429, 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': MAX_REQUESTS.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': limitStatus.reset_at || '',
                'Retry-After': '900' // 15 minutes in seconds
              } 
            }
          );
        }
      }

      // Increment rate limit counter
      const { error: incrementError } = await supabase.rpc('increment_api_rate_limit', {
        _ip_address: ipAddress,
        _endpoint: endpoint
      });

      if (incrementError) {
        console.error('Rate limit increment error:', incrementError);
      }

      // Get updated status
      const { data: updatedLimit } = await supabase.rpc('check_api_rate_limit', {
        _ip_address: ipAddress,
        _endpoint: endpoint,
        _max_requests: MAX_REQUESTS,
        _window_minutes: WINDOW_MINUTES
      });

      const updatedStatus = updatedLimit?.[0] || { allowed: true, remaining_requests: MAX_REQUESTS - 1, reset_at: null };

      return new Response(
        JSON.stringify({
          allowed: true,
          remaining: updatedStatus.remaining_requests,
          resetAt: updatedStatus.reset_at,
          limit: MAX_REQUESTS
        }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': updatedStatus.remaining_requests.toString(),
            'X-RateLimit-Reset': updatedStatus.reset_at || ''
          } 
        }
      );
    }

    if (action === 'cleanup') {
      // Cleanup old rate limit records
      const { data: deletedCount, error } = await supabase.rpc('cleanup_old_api_rate_limits');
      
      if (error) {
        console.error('Cleanup error:', error);
        return new Response(
          JSON.stringify({ error: 'Cleanup failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, deletedRecords: deletedCount }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: check, increment, check_and_increment, or cleanup' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-rate-limiter:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
