import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppealNotificationRequest {
  email: string;
  name: string;
  subject: string;
  appealType: string;
  status: string;
  adminResponse?: string;
}

const statusMessages: Record<string, { title: string; message: string; color: string }> = {
  approved: {
    title: "Your Appeal Has Been Approved",
    message: "We're pleased to inform you that your appeal has been reviewed and approved.",
    color: "#22c55e",
  },
  denied: {
    title: "Appeal Decision",
    message: "After careful review, we were unable to approve your appeal at this time.",
    color: "#ef4444",
  },
  under_review: {
    title: "Your Appeal Is Under Review",
    message: "We wanted to let you know that your appeal is currently being reviewed by our team.",
    color: "#3b82f6",
  },
  pending: {
    title: "Appeal Status Update",
    message: "Your appeal status has been updated.",
    color: "#f59e0b",
  },
};

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
    const { email, name, subject, appealType, status, adminResponse }: AppealNotificationRequest = await req.json();

    const statusInfo = statusMessages[status] || statusMessages.pending;
    const appealTypeLabel = appealTypeLabels[appealType] || appealType;

    const emailResponse = await resend.emails.send({
      from: "Make Friends & Socialize <onboarding@resend.dev>",
      to: [email],
      subject: `${statusInfo.title} - ${subject}`,
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
                  
                  <!-- Status Badge -->
                  <tr>
                    <td style="padding: 32px 32px 0;">
                      <div style="display: inline-block; background-color: ${statusInfo.color}15; border: 1px solid ${statusInfo.color}40; border-radius: 8px; padding: 8px 16px;">
                        <span style="color: ${statusInfo.color}; font-size: 14px; font-weight: 600; text-transform: uppercase;">${status.replace("_", " ")}</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 24px 32px;">
                      <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 20px; font-weight: 600;">${statusInfo.title}</h2>
                      <p style="margin: 0 0 16px; color: #64748b; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
                      <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">${statusInfo.message}</p>
                      
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
                        </table>
                      </div>
                      
                      ${adminResponse ? `
                      <!-- Admin Response -->
                      <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px 20px; margin-bottom: 24px;">
                        <h4 style="margin: 0 0 8px; color: #1a1a2e; font-size: 14px; font-weight: 600;">Message from our team:</h4>
                        <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">${adminResponse}</p>
                      </div>
                      ` : ''}
                      
                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        If you have any questions, please don't hesitate to contact us at 
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

    console.log("Appeal notification email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending appeal notification:", error);
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
