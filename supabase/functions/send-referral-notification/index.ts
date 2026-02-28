import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
      return { current: MILESTONES[i], next: nextMilestone ? MILESTONES.find(m => m.count === nextMilestone) : null, remaining: nextMilestone ? nextMilestone - count : 0 };
    }
  }
  return { current: null, next: MILESTONES[0], remaining: 1 - count };
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { referrer_id, notification_type, referral_count, reward_type }: NotificationRequest = await req.json();

    const { data: referrer, error: referrerError } = await supabase
      .from("profiles").select("first_name, referral_count, referral_notifications_enabled")
      .eq("id", referrer_id).single();

    if (referrerError || !referrer) return new Response(JSON.stringify({ error: "Referrer not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
    if (referrer.referral_notifications_enabled === false) return new Response(JSON.stringify({ success: true, skipped: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const { data: authUser } = await supabase.auth.admin.getUserById(referrer_id);
    if (!authUser?.user?.email) return new Response(JSON.stringify({ error: "No email" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const referrerName = referrer.first_name || "Member";
    const currentCount = referral_count || referrer.referral_count || 0;
    const milestoneInfo = getMilestoneInfo(currentCount);

    let subject: string, bodyContent: string;

    if (notification_type === "signup") {
      subject = "Someone joined using your referral code!";
      bodyContent = `
        ${p(`Hello ${referrerName},`)}
        ${p(`Someone just signed up using your referral code! Thank you for spreading the word about our community.`)}
        ${infoBox(`
          <p style="margin:0;font-size:14px;color:#4A5A4D;text-align:center;">Your total referrals</p>
          <p style="margin:4px 0 0;font-size:32px;font-weight:700;color:#8B6914;text-align:center;">${currentCount}</p>
          ${milestoneInfo.next ? `<p style="margin:8px 0 0;font-size:13px;color:#4A5A4D;text-align:center;">Only <strong>${milestoneInfo.remaining}</strong> more until you unlock: <strong style="color:#8B6914;">${milestoneInfo.next.reward}</strong></p>` : ''}
        `)}
      `;
    } else {
      subject = "Congratulations! Your referral became a member!";
      bodyContent = `
        ${p(`Hello ${referrerName},`)}
        ${p(`One of your referrals just became a full member. That's a big win!`)}
        ${reward_type ? infoBox(`
          <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8B6914;text-align:center;">Reward Earned</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:600;color:#0D1F0F;text-align:center;">${reward_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        `) : ''}
        ${infoBox(`<p style="margin:0;font-size:14px;color:#4A5A4D;text-align:center;">Total converted referrals: <strong style="font-size:24px;color:#8B6914;">${currentCount}</strong></p>`)}
      `;
    }

    await resend.emails.send({
      from: SENDERS.referrals,
      to: [authUser.user.email],
      subject,
      html: buildBrandedEmail({
        preheader: subject,
        heading: notification_type === "signup" ? "Great News! 🎉" : "Conversion Success! 🏆",
        body: bodyContent,
        ctaUrl: `${SITE_URL}/portal/referrals`,
        ctaText: notification_type === "signup" ? "View Your Referrals" : "View Your Dashboard",
        footerText: "Keep sharing and earn more rewards! You can manage notification preferences in your profile settings.",
      }),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error in send-referral-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);