import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RSVPNotificationRequest {
  userId: string;
  eventId: string;
  action: 'rsvp' | 'cancel';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, eventId, action }: RSVPNotificationRequest = await req.json();

    console.log("Processing RSVP notification:", { userId, eventId, action });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData.user?.email) {
      console.error("Error fetching user:", userError);
      throw new Error("Could not fetch user information");
    }

    const userEmail = userData.user.email;

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    const userName = profile?.first_name || 'Member';

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, date, time, location, venue_name, city, description')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error("Error fetching event:", eventError);
      throw new Error("Could not fetch event information");
    }

    // Format date
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const locationDisplay = event.venue_name || event.location || 'TBA';
    const cityDisplay = event.city ? ` • ${event.city}` : '';

    // Create email content based on action
    let subject: string;
    let htmlContent: string;

    if (action === 'rsvp') {
      subject = `🎉 You're confirmed for ${event.title}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0d1a14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a2f23 0%, #0d1a14 100%); border-radius: 16px; padding: 40px; border: 1px solid #2a4a3a;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #d4a959; font-size: 28px; margin: 0; font-weight: 300;">You're In!</h1>
              </div>
              
              <p style="color: #e8e4db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Hello ${userName},
              </p>
              
              <p style="color: #a0998c; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Your RSVP has been confirmed for the following event:
              </p>
              
              <div style="background: #0d1a14; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #2a4a3a;">
                <h2 style="color: #e8e4db; font-size: 22px; margin: 0 0 16px 0; font-weight: 600;">
                  ${event.title}
                </h2>
                <p style="color: #d4a959; font-size: 14px; margin: 0 0 8px 0;">
                  📅 ${formattedDate}${event.time ? ` at ${event.time}` : ''}
                </p>
                <p style="color: #a0998c; font-size: 14px; margin: 0;">
                  📍 ${locationDisplay}${cityDisplay}
                </p>
                ${event.description ? `
                <p style="color: #a0998c; font-size: 14px; margin: 16px 0 0 0; line-height: 1.5;">
                  ${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}
                </p>
                ` : ''}
              </div>
              
              <p style="color: #a0998c; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                We look forward to seeing you there! If your plans change, you can update your RSVP through the member portal.
              </p>
              
              <div style="text-align: center;">
                <a href="${Deno.env.get('SITE_URL') || 'https://lovable.dev'}/portal/events" 
                   style="display: inline-block; background: #d4a959; color: #0d1a14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  View Event Details
                </a>
              </div>
            </div>
            
            <p style="text-align: center; color: #6b6960; font-size: 12px; margin-top: 24px;">
              Make Friends and Socialize • Premium Membership Club
            </p>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = `RSVP Cancelled: ${event.title}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0d1a14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a2f23 0%, #0d1a14 100%); border-radius: 16px; padding: 40px; border: 1px solid #2a4a3a;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #e8e4db; font-size: 28px; margin: 0; font-weight: 300;">RSVP Cancelled</h1>
              </div>
              
              <p style="color: #e8e4db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Hello ${userName},
              </p>
              
              <p style="color: #a0998c; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Your RSVP for <strong style="color: #e8e4db;">${event.title}</strong> on ${formattedDate} has been cancelled.
              </p>
              
              <p style="color: #a0998c; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                Changed your mind? You can RSVP again anytime through the member portal.
              </p>
              
              <div style="text-align: center;">
                <a href="${Deno.env.get('SITE_URL') || 'https://lovable.dev'}/events" 
                   style="display: inline-block; background: #2a4a3a; color: #e8e4db; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid #3a5a4a;">
                  Browse Events
                </a>
              </div>
            </div>
            
            <p style="text-align: center; color: #6b6960; font-size: 12px; margin-top: 24px;">
              Make Friends and Socialize • Premium Membership Club
            </p>
          </div>
        </body>
        </html>
      `;
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Events <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-rsvp-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
