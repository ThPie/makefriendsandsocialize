import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox, detailRow } from '../_shared/email-layout.ts';

interface NotificationRequest {
  leadId: string;
  businessId: string;
  businessName: string;
  businessEmail: string;
  contactName: string;
  contactEmail: string;
  message?: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) return new Response(JSON.stringify({ success: true, skipped: true, reason: "Email not configured" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body: NotificationRequest = await req.json();
    if (!body.businessEmail) return new Response(JSON.stringify({ success: true, skipped: true, reason: "No business email" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const htmlContent = buildBrandedEmail({
      preheader: `New lead: ${body.contactName} wants to connect with ${body.businessName}`,
      heading: "New Lead Received!",
      subheading: `Someone is interested in ${body.businessName}`,
      body: `
        ${infoBox(`
          <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8B6914;">Contact Details</p>
          ${detailRow('👤', 'Name', body.contactName)}
          <p style="margin:0 0 8px;font-size:14px;color:#4A5A4D;">📧 <strong style="color:#0D1F0F;">Email:</strong> <a href="mailto:${body.contactEmail}" style="color:#8B6914;text-decoration:none;">${body.contactEmail}</a></p>
          ${body.message ? `
            <div style="margin:12px 0 0;padding:12px 0 0;border-top:1px solid #E3E0D8;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0D1F0F;">Message:</p>
              <p style="margin:0;font-size:14px;color:#4A5A4D;white-space:pre-wrap;">${body.message}</p>
            </div>
          ` : ''}
        `)}
        ${p(`Respond quickly to increase your chances of conversion!`)}
      `,
      ctaUrl: `${SITE_URL}/portal/business`,
      ctaText: "View in Portal",
      footerText: "The Founders Circle · Where visionary founders connect.",
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: SENDERS.business, to: body.businessEmail, subject: `📩 New Lead: ${body.contactName} wants to connect`, html: htmlContent }),
    });

    const result = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ success: false, error: result }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    return new Response(JSON.stringify({ success: true, emailId: result.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error in send-business-lead-notification:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});