import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type = 'test' } = await req.json().catch(() => ({}));
    
    console.log(`Sending test push notification to user ${user.id}, type: ${type}`);

    // Determine notification content based on type
    let notificationData;
    
    switch (type) {
      case 'event-reminder':
        notificationData = {
          user_id: user.id,
          title: '🎉 Event Tomorrow!',
          body: 'Your event "Networking Mixer" is happening tomorrow at 7 PM',
          tag: 'event-reminder',
          data: { 
            url: '/portal/events',
            eventId: 'test-event-123',
            venueAddress: 'San Francisco, CA'
          }
        };
        break;
        
      case 'new-match':
        notificationData = {
          user_id: user.id,
          title: '✨ New Match!',
          body: "We've found someone special for you. Check out your new match!",
          tag: 'new-match',
          data: { url: '/portal/slow-dating' }
        };
        break;
        
      case 'mutual-match':
        notificationData = {
          user_id: user.id,
          title: '💕 It\'s a Match!',
          body: 'Great news! You both said yes. Time to plan your date!',
          tag: 'mutual-match',
          data: { url: '/portal/slow-dating' }
        };
        break;
        
      case 'meeting-reminder':
        notificationData = {
          user_id: user.id,
          title: '📅 Date Reminder',
          body: 'Your date with Alex is in 2 hours at The Coffee House',
          tag: 'meeting-reminder',
          data: { 
            url: '/portal/slow-dating',
            venueAddress: 'The Coffee House, Main St'
          }
        };
        break;
        
      case 'connection-request':
        notificationData = {
          user_id: user.id,
          title: '👋 New Connection Request',
          body: 'Sarah wants to connect with you',
          tag: 'connection-request',
          data: { url: '/portal/connections' }
        };
        break;
        
      default:
        notificationData = {
          user_id: user.id,
          title: '🔔 Test Notification',
          body: 'This is a test push notification from MakeFriends',
          tag: 'test',
          data: { url: '/portal/dashboard' }
        };
    }

    // Call the send-push-notification function
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: notificationData
    });

    if (error) {
      console.error('Error sending test notification:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Test notification result:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test notification sent',
        result: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in test-push-notification:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
