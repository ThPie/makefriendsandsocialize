import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, subject, appealType, referenceId }: AppealConfirmationRequest = await req.json();

    console.log("Sending appeal confirmation to:", email);

    const appealTypeLabel = appealTypeLabels[appealType] || appealType;

    const emailResponse = await resend.emails.send({
      from: "Make Friends & Socialize <onboarding@resend.dev>",
      to: [email],
      subject: `Appeal Received: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <tr>
              <td>
                <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Make Friends & Socialize</h1>
                    </td>
                  </tr>
                  
                  <!-- Icon -->
                  <tr>
                    <td style="padding: 32px 32px 0; text-align: center;">
                      <div style="display: inline-block; width: 64px; height: 64px; background-color: #22c55e15; border-radius: 50%; line-height: 64px;">
                        <span style="font-size: 32px;">✓</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 24px 32px;">
                      <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 20px; font-weight: 600; text-align: center;">Appeal Received</h2>
                      <p style="margin: 0 0 16px; color: #64748b; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
                      <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">
                        Thank you for submitting your appeal. We have received your request and our team will review it carefully.
                      </p>
                      
                      <!-- Appeal Details -->
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 12px; color: #1a1a2e; font-size: 14px; font-weight: 600; text-transform: uppercase;">Appeal Details</h3>
                        <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Type:</td>
                            <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px; font-weight: 500; text-align: right;">${appealTypeLabel}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Subject:</td>
                            <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px; font-weight: 500; text-align: right;">${subject}</td>
                          </tr>
                          ${referenceId ? `
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Reference ID:</td>
                            <td style="padding: 8px 0; color: #1a1a2e; font-size: 14px; font-weight: 500; text-align: right;">${referenceId}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Status:</td>
                            <td style="padding: 8px 0; text-align: right;">
                              <span style="display: inline-block; background-color: #f59e0b15; border: 1px solid #f59e0b40; border-radius: 4px; padding: 4px 8px; color: #f59e0b; font-size: 12px; font-weight: 600;">PENDING</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Timeline -->
                      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin-bottom: 24px;">
                        <h4 style="margin: 0 0 8px; color: #1a1a2e; font-size: 14px; font-weight: 600;">What happens next?</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                          <li>Our team will review your appeal within 5-7 business days</li>
                          <li>You'll receive an email when there's an update</li>
                          <li>We may reach out if we need additional information</li>
                        </ul>
                      </div>
                      
                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        If you have any questions, please contact us at 
                        <a href="mailto:hello@makefriendsandsocialize.com" style="color: #c9a227; text-decoration: none;">hello@makefriendsandsocialize.com</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                        &copy; ${new Date().getFullYear()} Make Friends & Socialize. All rights reserved.
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

    console.log("Appeal confirmation email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending appeal confirmation:", error);
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
