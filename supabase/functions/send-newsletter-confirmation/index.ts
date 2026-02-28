import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const buildEmailHtml = (email: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#F2F1EE;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;background-color:#0D1F0F;">
              <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:600;color:#B8892A;letter-spacing:0.02em;">
                MakeFriends Social Club
              </h1>
              <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#9BA89D;">
                Welcome to the Community
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:600;color:#0D1F0F;">
                You&rsquo;re In.
              </h2>
              <p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#4A5A4D;">
                Thank you for subscribing to our newsletter. You&rsquo;ll receive curated updates on upcoming events, community stories, and exclusive invitations.
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:24px;color:#4A5A4D;">
                We keep things intentional — no spam, only what matters.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#8B6914;border-radius:8px;">
                    <a href="https://makefriendsandsocializecom.lovable.app/events" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.04em;text-transform:uppercase;">
                      Explore Upcoming Events
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #E3E0D8;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9BA89D;line-height:20px;">
                You&rsquo;re receiving this because ${email} subscribed to our newsletter.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#9BA89D;">
                &copy; ${new Date().getFullYear()} Make Friends and Socialize LLC
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildEmailHtml(email);

    const { error } = await resend.emails.send({
      from: "MakeFriends <hello@makefriendsandsocialize.com>",
      to: [email],
      subject: "Welcome to the MakeFriends Newsletter ✨",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Newsletter email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
