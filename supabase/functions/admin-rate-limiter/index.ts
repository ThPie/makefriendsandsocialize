import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';



// Rate limit configurations per endpoint
const RATE_LIMITS: Record<string, { maxRequests: number; windowMinutes: number }> = {
  'applications': { maxRequests: 100, windowMinutes: 60 },
  'members': { maxRequests: 200, windowMinutes: 60 },
  'dating': { maxRequests: 100, windowMinutes: 60 },
  'security': { maxRequests: 50, windowMinutes: 60 },
  'exports': { maxRequests: 10, windowMinutes: 60 },
  'default': { maxRequests: 100, windowMinutes: 60 }
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create admin client for service operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user client to verify the user
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: 'User is not an admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, endpoint } = await req.json();

    if (action === 'check') {
      // Check rate limit status
      const config = RATE_LIMITS[endpoint] || RATE_LIMITS['default'];

      const { data: rateLimit } = await supabaseAdmin.rpc('check_admin_rate_limit', {
        _admin_id: user.id,
        _endpoint: endpoint,
        _max_requests: config.maxRequests,
        _window_minutes: config.windowMinutes
      });

      const limitStatus = rateLimit?.[0] || { allowed: true, remaining_requests: config.maxRequests, reset_at: null };

      // Log to audit if nearing limit (80%)
      if (limitStatus.remaining_requests <= config.maxRequests * 0.2) {
        console.warn(`Admin ${user.id} is at ${Math.round((1 - limitStatus.remaining_requests / config.maxRequests) * 100)}% rate limit for ${endpoint}`);

        // Queue alert notification if at 80%
        if (limitStatus.remaining_requests === Math.floor(config.maxRequests * 0.2)) {
          await supabaseAdmin
            .from('notification_queue')
            .insert({
              user_id: user.id,
              notification_type: 'rate_limit_warning',
              payload: {
                endpoint,
                usage_percent: 80,
                remaining: limitStatus.remaining_requests,
                reset_at: limitStatus.reset_at
              }
            });
        }
      }

      return new Response(
        JSON.stringify({
          allowed: limitStatus.allowed,
          remaining: limitStatus.remaining_requests,
          resetAt: limitStatus.reset_at,
          limit: config.maxRequests
        }),
        {
          status: limitStatus.allowed ? 200 : 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': limitStatus.remaining_requests.toString(),
            'X-RateLimit-Reset': limitStatus.reset_at || ''
          }
        }
      );
    }

    if (action === 'increment') {
      // Increment rate limit counter
      await supabaseAdmin.rpc('increment_admin_rate_limit', {
        _admin_id: user.id,
        _endpoint: endpoint
      });

      // Log to audit
      await supabaseAdmin
        .from('admin_audit_log')
        .insert({
          admin_user_id: user.id,
          action_type: 'api_access',
          resource_type: endpoint,
          details: {
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown'
          }
        });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'status') {
      // Get current rate limit status for all endpoints
      const statuses: Record<string, any> = {};

      for (const [ep, config] of Object.entries(RATE_LIMITS)) {
        if (ep === 'default') continue;

        const { data: rateLimit } = await supabaseAdmin.rpc('check_admin_rate_limit', {
          _admin_id: user.id,
          _endpoint: ep,
          _max_requests: config.maxRequests,
          _window_minutes: config.windowMinutes
        });

        const limitStatus = rateLimit?.[0] || { allowed: true, remaining_requests: config.maxRequests, reset_at: null };

        statuses[ep] = {
          limit: config.maxRequests,
          remaining: limitStatus.remaining_requests,
          resetAt: limitStatus.reset_at,
          usagePercent: Math.round((1 - limitStatus.remaining_requests / config.maxRequests) * 100)
        };
      }

      return new Response(
        JSON.stringify({ statuses }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-rate-limiter:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
