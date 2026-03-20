import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox, detailRow } from '../_shared/email-layout.ts';

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
      return 'A match has ended — we\'ll find you someone new';
    case 'meeting_scheduled':
      return `Meeting scheduled for ${payload.meeting_date || 'soon'}`;
    default:
      return 'You have a new update';
  }
}

function buildNotificationRows(notifications: Array<{ type: string; payload: Record<string, unknown>; created_at: string }>): string {
  return notifications.map(n => {
    const typeInfo = NOTIFICATION_TYPE_LABELS[n.type] || { icon: '📬', label: 'Update' };
    const description = getNotificationDescription(n.type, n.payload);
    return `
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid #E3E0D8;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="36" valign="top" style="font-size:22px;padding-right:14px;">${typeInfo.icon}</td>
              <td>
                <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0D1F0F;">${typeInfo.label}</p>
                <p style="margin:0;font-size:13px;color:#4A5A4D;line-height:1.4;">${description}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const userEmail = authUser?.user?.email;

        const { data: datingProfile } = await supabase
          .from('dating_profiles')
          .select('display_name, email_notifications_enabled')
          .eq('user_id', userId)
          .single();

        const displayName = datingProfile?.display_name || 'there';

        if (resend && userEmail && datingProfile?.email_notifications_enabled !== false) {
          const notificationRows = buildNotificationRows(bundledItems);

          const emailHtml = buildBrandedEmail({
            preheader: `You have ${bundledItems.length} new dating updates`,
            heading: "Your Dating Updates",
            subheading: "Intentional Connections Summary",
            body: `
              ${p(`Hi ${displayName},`)}
              ${p(`Here's a summary of what happened while you were away:`)}
              <div style="background-color:#E8E6E1;border-radius:12px;overflow:hidden;margin:0 0 24px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  ${notificationRows}
                </table>
              </div>
            `,
            ctaUrl: `${SITE_URL}/portal/slow-dating`,
            ctaText: "View All Updates",
            footerText: "You're receiving this bundled summary to keep your inbox manageable.",
          });

          await resend.emails.send({
            from: SENDERS.dating,
            to: [userEmail],
            subject: `📬 ${bundledItems.length} Dating Updates for You`,
            html: emailHtml,
          });

          console.log(`Sent bundled email to ${userEmail} with ${bundledItems.length} notifications`);
        }

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
