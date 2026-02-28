import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox } from '../_shared/email-layout.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface PasswordChangedRequest { userId: string; }

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId }: PasswordChangedRequest = await req.json();
    if (!userId) throw new Error("User ID is required");

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });

    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user?.email) throw new Error("User email not found");

    const { data: profile } = await supabaseAdmin.from('profiles').select('first_name').eq('id', userId).single();
    const firstName = profile?.first_name || 'Member';
    const changedAt = new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    const htmlContent = buildBrandedEmail({
      preheader: "Your password has been changed",
      heading: "Password Changed",
      subheading: "Security Notification",
      body: `
        ${p(`Hi ${firstName},`)}
        <div style="background-color:#dcfce7;border-radius:10px;padding:10px 16px;margin:0 0 20px;text-align:center;">
          <span style="font-size:14px;font-weight:500;color:#166534;">✓ Password Updated Successfully</span>
        </div>
        ${p(`Your password has been successfully changed. You can now use your new password to sign in to your account.`)}
        ${infoBox(`
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;font-size:14px;color:#9BA89D;border-bottom:1px solid #E3E0D8;">Account</td><td style="padding:8px 0;font-size:14px;font-weight:500;color:#0D1F0F;text-align:right;border-bottom:1px solid #E3E0D8;">${user.email}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#9BA89D;">Changed On</td><td style="padding:8px 0;font-size:14px;font-weight:500;color:#0D1F0F;text-align:right;">${changedAt}</td></tr>
          </table>
        `)}
        <div style="background-color:#FEF3CD;border:1px solid #8B691440;border-radius:10px;padding:16px;margin:0 0 20px;">
          <p style="margin:0;font-size:14px;color:#856404;"><strong>⚠️ Didn't make this change?</strong></p>
          <p style="margin:8px 0 0;font-size:14px;color:#856404;">If you didn't change your password, your account may have been compromised. Please contact our support team immediately.</p>
        </div>
      `,
      ctaUrl: `${SITE_URL}/portal`,
      ctaText: "Go to Your Portal",
      footerText: "This is an automated security notification from Make Friends and Socialize.",
    });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDERS.security, to: [user.email], subject: "Your password has been changed", html: htmlContent }),
    });

    const emailData = await emailResponse.json();
    if (!emailResponse.ok) throw new Error(emailData.message || "Failed to send email");

    return new Response(JSON.stringify({ success: true, emailData }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error sending password changed email:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);