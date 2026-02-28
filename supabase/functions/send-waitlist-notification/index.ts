import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox, detailRow, alertBox } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface WaitlistNotificationRequest {
  userId: string;
  eventId: string;
  waitlistId: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, eventId, waitlistId }: WaitlistNotificationRequest = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) throw new Error("Could not fetch user information");

    const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', userId).single();
    const userName = profile?.first_name || 'Member';

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, date, time, location, venue_name, city, description')
      .eq('id', eventId).single();

    if (eventError || !event) throw new Error("Could not fetch event information");

    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const locationDisplay = event.venue_name || event.location || 'TBA';

    const htmlContent = buildBrandedEmail({
      preheader: `A spot opened up for ${event.title}!`,
      heading: "You're Next in Line!",
      subheading: "A Spot Just Opened Up",
      body: `
        ${p(`Hello ${userName},`)}
        ${p(`Great news! A spot has opened up for an event you've been waiting for. Claim your spot now before it's taken.`)}
        ${infoBox(`
          <h3 style="margin:0 0 12px;font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:600;color:#0D1F0F;">${event.title}</h3>
          ${detailRow('📅', 'Date', `${formattedDate}${event.time ? ` at ${event.time}` : ''}`)}
          ${detailRow('📍', 'Location', locationDisplay)}
        `)}
        ${alertBox(`<p style="margin:0;font-size:14px;color:#856404;text-align:center;">⚡ This spot won't last long! RSVP now to secure your place.</p>`)}
      `,
      ctaUrl: `${SITE_URL}/portal/events`,
      ctaText: "Claim Your Spot Now",
      footerText: "If you no longer wish to attend, you can remove yourself from the waitlist in the member portal.",
    });

    await resend.emails.send({
      from: SENDERS.events,
      to: [userData.user.email],
      subject: `🎉 A spot opened up for ${event.title}!`,
      html: htmlContent,
    });

    if (waitlistId) {
      await supabase.from('notification_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('user_id', userId).eq('notification_type', 'waitlist_spot_available').eq('status', 'pending');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Error in send-waitlist-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});