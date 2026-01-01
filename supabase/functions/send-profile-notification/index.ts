import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProfileNotificationRequest {
  user_id: string;
  notification_type: "profile_complete" | "badge_earned";
  badge_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, notification_type, badge_name }: ProfileNotificationRequest = await req.json();

    console.log(`Processing ${notification_type} notification for user ${user_id}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user email and profile
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !userData?.user?.email) {
      console.error("Error fetching user:", userError);
      throw new Error("User not found");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user_id)
      .single();

    const firstName = profile?.first_name || "Member";
    const userEmail = userData.user.email;

    let subject = "";
    let htmlContent = "";

    if (notification_type === "profile_complete") {
      subject = "🎉 Congratulations! Your Profile is Complete";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #fafafa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #c9a962; }
            .content { background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; padding: 40px; border: 1px solid #262626; }
            h1 { color: #c9a962; font-size: 24px; margin-bottom: 20px; }
            p { color: #a3a3a3; line-height: 1.6; margin-bottom: 16px; }
            .highlight { color: #fafafa; }
            .badge { display: inline-block; background: linear-gradient(135deg, #c9a962, #a67c00); color: #0a0a0a; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 20px 0; }
            .cta { display: inline-block; background: #c9a962; color: #0a0a0a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #525252; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Make Friends and Socialize</div>
            </div>
            <div class="content">
              <h1>Congratulations, ${firstName}! 🎉</h1>
              <p>Your profile is now <span class="highlight">100% complete</span>! You've unlocked the full potential of your membership.</p>
              
              <div class="badge">🎯 All Set Badge Earned</div>
              
              <p><span class="highlight">What you've unlocked:</span></p>
              <ul style="color: #a3a3a3; line-height: 2;">
                <li>✨ Your profile is now visible to other members</li>
                <li>🤝 Full access to the member network</li>
                <li>💬 Send and receive introduction requests</li>
              </ul>
              
              <p>Start connecting with like-minded individuals who share your passions and interests!</p>
              
              <a href="https://the-gathering.lovable.app/portal/network" class="cta">Explore The Network →</a>
            </div>
            <div class="footer">
              <p>Make Friends and Socialize — Where meaningful connections begin</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (notification_type === "badge_earned") {
      subject = `🏆 You've Earned a New Badge: ${badge_name}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #fafafa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #c9a962; }
            .content { background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; padding: 40px; border: 1px solid #262626; text-align: center; }
            h1 { color: #c9a962; font-size: 24px; margin-bottom: 20px; }
            p { color: #a3a3a3; line-height: 1.6; margin-bottom: 16px; }
            .badge-icon { font-size: 64px; margin: 20px 0; }
            .badge-name { font-size: 20px; color: #fafafa; font-weight: 600; }
            .cta { display: inline-block; background: #c9a962; color: #0a0a0a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #525252; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Make Friends and Socialize</div>
            </div>
            <div class="content">
              <div class="badge-icon">🏆</div>
              <h1>Badge Unlocked!</h1>
              <p class="badge-name">${badge_name}</p>
              <p>Great work, ${firstName}! Keep building your profile to unlock more achievements.</p>
              <a href="https://the-gathering.lovable.app/portal/dashboard" class="cta">View Your Badges →</a>
            </div>
            <div class="footer">
              <p>Make Friends and Socialize — Where meaningful connections begin</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Make Friends and Socialize <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending profile notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
