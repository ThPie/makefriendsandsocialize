import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox, detailRow } from '../_shared/email-layout.ts';
import { sendSms } from '../_shared/sms.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface RSVPNotificationRequest {
  userId: string;
  eventId: string;
  action: 'rsvp' | 'cancel';
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, eventId, action }: RSVPNotificationRequest = await req.json();
    console.log("Processing RSVP notification:", { userId, eventId, action });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) throw new Error("Could not fetch user information");

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    const userName = profile?.first_name || 'Member';

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, date, time, location, venue_name, city, description')
      .eq('id', eventId)
      .single();

    if (eventError || !event) throw new Error("Could not fetch event information");

    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const locationDisplay = event.venue_name || event.location || 'TBA';
    const cityDisplay = event.city ? ` · ${event.city}` : '';

    let subject: string;
    let htmlContent: string;

    if (action === 'rsvp') {
      subject = `🎉 You're confirmed for ${event.title}`;
      htmlContent = buildBrandedEmail({
        preheader: `You're in! See you at ${event.title}`,
        heading: "You're In!",
        subheading: "Event Registration Confirmed",
        body: `
          ${p(`Hello ${userName},`)}
          ${p(`Your RSVP has been confirmed for the following event:`)}
          ${infoBox(`
            <h3 style="margin:0 0 12px;font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:600;color:#0D1F0F;">${event.title}</h3>
            ${detailRow('📅', 'Date', `${formattedDate}${event.time ? ` at ${event.time}` : ''}`)}
            ${detailRow('📍', 'Location', `${locationDisplay}${cityDisplay}`)}
            ${event.description ? `<p style="margin:12px 0 0;font-size:14px;color:#4A5A4D;line-height:1.5;">${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}</p>` : ''}
          `)}
          ${p(`We look forward to seeing you there! If your plans change, you can update your RSVP through the member portal.`)}
        `,
        ctaUrl: `${SITE_URL}/portal/events`,
        ctaText: "View Event Details",
        footerText: "Make Friends and Socialize · Making authentic connections happen.",
      });
    } else {
      subject = `RSVP Cancelled: ${event.title}`;
      htmlContent = buildBrandedEmail({
        preheader: `Your RSVP for ${event.title} has been cancelled`,
        heading: "RSVP Cancelled",
        body: `
          ${p(`Hello ${userName},`)}
          ${p(`Your RSVP for <strong style="color:#0D1F0F;">${event.title}</strong> on ${formattedDate} has been cancelled.`)}
          ${p(`Changed your mind? You can RSVP again anytime through the member portal.`)}
        `,
        ctaUrl: `${SITE_URL}/events`,
        ctaText: "Browse Events",
        footerText: "Make Friends and Socialize · Making authentic connections happen.",
      });
    }

    const emailResponse = await resend.emails.send({
      from: SENDERS.events,
      to: [userData.user.email],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send SMS notification
    const { data: profileData } = await supabase
      .from('profiles')
      .select('phone_number, sms_notifications_enabled')
      .eq('id', userId)
      .single();

    if (profileData?.sms_notifications_enabled && profileData?.phone_number) {
      const smsBody = action === 'rsvp'
        ? `🎉 You're confirmed for ${event.title} on ${formattedDate}! See you there. - Make Friends and Socialize`
        : `Your RSVP for ${event.title} has been cancelled. You can RSVP again anytime. - Make Friends and Socialize`;
      const smsResult = await sendSms(profileData.phone_number, smsBody);
      console.log("SMS result:", smsResult);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-rsvp-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});