import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox, detailRow } from '../_shared/email-layout.ts';
import { sendSms } from '../_shared/sms.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EventWithRSVPs {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  venue_name: string | null;
  venue_address: string | null;
  description: string | null;
}

interface RSVPWithProfile {
  user_id: string;
  profiles: {
    first_name: string | null;
    email_reminders_enabled: boolean | null;
  } | null;
}

async function sendPushNotification(
  supabase: any, userId: string, title: string, body: string, data: Record<string, string>
): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: { user_id: userId, title, body, tag: 'event-reminder', data }
    });
    if (error) { console.error(`Push failed for ${userId}:`, error); return false; }
    return true;
  } catch (err) { console.error(`Push error for ${userId}:`, err); return false; }
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    console.log("Starting event reminder check...");

    const now = new Date();
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: upcomingEvents, error: eventsError } = await supabase
      .from("events")
      .select("id, title, date, time, location, venue_name, venue_address, description")
      .gte("date", in23Hours.toISOString().split("T")[0])
      .lte("date", in25Hours.toISOString().split("T")[0])
      .eq("status", "published");

    if (eventsError) throw eventsError;
    console.log(`Found ${upcomingEvents?.length || 0} events in the 24h window`);

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return new Response(JSON.stringify({ message: "No events requiring reminders" }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    let remindersSent = 0, remindersSkipped = 0, pushNotificationsSent = 0;

    for (const event of upcomingEvents as EventWithRSVPs[]) {
      console.log(`Processing event: ${event.title} (${event.id})`);

      const { data: rsvps, error: rsvpsError } = await supabase
        .from("event_rsvps")
        .select(`user_id, profiles:user_id (first_name, email_reminders_enabled)`)
        .eq("event_id", event.id)
        .eq("status", "confirmed");

      if (rsvpsError) { console.error(`Error fetching RSVPs:`, rsvpsError); continue; }

      for (const rsvp of (rsvps as unknown as RSVPWithProfile[]) || []) {
        const { data: existingReminder } = await supabase
          .from("event_reminders").select("id")
          .eq("event_id", event.id).eq("user_id", rsvp.user_id)
          .eq("reminder_type", "24h").eq("status", "sent").single();

        if (existingReminder) { remindersSkipped++; continue; }

        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(rsvp.user_id);
        if (authError || !authUser?.user?.email) continue;

        const userEmail = authUser.user.email;
        const firstName = rsvp.profiles?.first_name || "Member";

        const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
        const eventTime = event.time || "Time TBA";
        const eventLocation = event.venue_name || event.location || "Location TBA";
        const eventAddress = event.venue_address || "";

        const { data: reminderRecord, error: insertError } = await supabase
          .from("event_reminders")
          .insert({ event_id: event.id, user_id: rsvp.user_id, reminder_type: "24h", status: "pending" })
          .select().single();

        if (insertError) continue;

        const pushSent = await sendPushNotification(supabase, rsvp.user_id,
          `🎉 ${event.title} is Tomorrow!`,
          `Don't forget - ${eventLocation} at ${eventTime}`,
          { url: `/events/${event.id}`, eventId: event.id, venueAddress: eventAddress }
        );
        if (pushSent) pushNotificationsSent++;

        // Send SMS reminder
        const { data: profileWithPhone } = await supabase
          .from("dating_profiles")
          .select("phone_number, sms_notifications_enabled")
          .eq("user_id", rsvp.user_id)
          .single();

        if (profileWithPhone?.sms_notifications_enabled && profileWithPhone?.phone_number) {
          const smsResult = await sendSms(
            profileWithPhone.phone_number,
            `⏰ Reminder: ${event.title} is tomorrow! ${eventTime} at ${eventLocation}. See you there! - Make Friends and Socialize`
          );
          if (smsResult.success) console.log(`SMS reminder sent to ${rsvp.user_id}`);
        }

        const userProfile = rsvp.profiles as { email_reminders_enabled?: boolean | null };
        if (userProfile?.email_reminders_enabled === false) {
          if (pushSent) {
            await supabase.from("event_reminders").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", reminderRecord.id);
            remindersSent++;
          }
          continue;
        }

        try {
          const htmlContent = buildBrandedEmail({
            preheader: `Reminder: ${event.title} is tomorrow!`,
            heading: "Event Reminder",
            subheading: `${event.title} is Tomorrow!`,
            body: `
              ${p(`Hello ${firstName},`)}
              ${p(`This is a friendly reminder that <strong style="color:#0D1F0F;">${event.title}</strong> is happening tomorrow!`)}
              ${infoBox(`
                <h3 style="margin:0 0 12px;font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:600;color:#0D1F0F;">${event.title}</h3>
                ${detailRow('📅', 'Date', formattedDate)}
                ${detailRow('🕐', 'Time', eventTime)}
                ${detailRow('📍', 'Location', eventLocation)}
                ${eventAddress ? `<p style="margin:4px 0 0 0;font-size:13px;color:#6B6960;">${eventAddress}</p>` : ""}
              `)}
              ${event.description ? p(event.description.substring(0, 200) + (event.description.length > 200 ? "..." : "")) : ""}
            `,
            ctaUrl: `${SITE_URL}/events`,
            ctaText: "View Event Details",
            footerText: "We look forward to seeing you there!",
          });

          await resend.emails.send({
            from: SENDERS.events,
            to: [userEmail],
            subject: `Reminder: ${event.title} is Tomorrow!`,
            html: htmlContent,
          });

          await supabase.from("event_reminders").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", reminderRecord.id);
          remindersSent++;
        } catch (emailError: unknown) {
          const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
          await supabase.from("event_reminders").update({ status: "failed", error_message: errorMessage }).eq("id", reminderRecord.id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, remindersSent, remindersSkipped, pushNotificationsSent }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-event-reminders:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);