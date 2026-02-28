import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox } from '../_shared/email-layout.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface BusinessNotificationRequest {
  email: string;
  businessName: string;
  status: 'approved' | 'rejected' | 'featured';
  firstName?: string;
}

const getStatusDetails = (status: string, businessName: string) => {
  switch (status) {
    case 'approved': return { subject: `Your company "${businessName}" has been approved!`, heading: "Company Approved", message: `Your company listing for <strong style="color:#0D1F0F;">${businessName}</strong> has been approved and is now visible in The Founders Circle directory.`, ctaText: "View Your Listing" };
    case 'featured': return { subject: `Your company "${businessName}" is now featured!`, heading: "You've Been Featured!", message: `Your company <strong style="color:#0D1F0F;">${businessName}</strong> has been selected as a featured listing in The Founders Circle.`, ctaText: "See Your Featured Listing" };
    case 'rejected': return { subject: `Update on your company listing "${businessName}"`, heading: "Listing Update", message: `We've reviewed your listing for <strong style="color:#0D1F0F;">${businessName}</strong>. Unfortunately, we couldn't approve it at this time. Please review and resubmit.`, ctaText: "Update Your Listing" };
    default: return { subject: `Update on your company listing`, heading: "Listing Update", message: `There's an update to your company listing.`, ctaText: "View Details" };
  }
};

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, businessName, status, firstName }: BusinessNotificationRequest = await req.json();
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const details = getStatusDetails(status, businessName);
    const greeting = firstName ? `Hi ${firstName},` : "Hello,";

    const htmlContent = buildBrandedEmail({
      preheader: details.subject,
      heading: details.heading,
      subheading: "The Founders Circle",
      body: `
        ${p(greeting)}
        ${p(details.message)}
        ${status !== 'rejected'
          ? p(`Members can now discover your business and reach out for introductions. Make sure your profile is complete to maximize your visibility!`)
          : p(`If you have questions about why your listing wasn't approved, please reach out to our support team.`)
        }
      `,
      ctaUrl: `${SITE_URL}/portal/business`,
      ctaText: details.ctaText,
      footerText: "The Founders Circle · Where visionary founders connect.",
    });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: SENDERS.business, to: [email], subject: details.subject, html: htmlContent }),
    });

    const data = await emailResponse.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error in send-business-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);