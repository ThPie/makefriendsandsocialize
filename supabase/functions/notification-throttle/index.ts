import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';



// Priority levels: 1 = highest (always send), 10 = lowest (bundle first)
const NOTIFICATION_PRIORITIES: Record<string, number> = {
  'reminder_24h': 1,
  'mutual_match': 2,
  'date_accepted': 3,
  'new_match': 4,
  'dates_proposed': 5,
  'decision_time': 6,
  'dating_vetted': 7,
  'match_declined': 8,
  'date_confirmation': 2,
  'reschedule_requested': 2,
};

const MAX_DAILY_NOTIFICATIONS = 3;
const PRIORITY_THRESHOLD = 2; // Priority <= this always gets through

interface ThrottleDecision {
  action: 'send' | 'bundle' | 'skip';
  reason: string;
  bundleCount?: number;
}

interface ThrottleRequest {
  user_id: string;
  notification_type: string;
  payload?: Record<string, unknown>;
  action?: 'check' | 'record' | 'bundle' | 'process_bundles';
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, notification_type, payload, action = 'check' }: ThrottleRequest = await req.json();

    console.log(`Throttle request: action=${action}, user=${user_id}, type=${notification_type}`);

    if (action === 'process_bundles') {
      // Process all pending bundles for all users
      const result = await processPendingBundles(supabase);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user_id || !notification_type) {
      return new Response(JSON.stringify({ error: 'user_id and notification_type required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const priority = NOTIFICATION_PRIORITIES[notification_type] || 5;
    const today = new Date().toISOString().split('T')[0];

    if (action === 'check') {
      const decision = await checkThrottle(supabase, user_id, today, priority);
      return new Response(JSON.stringify(decision), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'record') {
      await recordNotificationSent(supabase, user_id, today);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'bundle') {
      await addToBundle(supabase, user_id, notification_type, priority, payload || {});
      return new Response(JSON.stringify({ success: true, bundled: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in notification-throttle:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

async function checkThrottle(
  supabase: SupabaseClient,
  userId: string,
  today: string,
  priority: number
): Promise<ThrottleDecision> {
  // Get today's throttle log for this user
  const { data: throttleLog } = await supabase
    .from('notification_throttle_log')
    .select('*')
    .eq('user_id', userId)
    .eq('notification_date', today)
    .single();

  const notificationsSent = throttleLog?.notifications_sent || 0;

  // High priority notifications always get through
  if (priority <= PRIORITY_THRESHOLD) {
    return {
      action: 'send',
      reason: `High priority notification (priority ${priority})`,
    };
  }

  // Under limit - send immediately
  if (notificationsSent < MAX_DAILY_NOTIFICATIONS) {
    return {
      action: 'send',
      reason: `Under daily limit (${notificationsSent}/${MAX_DAILY_NOTIFICATIONS})`,
    };
  }

  // Over limit - bundle
  return {
    action: 'bundle',
    reason: `Daily limit reached (${notificationsSent}/${MAX_DAILY_NOTIFICATIONS})`,
    bundleCount: throttleLog?.bundled_count || 0,
  };
}

async function recordNotificationSent(
  supabase: SupabaseClient,
  userId: string,
  today: string
): Promise<void> {
  // First check if record exists
  const { data: existing } = await supabase
    .from('notification_throttle_log')
    .select('notifications_sent')
    .eq('user_id', userId)
    .eq('notification_date', today)
    .single();

  if (existing) {
    // Update existing record
    await supabase
      .from('notification_throttle_log')
      .update({
        notifications_sent: (existing.notifications_sent || 0) + 1,
        last_notification_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('notification_date', today);
  } else {
    // Insert new record
    await supabase
      .from('notification_throttle_log')
      .insert({
        user_id: userId,
        notification_date: today,
        notifications_sent: 1,
        last_notification_at: new Date().toISOString(),
      });
  }
}

async function addToBundle(
  supabase: SupabaseClient,
  userId: string,
  notificationType: string,
  priority: number,
  payload: Record<string, unknown>
): Promise<void> {
  // Add to pending bundle
  await supabase
    .from('pending_notification_bundle')
    .insert({
      user_id: userId,
      notification_type: notificationType,
      priority,
      payload,
    });

  // Increment bundled count in throttle log
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('notification_throttle_log')
    .upsert({
      user_id: userId,
      notification_date: today,
      bundled_count: 1,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,notification_date',
    });
}

async function processPendingBundles(
  supabase: SupabaseClient
): Promise<{ processed: number; users: string[] }> {
  // Get all pending bundles grouped by user
  const { data: pendingBundles, error } = await supabase
    .from('pending_notification_bundle')
    .select('*')
    .is('processed_at', null)
    .order('user_id')
    .order('priority');

  if (error || !pendingBundles || pendingBundles.length === 0) {
    console.log('No pending bundles to process');
    return { processed: 0, users: [] };
  }

  // Group by user
  const bundlesByUser: Record<string, typeof pendingBundles> = {};
  for (const bundle of pendingBundles) {
    if (!bundlesByUser[bundle.user_id]) {
      bundlesByUser[bundle.user_id] = [];
    }
    bundlesByUser[bundle.user_id].push(bundle);
  }

  const processedUsers: string[] = [];

  for (const [userId, userBundles] of Object.entries(bundlesByUser)) {
    console.log(`Processing ${userBundles.length} bundled notifications for user ${userId}`);

    // Create a summary notification
    const summaryPayload = {
      bundled_notifications: userBundles.map(b => ({
        type: b.notification_type,
        payload: b.payload,
        created_at: b.created_at,
      })),
      bundle_count: userBundles.length,
    };

    // Insert a bundled notification to the queue
    const { data: queueEntry } = await supabase
      .from('notification_queue')
      .insert({
        user_id: userId,
        notification_type: 'bundled_summary',
        payload: summaryPayload,
        status: 'pending',
      })
      .select()
      .single();

    // Mark all bundles as processed
    const bundleIds = userBundles.map(b => b.id);
    await supabase
      .from('pending_notification_bundle')
      .update({
        processed_at: new Date().toISOString(),
        bundled_into: queueEntry?.id,
      })
      .in('id', bundleIds);

    processedUsers.push(userId);
  }

  return { processed: pendingBundles.length, users: processedUsers };
}

serve(handler);
