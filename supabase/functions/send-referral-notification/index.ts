import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  referrer_id: string;
  notification_type: "signup" | "converted";
  referred_user_name?: string;
  referral_count?: number;
  reward_type?: string;
}

const MILESTONES = [
  { count: 1, reward: "Connector Badge", next: 3 },
  { count: 3, reward: "Free Month", next: 5 },
  { count: 5, reward: "Ambassador Badge", next: 10 },
  { count: 10, reward: "Lifetime VIP Status", next: null },
];

function getMilestoneInfo(count: number) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (count >= MILESTONES[i].count) {
      const nextMilestone = MILESTONES[i].next;
      return {
        current: MILESTONES[i],
        next: nextMilestone ? MILESTONES.find(m => m.count === nextMilestone) : null,
        remaining: nextMilestone ? nextMilestone - count : 0,
      };
    }
  }
  return { current: null, next: MILESTONES[0], remaining: 1 - count };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      referrer_id, 
      notification_type, 
      referred_user_name,
      referral_count,
      reward_type 
    }: NotificationRequest = await req.json();

    console.log(`Sending ${notification_type} notification to referrer ${referrer_id}`);

    // Get referrer profile and check preferences
    const { data: referrer, error: referrerError } = await supabase
      .from("profiles")
      .select("first_name, referral_count, referral_notifications_enabled")
      .eq("id", referrer_id)
      .single();

    if (referrerError || !referrer) {
      console.error("Referrer not found:", referrerError);
      return new Response(
        JSON.stringify({ error: "Referrer not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if notifications are disabled
    if (referrer.referral_notifications_enabled === false) {
      console.log(`Referrer ${referrer_id} has disabled referral notifications`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "notifications_disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get referrer email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(referrer_id);
    
    if (authError || !authUser?.user?.email) {
      console.error("Error getting referrer email:", authError);
      return new Response(
        JSON.stringify({ error: "Could not get referrer email" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const referrerEmail = authUser.user.email;
    const referrerName = referrer.first_name || "Member";
    const currentCount = referral_count || referrer.referral_count || 0;
    const milestoneInfo = getMilestoneInfo(currentCount);

    let subject: string;
    let headline: string;
    let mainContent: string;
    let ctaText: string;

    if (notification_type === "signup") {
      subject = "Someone joined using your referral code!";
      headline = "Great News! 🎉";
      mainContent = `
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
          Someone just signed up using your referral code! Thank you for spreading the word about our community.
        </p>
        <p style="color: #333; font-size: 18px; font-weight: 500; margin: 0 0 20px;">
          Your total referrals: <strong style="color: #3b82f6; font-size: 24px;">${currentCount}</strong>
        </p>
        ${milestoneInfo.next ? `
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
          Only <strong>${milestoneInfo.remaining}</strong> more referral${milestoneInfo.remaining === 1 ? '' : 's'} until you unlock: 
          <strong style="color: #10b981;">${milestoneInfo.next.reward}</strong>
        </p>
        ` : ''}
      `;
      ctaText = "VIEW YOUR REFERRALS";
    } else {
      subject = "Congratulations! Your referral became a member!";
      headline = "Conversion Success! 🏆";
      mainContent = `
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
          One of your referrals just became a full member of our community. That's a big win!
        </p>
        ${reward_type ? `
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Reward Earned</p>
          <p style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0;">${reward_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        </div>
        ` : ''}
        <p style="color: #333; font-size: 18px; font-weight: 500; margin: 0 0 20px;">
          Total converted referrals: <strong style="color: #10b981; font-size: 24px;">${currentCount}</strong>
        </p>
      `;
      ctaText = "VIEW YOUR DASHBOARD";
    }

    const portalUrl = `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/portal/referrals`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Club Referrals <onboarding@resend.dev>",
      to: [referrerEmail],
      subject: subject,
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
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">${headline}</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #333; font-size: 18px; margin: 0 0 24px;">Hello ${referrerName},</p>
                      
                      ${mainContent}
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                        <tr>
                          <td align="center">
                            <a href="${portalUrl}" 
                               style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                              ${ctaText}
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
                        Keep sharing and earn more rewards!
                      </p>
                      <p style="color: #999; font-size: 11px; margin: 8px 0 0;">
                        You can manage your notification preferences in your profile settings.
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

    console.log(`Referral notification sent to ${referrerEmail}:`, emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-referral-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
