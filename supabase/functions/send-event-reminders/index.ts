import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  } | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting event reminder check...");

    // Get events happening in the next 23-25 hours (to catch the 24h window)
    const now = new Date();
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: upcomingEvents, error: eventsError } = await supabase
      .from("events")
      .select("id, title, date, time, location, venue_name, venue_address, description")
      .gte("date", in23Hours.toISOString().split("T")[0])
      .lte("date", in25Hours.toISOString().split("T")[0])
      .eq("status", "published");

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    console.log(`Found ${upcomingEvents?.length || 0} events in the 24h window`);

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return new Response(
        JSON.stringify({ message: "No events requiring reminders" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let remindersSent = 0;
    let remindersSkipped = 0;

    for (const event of upcomingEvents as EventWithRSVPs[]) {
      console.log(`Processing event: ${event.title} (${event.id})`);

      // Get confirmed RSVPs for this event
      const { data: rsvps, error: rsvpsError } = await supabase
        .from("event_rsvps")
        .select(`
          user_id,
          profiles:user_id (first_name)
        `)
        .eq("event_id", event.id)
        .eq("status", "confirmed");

      if (rsvpsError) {
        console.error(`Error fetching RSVPs for event ${event.id}:`, rsvpsError);
        continue;
      }

      console.log(`Found ${rsvps?.length || 0} RSVPs for event ${event.title}`);

      for (const rsvp of (rsvps as unknown as RSVPWithProfile[]) || []) {
        // Check if reminder already sent
        const { data: existingReminder } = await supabase
          .from("event_reminders")
          .select("id")
          .eq("event_id", event.id)
          .eq("user_id", rsvp.user_id)
          .eq("reminder_type", "24h")
          .eq("status", "sent")
          .single();

        if (existingReminder) {
          console.log(`Reminder already sent to user ${rsvp.user_id} for event ${event.id}`);
          remindersSkipped++;
          continue;
        }

        // Get user email from auth
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(rsvp.user_id);
        
        if (authError || !authUser?.user?.email) {
          console.error(`Error getting email for user ${rsvp.user_id}:`, authError);
          continue;
        }

        const userEmail = authUser.user.email;
        const firstName = rsvp.profiles?.first_name || "Member";

        // Format event date nicely
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const eventTime = event.time || "Time TBA";
        const eventLocation = event.venue_name || event.location || "Location TBA";
        const eventAddress = event.venue_address || "";

        // Create reminder record first
        const { data: reminderRecord, error: insertError } = await supabase
          .from("event_reminders")
          .insert({
            event_id: event.id,
            user_id: rsvp.user_id,
            reminder_type: "24h",
            status: "pending",
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error creating reminder record:`, insertError);
          continue;
        }

        try {
          // Send reminder email
          const emailResponse = await resend.emails.send({
            from: "Club Events <onboarding@resend.dev>",
            to: [userEmail],
            subject: `Reminder: ${event.title} is Tomorrow!`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                  <tr>
                    <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">EVENT REMINDER</h1>
                          </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                          <td style="padding: 40px;">
                            <p style="color: #333; font-size: 18px; margin: 0 0 20px;">Hello ${firstName},</p>
                            
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                              This is a friendly reminder that <strong>${event.title}</strong> is happening tomorrow!
                            </p>
                            
                            <!-- Event Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                              <tr>
                                <td>
                                  <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 16px; font-weight: 500;">${event.title}</h2>
                                  
                                  <p style="color: #666; font-size: 14px; margin: 0 0 8px;">
                                    📅 <strong>${formattedDate}</strong>
                                  </p>
                                  <p style="color: #666; font-size: 14px; margin: 0 0 8px;">
                                    🕐 <strong>${eventTime}</strong>
                                  </p>
                                  <p style="color: #666; font-size: 14px; margin: 0 0 8px;">
                                    📍 <strong>${eventLocation}</strong>
                                  </p>
                                  ${eventAddress ? `<p style="color: #888; font-size: 13px; margin: 0;">${eventAddress}</p>` : ""}
                                </td>
                              </tr>
                            </table>
                            
                            ${event.description ? `
                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">
                              ${event.description.substring(0, 200)}${event.description.length > 200 ? "..." : ""}
                            </p>
                            ` : ""}
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center">
                                  <a href="${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app")}/events" 
                                     style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                                    VIEW EVENT DETAILS
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="background-color: #f8f8f8; padding: 24px; text-align: center; border-top: 1px solid #eee;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                              We look forward to seeing you there!
                            </p>
                            <p style="color: #999; font-size: 12px; margin: 8px 0 0;">
                              If you can no longer attend, please cancel your RSVP.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          });

          console.log(`Reminder email sent to ${userEmail} for event ${event.title}:`, emailResponse);

          // Update reminder status to sent
          await supabase
            .from("event_reminders")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", reminderRecord.id);

          remindersSent++;
        } catch (emailError: any) {
          console.error(`Error sending email to ${userEmail}:`, emailError);
          
          // Update reminder status to failed
          await supabase
            .from("event_reminders")
            .update({ status: "failed", error_message: emailError.message })
            .eq("id", reminderRecord.id);
        }
      }
    }

    console.log(`Reminder job complete. Sent: ${remindersSent}, Skipped: ${remindersSkipped}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        remindersSent, 
        remindersSkipped,
        message: `Processed ${upcomingEvents.length} events` 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-event-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
