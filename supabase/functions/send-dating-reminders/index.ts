import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));



const SITE_URL = Deno.env.get("SITE_URL") || "https://the-gathering.lovable.app";

const getTimeLabel = (timeValue: string): string => {
  const labels: Record<string, string> = {
    morning: 'Morning (10 AM - 12 PM)',
    afternoon: 'Afternoon (2 PM - 5 PM)',
    evening: 'Evening (6 PM - 9 PM)',
  };
  return labels[timeValue] || timeValue;
};

const getReminderEmailHtml = (displayName: string, matchName: string, meetingDate: string, meetingTime: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #C65D3B; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">Your Date is Tomorrow! ⏰</h1>
              <p style="color: #FFE4D6; margin: 10px 0 0 0; font-size: 16px;">A gentle reminder</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${displayName},
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Just a friendly reminder that you have a date with <strong>${matchName}</strong> scheduled for tomorrow!
              </p>
              
              <!-- Meeting Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1B4332; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #A3C9A8; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      Meeting Date
                    </p>
                    <p style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; font-weight: bold;">
                      ${meetingDate}
                    </p>
                    <p style="color: #A3C9A8; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      Time Slot
                    </p>
                    <p style="color: #ffffff; font-size: 18px; margin: 0;">
                      ${meetingTime}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Tips Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7FAFC; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1B4332;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #2D3748; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">
                      A few tips for tomorrow:
                    </p>
                    <ul style="color: #4A5568; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Review your match's profile one more time</li>
                      <li>Think of a few conversation starters</li>
                      <li>Get a good night's rest</li>
                      <li>Just be yourself – there's no pressure!</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${SITE_URL}/portal/slow-dating" 
                       style="display: inline-block; background-color: #1B4332; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Match Details
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                We're rooting for you! 💚<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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

    // Get tomorrow's date range (23-25 hours from now)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const tomorrowDateStr = tomorrowStart.toISOString().split('T')[0];
    console.log(`Looking for meetings on: ${tomorrowDateStr}`);

    // Find accepted meeting proposals for tomorrow
    const { data: proposals, error: proposalsError } = await supabaseClient
      .from("meeting_proposals")
      .select(`
        id,
        match_id,
        proposed_date,
        proposed_time,
        proposed_by
      `)
      .eq("status", "accepted")
      .eq("proposed_date", tomorrowDateStr);

    if (proposalsError) {
      console.error("Error fetching proposals:", proposalsError);
      throw proposalsError;
    }

    console.log(`Found ${proposals?.length || 0} accepted proposals for tomorrow`);

    const results = [];

    for (const proposal of proposals || []) {
      // Fetch the match separately
      const { data: matchData, error: matchError } = await supabaseClient
        .from("dating_matches")
        .select("id, user_a_id, user_b_id, status")
        .eq("id", proposal.match_id)
        .single();

      if (matchError || !matchData) {
        console.error("Error fetching match:", matchError);
        continue;
      }

      const profileIds = [matchData.user_a_id, matchData.user_b_id];

      // Get both dating profiles
      const { data: profiles, error: profilesError } = await supabaseClient
        .from("dating_profiles")
        .select("id, user_id, display_name, email_notifications_enabled, push_notifications_enabled, sms_notifications_enabled, phone_number")
        .in("id", profileIds);

      if (profilesError || !profiles || profiles.length < 2) {
        console.error("Error fetching profiles:", profilesError);
        continue;
      }

      for (const profile of profiles) {
        // Check if reminder already sent
        const { data: existingReminder } = await supabaseClient
          .from("dating_meeting_reminders")
          .select("id")
          .eq("meeting_proposal_id", proposal.id)
          .eq("user_id", profile.user_id)
          .eq("reminder_type", "24h")
          .single();

        if (existingReminder) {
          console.log(`Reminder already sent for proposal ${proposal.id} to user ${profile.user_id}`);
          continue;
        }

        // Find the other person's profile
        const matchedProfile = profiles.find(p => p.id !== profile.id);
        if (!matchedProfile) continue;

        // Get user email
        const { data: userData } = await supabaseClient
          .auth.admin.getUserById(profile.user_id);

        if (!userData?.user?.email) {
          console.error(`Could not get email for user ${profile.user_id}`);
          continue;
        }

        const userEmail = userData.user.email;
        const meetingDate = new Date(proposal.proposed_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const meetingTime = getTimeLabel(proposal.proposed_time);

        // Create reminder tracking record
        const { error: insertError } = await supabaseClient
          .from("dating_meeting_reminders")
          .insert({
            meeting_proposal_id: proposal.id,
            user_id: profile.user_id,
            reminder_type: "24h",
            status: "sending",
          });

        if (insertError) {
          console.error("Error creating reminder record:", insertError);
          continue;
        }

        try {
          // Send email if enabled
          if (profile.email_notifications_enabled !== false) {
            await resend.emails.send({
              from: "Make Friends and Socialize <onboarding@resend.dev>",
              to: [userEmail],
              subject: "⏰ Your Date is Tomorrow!",
              html: getReminderEmailHtml(profile.display_name, matchedProfile.display_name, meetingDate, meetingTime),
            });
            console.log(`Email reminder sent to ${profile.display_name}`);
          }

          // Send push notification if enabled
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
            console.log(`Push reminder sent to ${profile.display_name}`);
          }

          // Send SMS if enabled and phone number is set
          if (profile.sms_notifications_enabled && profile.phone_number) {
            await supabaseClient.functions.invoke("send-sms", {
              body: {
                to: profile.phone_number,
                message: `⏰ Reminder: Your date with ${matchedProfile.display_name} is tomorrow! ${meetingTime}. Good luck! - Make Friends and Socialize`,
              },
            });
            console.log(`SMS reminder sent to ${profile.display_name}`);
          }

          // Update reminder as sent
          await supabaseClient
            .from("dating_meeting_reminders")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("meeting_proposal_id", proposal.id)
            .eq("user_id", profile.user_id)
            .eq("reminder_type", "24h");

          results.push({
            proposal_id: proposal.id,
            user_id: profile.user_id,
            status: "sent",
          });
        } catch (sendError: any) {
          console.error(`Error sending reminder to ${profile.display_name}:`, sendError);

          await supabaseClient
            .from("dating_meeting_reminders")
            .update({
              status: "failed",
              error_message: sendError.message,
            })
            .eq("meeting_proposal_id", proposal.id)
            .eq("user_id", profile.user_id)
            .eq("reminder_type", "24h");

          results.push({
            proposal_id: proposal.id,
            user_id: profile.user_id,
            status: "failed",
            error: sendError.message,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, reminders_sent: results.length, results }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-dating-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
