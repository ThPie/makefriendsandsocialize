import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));



interface WaitlistNotificationRequest {
  userId: string;
  eventId: string;
  waitlistId: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, eventId, waitlistId }: WaitlistNotificationRequest = await req.json();

    console.log("Processing waitlist promotion notification:", { userId, eventId, waitlistId });

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
      .select('title, date, time, location, venue_name, city, description, capacity')
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

    const subject = `🎉 A spot opened up for ${event.title}!`;
    const htmlContent = `
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
              <div style="background: #d4a959; color: #0d1a14; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">
                Spot Available
              </div>
              <h1 style="color: #d4a959; font-size: 28px; margin: 0; font-weight: 300;">You're Next in Line!</h1>
            </div>
            
            <p style="color: #e8e4db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello ${userName},
            </p>
            
            <p style="color: #a0998c; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              Great news! A spot has opened up for an event you've been waiting for. Claim your spot now before it's taken by someone else.
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
            
            <div style="background: rgba(212, 169, 89, 0.1); border: 1px solid rgba(212, 169, 89, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #d4a959; font-size: 14px; margin: 0; text-align: center;">
                ⚡ This spot won't last long! RSVP now to secure your place.
              </p>
            </div>
            
            <div style="text-align: center;">
              <a href="${Deno.env.get('SITE_URL') || 'https://lovable.dev'}/portal/events" 
                 style="display: inline-block; background: #d4a959; color: #0d1a14; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Claim Your Spot Now
              </a>
            </div>
            
            <p style="color: #6b6960; font-size: 12px; line-height: 1.6; margin-top: 24px; text-align: center;">
              If you no longer wish to attend, you can remove yourself from the waitlist in the member portal.
            </p>
          </div>
          
          <p style="text-align: center; color: #6b6960; font-size: 12px; margin-top: 24px;">
            Make Friends and Socialize • Premium Membership Club
          </p>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Events <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html: htmlContent,
    });

    console.log("Waitlist promotion email sent successfully:", emailResponse);

    // Update the notification queue entry to mark as sent
    if (waitlistId) {
      const { error: updateError } = await supabase
        .from('notification_queue')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('notification_type', 'waitlist_spot_available')
        .eq('status', 'pending');

      if (updateError) {
        console.error("Error updating notification queue:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Waitlist notification sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-waitlist-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
