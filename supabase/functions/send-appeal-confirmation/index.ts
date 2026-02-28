import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, p, infoBox } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface AppealConfirmationRequest {
  email: string;
  name: string;
  subject: string;
  appealType: string;
  referenceId?: string;
}

const appealTypeLabels: Record<string, string> = {
  membership: "Membership Application",
  suspension: "Account Suspension",
  match: "Match Decision",
  event: "Event Access",
};

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, name, subject, appealType, referenceId }: AppealConfirmationRequest = await req.json();
    const appealTypeLabel = appealTypeLabels[appealType] || appealType;

    const detailsHtml = `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;font-size:14px;color:#9BA89D;">Type:</td><td style="padding:8px 0;font-size:14px;font-weight:500;color:#0D1F0F;text-align:right;">${appealTypeLabel}</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;color:#9BA89D;">Subject:</td><td style="padding:8px 0;font-size:14px;font-weight:500;color:#0D1F0F;text-align:right;">${subject}</td></tr>
        ${referenceId ? `<tr><td style="padding:8px 0;font-size:14px;color:#9BA89D;">Reference:</td><td style="padding:8px 0;font-size:14px;font-weight:500;color:#0D1F0F;text-align:right;">${referenceId}</td></tr>` : ''}
        <tr><td style="padding:8px 0;font-size:14px;color:#9BA89D;">Status:</td><td style="padding:8px 0;text-align:right;"><span style="background-color:#FEF3CD;border:1px solid #8B691440;border-radius:4px;padding:4px 10px;color:#8B6914;font-size:12px;font-weight:600;">PENDING</span></td></tr>
      </table>
    `;

    const htmlContent = buildBrandedEmail({
      preheader: `Appeal Received: ${subject}`,
      heading: "Appeal Received",
      subheading: "We'll review your request",
      body: `
        ${p(`Dear ${name},`)}
        ${p(`Thank you for submitting your appeal. We have received your request and our team will review it carefully.`)}
        ${infoBox(detailsHtml)}
        <div style="background-color:#E8E6E1;border-left:4px solid #8B6914;border-radius:0 10px 10px 0;padding:16px 20px;margin:0 0 20px;">
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0D1F0F;">What happens next?</p>
          <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;color:#4A5A4D;">
            <li>Our team will review your appeal within 5-7 business days</li>
            <li>You'll receive an email when there's an update</li>
            <li>We may reach out if we need additional information</li>
          </ul>
        </div>
        ${p(`If you have any questions, please contact us at <a href="mailto:hello@makefriendsandsocialize.com" style="color:#8B6914;text-decoration:none;">hello@makefriendsandsocialize.com</a>`)}
      `,
      footerText: "Make Friends and Socialize · Making authentic connections happen.",
    });

    const emailResponse = await resend.emails.send({
      from: SENDERS.noreply,
      to: [email],
      subject: `Appeal Received: ${subject}`,
      html: htmlContent,
    });

    return new Response(JSON.stringify(emailResponse), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error sending appeal confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);