import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



interface BusinessNotificationRequest {
  email: string;
  businessName: string;
  status: 'approved' | 'rejected' | 'featured';
  firstName?: string;
}

const getStatusDetails = (status: string, businessName: string) => {
  switch (status) {
    case 'approved':
      return {
        subject: `Your company "${businessName}" has been approved!`,
        heading: "Congratulations! Your Company is Now Live",
        message: `Great news! Your company listing for <strong>${businessName}</strong> has been approved and is now visible in The Founders Circle directory.`,
        ctaText: "View Your Listing",
        color: "#22c55e",
      };
    case 'featured':
      return {
        subject: `Your company "${businessName}" is now featured!`,
        heading: "You've Been Featured!",
        message: `Exciting news! Your company <strong>${businessName}</strong> has been selected as a featured listing in The Founders Circle. This means increased visibility and prominence in our directory.`,
        ctaText: "See Your Featured Listing",
        color: "#f97316",
      };
    case 'rejected':
      return {
        subject: `Update on your company listing "${businessName}"`,
        heading: "Company Listing Update",
        message: `We've reviewed your company listing for <strong>${businessName}</strong>. Unfortunately, we couldn't approve it at this time. This may be due to incomplete information or not meeting our community guidelines. Please review your listing and resubmit.`,
        ctaText: "Update Your Listing",
        color: "#ef4444",
      };
    default:
      return {
        subject: `Update on your company listing`,
        heading: "Company Listing Update",
        message: `There's an update to your company listing.`,
        ctaText: "View Details",
        color: "#6b7280",
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  console.log("Business notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, businessName, status, firstName }: BusinessNotificationRequest = await req.json();

    console.log(`Sending ${status} notification for business "${businessName}" to ${email}`);

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const details = getStatusDetails(status, businessName);
    const greeting = firstName ? `Hi ${firstName},` : "Hello,";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The Founders Circle <onboarding@resend.dev>",
        to: [email],
        subject: details.subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 16px; padding: 40px; border: 1px solid #262626;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="width: 64px; height: 64px; background-color: ${details.color}20; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <span style="font-size: 32px;">${status === 'approved' ? '✓' : status === 'featured' ? '★' : '!'}</span>
                  </div>
                  <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0;">${details.heading}</h1>
                </div>
                
                <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                  ${greeting}
                </p>
                
                <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                  ${details.message}
                </p>

                ${status !== 'rejected' ? `
                  <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                    Members can now discover your business and reach out for introductions. Make sure your profile is complete to maximize your visibility!
                  </p>
                ` : `
                  <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                    If you have questions about why your listing wasn't approved, please reach out to our support team.
                  </p>
                `}

                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="https://makefriends.app/portal/business" 
                     style="display: inline-block; background-color: ${details.color}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    ${details.ctaText}
                  </a>
                </div>

                <div style="border-top: 1px solid #262626; padding-top: 24px; text-align: center;">
                  <p style="color: #71717a; font-size: 14px; margin: 0;">
                    The Founders Circle<br>
                    <span style="color: #52525b;">Where visionary founders connect</span>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const data = await emailResponse.json();

    console.log("Business notification sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-business-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
