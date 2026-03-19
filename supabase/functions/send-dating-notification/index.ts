import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SITE_URL, SENDERS, p, h2, infoBox, detailRow, alertBox } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationRequest {
  notification_id?: string;
  process_pending?: boolean;
}

const getVettedEmailHtml = (displayName: string) =>
  buildBrandedEmail({
    preheader: "Your Slow Dating profile has been approved!",
    heading: "Welcome to Slow Dating",
    subheading: "You've Been Approved",
    body: `
      ${p(`Dear ${displayName},`)}
      ${p("Wonderful news! Your Slow Dating profile has been carefully reviewed by our matchmakers, and we're delighted to welcome you into our curated dating community.")}
      ${p("Our team is now actively working to find meaningful connections for you based on your values, aspirations, and what you're looking for in a partner.")}
      ${p("We believe in quality over quantity. Rather than endless swiping, we'll introduce you to carefully selected individuals who align with your vision for partnership.")}
    `,
    ctaUrl: `${SITE_URL}/portal/slow-dating`,
    ctaText: "View Your Profile",
  });

const getNewMatchEmailHtml = (displayName: string, matchName: string, compatibilityScore: number, matchReason: string) =>
  buildBrandedEmail({
    preheader: `You've been matched with ${matchName}!`,
    heading: "You Have a New Match!",
    subheading: "Someone special is waiting",
    body: `
      ${p(`Great news, ${displayName}!`)}
      ${p(`We've found someone special who shares your values and vision for partnership. After careful consideration, our matchmakers believe you and <strong>${matchName}</strong> could be a wonderful match.`)}
      ${infoBox(`
        ${detailRow("👤", "Match", matchName)}
        ${detailRow("💕", "Compatibility", `${compatibilityScore}%`)}
        <p style="margin:8px 0 0;font-size:14px;color:#4A5A4D;font-style:italic;">"${matchReason}"</p>
      `)}
    `,
    ctaUrl: `${SITE_URL}/portal/slow-dating`,
    ctaText: "View Your Match",
  });

const getMeetingScheduledEmailHtml = (displayName: string, meetingDate: string, meetingTime: string) =>
  buildBrandedEmail({
    preheader: "Your meeting has been confirmed!",
    heading: "Your Meeting is Confirmed!",
    subheading: "Mark your calendar",
    body: `
      ${p(`Dear ${displayName},`)}
      ${p("Great news! Your first meeting has been scheduled. We're excited for you to connect with your match in person.")}
      ${infoBox(`
        ${detailRow("📅", "Meeting Date", meetingDate)}
        ${detailRow("🕐", "Time Slot", meetingTime)}
      `)}
      ${p("<strong>What to expect:</strong><br>You'll meet at our curated venue for a relaxed conversation. Just be yourself – there's no pressure, just an opportunity to connect authentically.")}
    `,
    ctaUrl: `${SITE_URL}/portal/slow-dating`,
    ctaText: "View Match Details",
  });

const getDecisionTimeEmailHtml = (displayName: string, matchName: string) =>
  buildBrandedEmail({
    preheader: "How did your meeting go?",
    heading: "How Did It Go?",
    subheading: "We'd love to hear from you",
    body: `
      ${p(`Dear ${displayName},`)}
      ${p(`We hope your meeting with ${matchName} was a wonderful experience! We're curious to know how it went.`)}
      ${p("When you're ready, please log in to share your decision. Remember, your response is completely private – only you know what you've chosen until there's a mutual connection.")}
      ${alertBox(p("<strong>Remember:</strong> There's no pressure. Whether you felt a spark or not, your honest feedback helps us improve our matching process."))}
    `,
    ctaUrl: `${SITE_URL}/portal/slow-dating`,
    ctaText: "Share Your Decision",
  });

const getMutualMatchEmailHtml = (displayName: string, matchName: string, matchId: string) =>
  buildBrandedEmail({
    preheader: `It's a connection! You and ${matchName} both said yes!`,
    heading: "It's a Connection!",
    subheading: "You both felt the spark ✨",
    body: `
      ${p(`Wonderful news, ${displayName}!`)}
      ${p(`Both you and <strong>${matchName}</strong> expressed interest in continuing your connection. This is a beautiful moment, and we're thrilled to be part of your journey.`)}
      ${infoBox(`
        ${detailRow("💕", "Your Match", matchName)}
        <p style="margin:8px 0 0;font-size:14px;color:#4A5A4D;">Full profile now revealed!</p>
      `)}
      ${p("Their full profile is now visible in your portal. Take some time to learn more about them – we hope this is the beginning of something beautiful.")}
    `,
    ctaUrl: `${SITE_URL}/portal/match/${matchId}`,
    ctaText: `View ${matchName}'s Profile`,
  });

