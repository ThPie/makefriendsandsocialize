import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendInviteRequest {
  inviter_id: string;
  recipient_email: string;
  personal_message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { inviter_id, recipient_email, personal_message }: SendInviteRequest = await req.json();

    if (!inviter_id || !recipient_email) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const { data: inviter, error: inviterError } = await supabase
      .from("profiles").select("first_name, last_name, referral_code")
      .eq("id", inviter_id).single();

    if (inviterError || !inviter) return new Response(JSON.stringify({ error: "Inviter not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const inviterName = inviter.first_name ? `${inviter.first_name}${inviter.last_name ? ` ${inviter.last_name}` : ""}` : "A member";
    const referralCode = inviter.referral_code;
    const signupUrl = `${SITE_URL}/auth?ref=${referralCode}`;

    // Create referral record
    const { error: referralError } = await supabase.from("referrals").insert({
      referrer_id: inviter_id, referral_code: referralCode, referred_email: recipient_email, status: "pending",
    });
    if (referralError && !referralError.message.includes("duplicate")) console.error("Referral record error:", referralError);

    const messageBlock = personal_message
      ? `<div style="background-color:#E8E6E1;border-left:4px solid #8B6914;border-radius:0 10px 10px 0;padding:20px;margin:0 0 20px;">
          <p style="margin:0;font-size:15px;color:#4A5A4D;font-style:italic;line-height:1.6;">"${personal_message}"</p>
          <p style="margin:8px 0 0;font-size:13px;color:#9BA89D;">— ${inviterName}</p>
        </div>`
      : "";

    const htmlContent = buildBrandedEmail({
      preheader: `${inviterName} has invited you to join Make Friends and Socialize`,
      heading: "You're Invited",
      subheading: "Exclusive Membership",
      body: `
        ${p(`<strong style="color:#0D1F0F;">${inviterName}</strong> thinks you'd be a great fit for our exclusive community.`)}
        ${messageBlock}
        ${p(`Join a curated community of professionals who value meaningful connections, exclusive events, and personal growth.`)}
        ${infoBox(`
          <p style="margin:0;font-size:14px;color:#4A5A4D;">
            ✓ Access to exclusive events and gatherings<br/>
            ✓ Connect with like-minded professionals<br/>
            ✓ Intentional Connections matchmaking service<br/>
            ✓ Member-only perks and rewards
          </p>
        `)}
        <div style="background-color:#E8E6E1;border-radius:10px;padding:16px;text-align:center;margin:0 0 20px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8B6914;">Referral Benefit</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:600;color:#0D1F0F;">10% off your first month</p>
        </div>
        <p style="margin:20px 0 0;font-size:13px;color:#9BA89D;text-align:center;">Your referral code: <strong style="color:#0D1F0F;">${referralCode}</strong></p>
      `,
      ctaUrl: signupUrl,
      ctaText: "Accept Invitation",
      footerText: `This invitation was sent on behalf of ${inviterName}. If you didn't expect this email, you can safely ignore it.`,
    });

    await resend.emails.send({
      from: SENDERS.referrals,
      to: [recipient_email],
      subject: `${inviterName} has invited you to join Make Friends and Socialize`,
      html: htmlContent,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error in send-referral-invite:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);