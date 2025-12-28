import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  notification_id?: string;
  process_pending?: boolean;
}

const getVettedEmailHtml = (displayName: string) => `
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
            <td style="background-color: #1B4332; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">Welcome to Slow Dating</h1>
              <p style="color: #A3C9A8; margin: 10px 0 0 0; font-size: 16px;">You've Been Approved 💚</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${displayName},
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Wonderful news! Your Slow Dating profile has been carefully reviewed by our matchmakers, and we're delighted to welcome you into our curated dating community.
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Our team is now actively working to find meaningful connections for you based on your values, aspirations, and what you're looking for in a partner.
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                We believe in quality over quantity. Rather than endless swiping, we'll introduce you to carefully selected individuals who align with your vision for partnership.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${Deno.env.get("SITE_URL") || "https://the-gathering.lovable.app"}/portal/slow-dating" 
                       style="display: inline-block; background-color: #C65D3B; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Your Profile
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
                With warmth,<br>
                <strong>The Gathering Team</strong>
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

const getNewMatchEmailHtml = (displayName: string, matchName: string, compatibilityScore: number, matchReason: string) => `
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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">You Have a New Match!</h1>
              <p style="color: #FFE4D6; margin: 10px 0 0 0; font-size: 16px;">💕 Someone special is waiting</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news, ${displayName}!
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                We've found someone special who shares your values and vision for partnership. After careful consideration, our matchmakers believe you and <strong>${matchName}</strong> could be a wonderful match.
              </p>
              
              <!-- Match Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7FAFC; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #1B4332; font-size: 20px; margin: 0 0 8px 0; font-weight: bold;">
                      ${matchName}
                    </p>
                    <p style="color: #C65D3B; font-size: 24px; margin: 0 0 16px 0; font-weight: bold;">
                      ${compatibilityScore}% Compatible
                    </p>
                    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                      "${matchReason}"
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${Deno.env.get("SITE_URL") || "https://the-gathering.lovable.app"}/portal/slow-dating" 
                       style="display: inline-block; background-color: #1B4332; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Your Match
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
                With warmth,<br>
                <strong>The Gathering Team</strong>
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

    // If process_pending is true, fetch all pending notifications
    let notifications: any[] = [];
    
    if (notification_id) {
      const { data, error } = await supabaseClient
        .from("notification_queue")
        .select("*, profiles:user_id(first_name, last_name), auth_user:user_id(email)")
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
        // Fetch user email
        const { data: userData, error: userError } = await supabaseClient
          .auth.admin.getUserById(notification.user_id);
        
        if (userError || !userData?.user?.email) {
          console.error("Could not fetch user email:", userError);
          continue;
        }

        const userEmail = userData.user.email;
        const displayName = notification.payload?.display_name || "Member";

        let emailResult;

        if (notification.notification_type === "dating_vetted") {
          emailResult = await resend.emails.send({
            from: "The Gathering <onboarding@resend.dev>",
            to: [userEmail],
            subject: "Welcome to Slow Dating - You've Been Approved! 💚",
            html: getVettedEmailHtml(displayName),
          });
        } else if (notification.notification_type === "new_match") {
          const matchName = notification.payload?.match_display_name || "Your Match";
          const compatibilityScore = notification.payload?.compatibility_score || 0;
          const matchReason = notification.payload?.match_reason || "A promising connection";

          emailResult = await resend.emails.send({
            from: "The Gathering <onboarding@resend.dev>",
            to: [userEmail],
            subject: `You Have a New Match! 💕`,
            html: getNewMatchEmailHtml(displayName, matchName, compatibilityScore, matchReason),
          });
        }

        console.log("Email sent successfully:", emailResult);

        // Update notification status
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", notification.id);

        results.push({ id: notification.id, status: "sent" });
      } catch (emailError: any) {
        console.error("Error sending email:", emailError);

        // Update notification with error
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "failed",
            error_message: emailError.message,
          })
          .eq("id", notification.id);

        results.push({ id: notification.id, status: "failed", error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-dating-notification:", error);
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