const getMatchDeclinedEmailHtml = (displayName: string) =>
  buildBrandedEmail({
    preheader: "An update about your recent match",
    heading: "Match Update",
    subheading: "Some news about your recent match",
    body: `
      ${p(`Dear ${displayName},`)}
      ${p("We wanted to let you know that this particular match has come to a close. While it wasn't meant to be this time, please know that finding the right connection takes time.")}
      ${p("Our matchmakers continue to search for meaningful connections for you. The right person is out there, and we're committed to helping you find them.")}
      ${alertBox(p("<strong>Remember:</strong> Every step in this journey brings you closer to finding your person. Stay open, stay authentic, and trust the process. 💚"))}
    `,
    ctaUrl: `${SITE_URL}/portal/slow-dating`,
    ctaText: "View Your Matches",
  });

const getDatesProposedEmailHtml = (displayName: string, proposerName: string) =>
  buildBrandedEmail({
    preheader: `${proposerName} has proposed dates to meet!`,
    heading: "New Date Proposals!",
    subheading: `${proposerName} wants to meet`,
    body: `
      ${p(`Exciting news, ${displayName}!`)}
      ${p(`<strong>${proposerName}</strong> has proposed some dates to meet! Log in to review their suggested times and select one that works for you.`)}
      ${alertBox(p("<strong>Tip:</strong> Review the proposed dates and accept one that fits your schedule. If none work, you can suggest alternatives."))}
    `,
    ctaUrl: `${SITE_URL}/portal/slow-dating`,
    ctaText: "View Date Proposals",
  });

const getDateAcceptedEmailHtml = (displayName: string, accepterName: string, meetingDate: string, meetingTime: string) =>
  buildBrandedEmail({
    preheader: `${accepterName} accepted your date proposal!`,
    heading: "Your Date is Confirmed!",
    subheading: `${accepterName} accepted your date`,
    body: `
      ${p(`Wonderful news, ${displayName}!`)}
      ${p(`<strong>${accepterName}</strong> has accepted one of your proposed dates! Your meeting is now confirmed.`)}
      ${infoBox(`
        ${detailRow("📅", "Meeting Date", meetingDate)}
        ${detailRow("🕐", "Time Slot", meetingTime)}
      `)}
    `,
    ctaUrl: `${SITE_URL}/portal/slow-dating`,
    ctaText: "View Match Details",
  });

