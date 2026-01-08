import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://qzqomqctuqldexnxgmlh.lovableproject.com';

const NOTIFICATION_TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  'new_match': { icon: '💕', label: 'New Match' },
  'mutual_match': { icon: '🎉', label: "It's a Match!" },
  'date_accepted': { icon: '📅', label: 'Date Accepted' },
  'dates_proposed': { icon: '📆', label: 'Dates Proposed' },
  'decision_time': { icon: '⏰', label: 'Decision Time' },
  'dating_vetted': { icon: '✅', label: 'Profile Approved' },
  'match_declined': { icon: '👋', label: 'Match Update' },
  'meeting_scheduled': { icon: '🗓️', label: 'Meeting Scheduled' },
};

function getBundledEmailHtml(displayName: string, notifications: Array<{ type: string; payload: Record<string, unknown>; created_at: string }>): string {
  const notificationRows = notifications.map(n => {
    const typeInfo = NOTIFICATION_TYPE_LABELS[n.type] || { icon: '📬', label: 'Update' };
    const description = getNotificationDescription(n.type, n.payload);
    return `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">${typeInfo.icon}</span>
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${typeInfo.label}</div>
              <div style="color: #666; font-size: 14px;">${description}</div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">Your Dating Updates 📬</h1>
        </div>
        
        <div style="background: #fff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
            Hi ${displayName},<br><br>
            Here's a summary of what happened while you were away:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 12px; overflow: hidden;">
            ${notificationRows}
          </table>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${SITE_URL}/portal/slow-dating" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              View All Updates
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            You're receiving this bundled summary to keep your inbox manageable.<br>
            <a href="${SITE_URL}/portal/slow-dating" style="color: #667eea;">Manage notification preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getNotificationDescription(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case 'new_match':
      return `You were matched with ${payload.match_display_name || 'someone special'}`;
    case 'mutual_match':
      return `You and ${payload.match_display_name || 'your match'} both said yes!`;
    case 'date_accepted':
      return `${payload.accepter_display_name || 'Your match'} accepted the date`;
    case 'dates_proposed':
      return `${payload.proposer_display_name || 'Your match'} proposed meeting dates`;
    case 'decision_time':
      return `Time to decide about ${payload.match_display_name || 'your date'}`;
    case 'dating_vetted':
      return 'Your dating profile has been approved';
    case 'match_declined':
      return 'A match has ended - we\'ll find you someone new';
    case 'meeting_scheduled':
      return `Meeting scheduled for ${payload.meeting_date || 'soon'}`;
    default:
      return 'You have a new update';
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Get all pending bundled_summary notifications
    const { data: bundledNotifications, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('notification_type', 'bundled_summary')
      .eq('status', 'pending');

    if (error || !bundledNotifications || bundledNotifications.length === 0) {
      console.log('No bundled notifications to process');
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedCount = 0;

    for (const notification of bundledNotifications) {
      try {
        const userId = notification.user_id;
        const payload = notification.payload as { bundled_notifications?: Array<{ type: string; payload: Record<string, unknown>; created_at: string }> };
        const bundledItems = payload.bundled_notifications || [];

        if (bundledItems.length === 0) {
          await supabase
            .from('notification_queue')
            .update({ status: 'skipped', sent_at: new Date().toISOString() })
            .eq('id', notification.id);
          continue;
        }

        // Get user info
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const userEmail = authUser?.user?.email;

        const { data: datingProfile } = await supabase
          .from('dating_profiles')
          .select('display_name, email_notifications_enabled')
          .eq('user_id', userId)
          .single();

        const displayName = datingProfile?.display_name || 'there';

        // Send email if enabled
        if (resend && userEmail && datingProfile?.email_notifications_enabled !== false) {
          const emailHtml = getBundledEmailHtml(displayName, bundledItems);

          await resend.emails.send({
            from: 'Slow Dating <notifications@resend.dev>',
            to: [userEmail],
            subject: `📬 ${bundledItems.length} Dating Updates for You`,
            html: emailHtml,
          });

          console.log(`Sent bundled email to ${userEmail} with ${bundledItems.length} notifications`);
        }

        // Mark as sent
        await supabase
          .from('notification_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', notification.id);

        processedCount++;
      } catch (err) {
        console.error(`Error processing bundled notification ${notification.id}:`, err);
        await supabase
          .from('notification_queue')
          .update({ 
            status: 'failed', 
            error_message: err instanceof Error ? err.message : 'Unknown error' 
          })
          .eq('id', notification.id);
      }
    }

    return new Response(JSON.stringify({ processed: processedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in process-notification-bundles:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
