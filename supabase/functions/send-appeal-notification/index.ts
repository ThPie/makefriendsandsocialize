import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, p, infoBox } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface AppealNotificationRequest {
  email: string;
  name: string;
  subject: string;
  appealType: string;
  status: string;
  adminResponse?: string;
}

const statusMessages: Record<string, { title: string; message: string }> = {
  approved: { title: "Your Appeal Has Been Approved", message: "We're pleased to inform you that your appeal has been reviewed and approved." },
  denied: { title: "Appeal Decision", message: "After careful review, we were unable to approve your appeal at this time." },
  under_review: { title: "Your Appeal Is Under Review", message: "We wanted to let you know that your appeal is currently being reviewed by our team." },
  pending: { title: "Appeal Status Update", message: "Your appeal status has been updated." },
};

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
    const { email, name, subject, appealType, status, adminResponse }: AppealNotificationRequest = await req.json();
    const statusInfo = statusMessages[status] || statusMessages.pending;
    const appealTypeLabel = appealTypeLabels[appealType] || appealType;

    const statusColors: Record<string, string> = { approved: "#22c55e", denied: "#ef4444", under_review: "#8B6914", pending: "#f59e0b" };
    const statusColor = statusColors[status] || "#8B6914";

    const htmlContent = buildBrandedEmail({
      preheader: `${statusInfo.title} - ${subject}`,
      heading: statusInfo.title,
      body: `
        <div style="margin:0 0 20px;"><span style="background-color:${statusColor}20;border:1px solid ${statusColor}40;border-radius:8px;padding:6px 14px;color:${statusColor};font-size:13px;font-weight:600;text-transform:uppercase;">${status.replace("_", " ")}</span></div>
        ${p(`Dear ${name},`)}
        ${p(statusInfo.message)}
        ${infoBox(`
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;font-size:14px;color:#9BA89D;">Type:</td><td style="padding:8px 0;font-size:14px;font-weight:500;color:#0D1F0F;text-align:right;">${appealTypeLabel}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#9BA89D;">Subject:</td><td style="padding:8px 0;font-size:14px;font-weight:500;color:#0D1F0F;text-align:right;">${subject}</td></tr>
          </table>
        `)}
        ${adminResponse ? `
          <div style="background-color:#FEF3CD;border-left:4px solid #8B6914;border-radius:0 10px 10px 0;padding:16px 20px;margin:0 0 20px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0D1F0F;">Message from our team:</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#4A5A4D;">${adminResponse}</p>
          </div>
        ` : ''}
        ${p(`If you have any questions, please contact us at <a href="mailto:hello@makefriendsandsocialize.com" style="color:#8B6914;text-decoration:none;">hello@makefriendsandsocialize.com</a>`)}
      `,
      footerText: "Make Friends and Socialize · Making authentic connections happen.",
    });

    const emailResponse = await resend.emails.send({
      from: SENDERS.noreply,
      to: [email],
      subject: `${statusInfo.title} - ${subject}`,
      html: htmlContent,
    });

    return new Response(JSON.stringify(emailResponse), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error sending appeal notification:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);