const getTimeLabel = (timeValue: string): string => {
  const labels: Record<string, string> = {
    morning: 'Morning (10 AM - 12 PM)',
    afternoon: 'Afternoon (2 PM - 5 PM)',
    evening: 'Evening (6 PM - 9 PM)',
  };
  return labels[timeValue] || timeValue;
};

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  console.log("send-dating-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { notification_id, process_pending }: NotificationRequest = await req.json();

    let notifications: any[] = [];
    
    if (notification_id) {
      const { data, error } = await supabaseClient
        .from("notification_queue")
        .select("*")
        .eq("id", notification_id)
        .eq("status", "pending");
      if (error) throw error;
      notifications = data || [];
    } else if (process_pending) {
      const { data, error } = await supabaseClient
        .from("notification_queue")
        .select("*")
        .eq("status", "pending")
        .limit(10);
      if (error) throw error;
      notifications = data || [];
    }

    console.log(`Processing ${notifications.length} notifications`);
    const results = [];

    for (const notification of notifications) {
      try {
        const { data: userData, error: userError } = await supabaseClient
          .auth.admin.getUserById(notification.user_id);
        
        if (userError || !userData?.user?.email) {
          console.error("Could not fetch user email:", userError);
          continue;
        }

        const userEmail = userData.user.email;
        const displayName = notification.payload?.display_name || "Member";

        const { data: datingProfile } = await supabaseClient
          .from("dating_profiles")
          .select("email_notifications_enabled, push_notifications_enabled")
          .eq("user_id", notification.user_id)
          .single();

        const emailEnabled = datingProfile?.email_notifications_enabled !== false;
        const pushEnabled = datingProfile?.push_notifications_enabled !== false;

        let emailResult;
        let subject = "";
        let pushTitle = "";
        let pushBody = "";

        switch (notification.notification_type) {
          case "dating_vetted":
            subject = "Welcome to Slow Dating - You've Been Approved! 💚";
            pushTitle = "Profile Approved! 💚";
            pushBody = "Your dating profile has been approved. Start meeting your matches!";
            smsMessage = "💚 Your dating profile has been approved! Log in to start meeting your matches.";
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: SENDERS.dating,
                to: [userEmail],
                subject,
                html: getVettedEmailHtml(displayName),
              });
            }
            break;

          case "new_match":
            const matchName = notification.payload?.match_display_name || "Your Match";
            const compatibilityScore = notification.payload?.compatibility_score || 0;
            const matchReason = notification.payload?.match_reason || "A promising connection";
            subject = "You Have a New Match! 💕";
            pushTitle = "New Match! 💕";
            pushBody = `You've been matched with ${matchName}. Check it out!`;
            smsMessage = `💕 You have a new match! Log in to see your ${compatibilityScore}% compatibility with ${matchName}.`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: SENDERS.dating,
                to: [userEmail],
                subject,
                html: getNewMatchEmailHtml(displayName, matchName, compatibilityScore, matchReason),
              });
            }
            break;

          case "meeting_scheduled":
            const meetingDate = notification.payload?.meeting_date || "TBD";
            const meetingTime = getTimeLabel(notification.payload?.meeting_time || "afternoon");
            subject = "Your Meeting is Confirmed! 📅";
            pushTitle = "Meeting Confirmed! 📅";
            pushBody = `Your meeting is scheduled for ${meetingDate}`;
            smsMessage = `📅 Your date is confirmed for ${meetingDate} (${meetingTime.split(' ')[0]}). Good luck!`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: SENDERS.dating,
                to: [userEmail],
                subject,
                html: getMeetingScheduledEmailHtml(displayName, meetingDate, meetingTime),
              });
            }
            break;

          case "decision_time":
            const decisionMatchName = notification.payload?.match_display_name || "your match";
            subject = "How Did Your Meeting Go? 💭";
            pushTitle = "Decision Time 💭";
            pushBody = "How did your meeting go? Share your decision now.";
            smsMessage = "💭 How did your date go? Log in to share your decision.";
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: SENDERS.dating,
                to: [userEmail],
                subject,
                html: getDecisionTimeEmailHtml(displayName, decisionMatchName),
              });
            }
            break;

          case "mutual_match":
            const mutualMatchName = notification.payload?.match_display_name || "Your Match";
            const matchId = notification.payload?.match_id || "";
            subject = "🎉 It's a Connection!";
            pushTitle = "It's a Connection! 🎉";
            pushBody = `You and ${mutualMatchName} both want to continue!`;
            smsMessage = `🎉 It's a match! You and ${mutualMatchName} both said yes. Full profile now revealed!`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: SENDERS.dating,
                to: [userEmail],
                subject,
                html: getMutualMatchEmailHtml(displayName, mutualMatchName, matchId),
              });
            }
            break;

          case "match_declined":
            subject = "Match Update";
            pushTitle = "Match Update";
            pushBody = "An update about your recent match.";
            smsMessage = "An update on your match. Log in for details.";
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: SENDERS.dating,
                to: [userEmail],
                subject,
                html: getMatchDeclinedEmailHtml(displayName),
              });
            }
            break;

          case "dates_proposed":
            const proposerName = notification.payload?.proposer_display_name || "Your Match";
            subject = `📅 ${proposerName} Proposed Dates to Meet!`;
            pushTitle = "New Date Proposals! 📅";
            pushBody = `${proposerName} has proposed dates to meet you!`;
            smsMessage = `📅 ${proposerName} proposed dates to meet! Log in to review and accept.`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: SENDERS.dating,
                to: [userEmail],
                subject,
                html: getDatesProposedEmailHtml(displayName, proposerName),
              });
            }
            break;

          case "date_accepted":
            const accepterName = notification.payload?.accepter_display_name || "Your Match";
            const acceptedDate = notification.payload?.meeting_date || "TBD";
            const acceptedTime = getTimeLabel(notification.payload?.meeting_time || "afternoon");
            subject = `🎉 ${accepterName} Accepted Your Date!`;
            pushTitle = "Date Confirmed! 🎉";
            pushBody = `${accepterName} accepted your date for ${acceptedDate}!`;
            smsMessage = `🎉 ${accepterName} accepted your date for ${acceptedDate}! Log in for details.`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: SENDERS.dating,
                to: [userEmail],
                subject,
                html: getDateAcceptedEmailHtml(displayName, accepterName, acceptedDate, acceptedTime),
              });
            }
            break;

          default:
            console.log(`Unknown notification type: ${notification.notification_type}`);
            continue;
        }

        // Send push notification if enabled
        if (pushEnabled && pushTitle) {
          try {
            await supabaseClient.functions.invoke("send-push-notification", {
              body: {
                user_id: notification.user_id,
                title: pushTitle,
                body: pushBody,
                data: { url: "/portal/slow-dating" },
                tag: notification.notification_type,
              },
            });
          } catch (pushError) {
            console.error("Push notification error:", pushError);
          }
        }

        // Send SMS if enabled — direct Twilio call (no JWT needed)
        if (smsEnabled && smsMessage && phoneNumber) {
          try {
            const smsResult = await sendSms(phoneNumber, `${smsMessage} - Make Friends and Socialize`);
            if (!smsResult.success) console.warn("SMS failed:", smsResult.error);
          } catch (smsError) {
            console.error("SMS error:", smsError);
          }
        }

        // Update notification status
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", notification.id);

        results.push({
          notification_id: notification.id,
          type: notification.notification_type,
          status: "sent",
        });

        console.log(`Processed ${notification.notification_type} for user ${notification.user_id}`);
      } catch (notifError: any) {
        console.error(`Error processing notification ${notification.id}:`, notifError);

        await supabaseClient
          .from("notification_queue")
          .update({
            status: "failed",
            error: notifError.message,
          })
          .eq("id", notification.id);

        results.push({
          notification_id: notification.id,
          type: notification.notification_type,
          status: "failed",
          error: notifError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-dating-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
