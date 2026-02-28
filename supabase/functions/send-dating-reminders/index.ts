import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SITE_URL, SENDERS, p, infoBox, detailRow, alertBox } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const getTimeLabel = (timeValue: string): string => {
  const labels: Record<string, string> = {
    morning: 'Morning (10 AM - 12 PM)',
    afternoon: 'Afternoon (2 PM - 5 PM)',
    evening: 'Evening (6 PM - 9 PM)',
  };
  return labels[timeValue] || timeValue;
};

const getReminderEmailHtml = (displayName: string, matchName: string, meetingDate: string, meetingTime: string) =>
  buildBrandedEmail({
    preheader: `Reminder: Your date with ${matchName} is tomorrow!`,
    heading: "Your Date is Tomorrow!",
    subheading: "A gentle reminder",
    body: `
      ${p(`Hi ${displayName},`)}
      ${p(`Just a friendly reminder that you have a date with <strong>${matchName}</strong> scheduled for tomorrow!`)}
      ${infoBox(`
        ${detailRow("📅", "Meeting Date", meetingDate)}
        ${detailRow("🕐", "Time Slot", meetingTime)}
      `)}
      ${alertBox(`
        <p style="margin:0 0 10px;font-size:14px;color:#4A5A4D;font-weight:bold;">A few tips for tomorrow:</p>
        <ul style="margin:0;padding-left:20px;font-size:14px;color:#4A5A4D;line-height:24px;">
          <li>Review your match's profile one more time</li>
          <li>Think of a few conversation starters</li>
          <li>Get a good night's rest</li>
          <li>Just be yourself – there's no pressure!</li>
        </ul>
      `)}
    `,
    ctaUrl: `${SITE_URL}/portal/slow-dating`,
    ctaText: "View Match Details",
    footerText: "We're rooting for you! 💚",
  });

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  console.log("send-dating-reminders function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowDateStr = tomorrowStart.toISOString().split('T')[0];
    console.log(`Looking for meetings on: ${tomorrowDateStr}`);

    const { data: proposals, error: proposalsError } = await supabaseClient
      .from("meeting_proposals")
      .select("id, match_id, proposed_date, proposed_time, proposed_by")
      .eq("status", "accepted")
      .eq("proposed_date", tomorrowDateStr);

    if (proposalsError) throw proposalsError;
    console.log(`Found ${proposals?.length || 0} accepted proposals for tomorrow`);

    const results = [];

    for (const proposal of proposals || []) {
      const { data: matchData, error: matchError } = await supabaseClient
        .from("dating_matches")
        .select("id, user_a_id, user_b_id, status")
        .eq("id", proposal.match_id)
        .single();

      if (matchError || !matchData) continue;

      const profileIds = [matchData.user_a_id, matchData.user_b_id];
      const { data: profiles, error: profilesError } = await supabaseClient
        .from("dating_profiles")
        .select("id, user_id, display_name, email_notifications_enabled, push_notifications_enabled, sms_notifications_enabled, phone_number")
        .in("id", profileIds);

      if (profilesError || !profiles || profiles.length < 2) continue;

      for (const profile of profiles) {
        const { data: existingReminder } = await supabaseClient
          .from("dating_meeting_reminders")
          .select("id")
          .eq("meeting_proposal_id", proposal.id)
          .eq("user_id", profile.user_id)
          .eq("reminder_type", "24h")
          .single();

        if (existingReminder) continue;

        const matchedProfile = profiles.find(p => p.id !== profile.id);
        if (!matchedProfile) continue;

        const { data: userData } = await supabaseClient.auth.admin.getUserById(profile.user_id);
        if (!userData?.user?.email) continue;

        const userEmail = userData.user.email;
        const meetingDate = new Date(proposal.proposed_date).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
        const meetingTime = getTimeLabel(proposal.proposed_time);

        const { error: insertError } = await supabaseClient
          .from("dating_meeting_reminders")
          .insert({
            meeting_proposal_id: proposal.id,
            user_id: profile.user_id,
            reminder_type: "24h",
            status: "sending",
          });

        if (insertError) continue;

        try {
          if (profile.email_notifications_enabled !== false) {
            await resend.emails.send({
              from: SENDERS.dating,
              to: [userEmail],
              subject: "⏰ Your Date is Tomorrow!",
              html: getReminderEmailHtml(profile.display_name, matchedProfile.display_name, meetingDate, meetingTime),
            });
          }

          if (profile.push_notifications_enabled !== false) {
            await supabaseClient.functions.invoke("send-push-notification", {
              body: {
                user_id: profile.user_id,
                title: "Your Date is Tomorrow! ⏰",
                body: `Reminder: You're meeting ${matchedProfile.display_name} tomorrow at ${meetingTime.split(' ')[0]}`,
                data: { url: "/portal/slow-dating" },
                tag: "date_reminder",
              },
            });
          }

          if (profile.sms_notifications_enabled && profile.phone_number) {
            await supabaseClient.functions.invoke("send-sms", {
              body: {
                to: profile.phone_number,
                message: `⏰ Reminder: Your date with ${matchedProfile.display_name} is tomorrow! ${meetingTime}. Good luck! - Make Friends and Socialize`,
              },
            });
          }

          await supabaseClient
            .from("dating_meeting_reminders")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("meeting_proposal_id", proposal.id)
            .eq("user_id", profile.user_id)
            .eq("reminder_type", "24h");

          results.push({ proposal_id: proposal.id, user_id: profile.user_id, status: "sent" });
        } catch (sendError: any) {
          console.error(`Error sending reminder to ${profile.display_name}:`, sendError);
          await supabaseClient
            .from("dating_meeting_reminders")
            .update({ status: "failed", error_message: sendError.message })
            .eq("meeting_proposal_id", proposal.id)
            .eq("user_id", profile.user_id)
            .eq("reminder_type", "24h");
          results.push({ proposal_id: proposal.id, user_id: profile.user_id, status: "failed", error: sendError.message });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, reminders_sent: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-dating-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
