import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ProfileNotificationRequest {
  user_id: string;
  notification_type: "profile_complete" | "badge_earned" | "account_created";
  badge_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, notification_type, badge_name }: ProfileNotificationRequest = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData?.user?.email) throw new Error("User not found");

    const { data: profile } = await supabase.from("profiles").select("first_name").eq("id", user_id).single();
    const firstName = profile?.first_name || "Member";
    const userEmail = userData.user.email;

    let subject = "", htmlContent = "";

    if (notification_type === "profile_complete") {
      subject = "🎉 Congratulations! Your Profile is Complete";
      htmlContent = buildBrandedEmail({
        preheader: "Your profile is 100% complete!",
        heading: `Congratulations, ${firstName}!`,
        subheading: "Your Profile is Complete",
        body: `
          ${p(`Your profile is now <strong style="color:#0D1F0F;">100% complete</strong>! You've unlocked the full potential of your membership.`)}
          <div style="background-color:#8B6914;border-radius:20px;padding:8px 16px;display:inline-block;margin:0 0 20px;">
            <span style="color:#ffffff;font-size:14px;font-weight:600;">🎯 All Set Badge Earned</span>
          </div>
          ${infoBox(`
            <p style="margin:0;font-size:14px;color:#4A5A4D;line-height:2;">
              ✨ Your profile is now visible to other members<br/>
              🤝 Full access to the member network<br/>
              💬 Send and receive introduction requests
            </p>
          `)}
          ${p(`Start connecting with like-minded individuals who share your passions and interests!`)}
        `,
        ctaUrl: `${SITE_URL}/portal/network`,
        ctaText: "Explore The Network",
        footerText: "Make Friends and Socialize · Where meaningful connections begin.",
      });
    } else if (notification_type === "badge_earned") {
      subject = `🏆 You've Earned a New Badge: ${badge_name}`;
      htmlContent = buildBrandedEmail({
        preheader: `Badge Unlocked: ${badge_name}`,
        heading: "Badge Unlocked!",
        body: `
          <div style="text-align:center;margin:0 0 20px;">
            <span style="font-size:64px;">🏆</span>
            <p style="margin:8px 0 0;font-size:20px;font-weight:600;color:#0D1F0F;">${badge_name}</p>
          </div>
          ${p(`Great work, ${firstName}! Keep building your profile to unlock more achievements.`)}
        `,
        ctaUrl: `${SITE_URL}/portal/dashboard`,
        ctaText: "View Your Badges",
        footerText: "Make Friends and Socialize · Where meaningful connections begin.",
      });
    } else if (notification_type === "account_created") {
      subject = "Welcome to Make Friends and Socialize! 🎉";
      htmlContent = buildBrandedEmail({
        preheader: "Welcome! Your account has been created.",
        heading: `Welcome, ${firstName}!`,
        subheading: "Your Journey Begins",
        body: `
          ${p(`Your account has been <strong style="color:#0D1F0F;">successfully created</strong>. You're now one step closer to joining our exclusive community.`)}
          ${infoBox(`
            <p style="margin:0;font-size:14px;color:#4A5A4D;line-height:2;">
              ✅ Complete your profile in the member portal<br/>
              🔍 Your application will be reviewed by our team<br/>
              🤝 Once approved, you'll gain full access to the network
            </p>
          `)}
          ${p(`Start setting up your profile to get ahead in the review queue!`)}
        `,
        ctaUrl: `${SITE_URL}/portal/onboarding`,
        ctaText: "Complete Your Profile",
        footerText: "Make Friends and Socialize · Where meaningful connections begin.",
      });
    }

    await resend.emails.send({ from: SENDERS.hello, to: [userEmail], subject, html: htmlContent });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending profile notification:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);