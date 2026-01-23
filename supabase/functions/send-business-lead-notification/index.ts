const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - skipping email notification");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "Email not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: NotificationRequest = await req.json();
    console.log("Sending lead notification:", { 
      businessName: body.businessName,
      contactName: body.contactName 
    });

    if (!body.businessEmail) {
      console.log("No business email - skipping notification");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "No business email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const portalUrl = `${Deno.env.get("SITE_URL") || "https://makefriendsandsocializecom.lovable.app"}/portal/business`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">📩</span>
        </div>
        <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 8px;">New Lead Received!</h1>
        <p style="color: #6b7280; margin: 0;">Someone is interested in ${body.businessName}</p>
      </div>

      <!-- Lead Details -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #374151; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.05em;">Contact Details</h2>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Name:</strong>
          <span style="color: #1f2937; margin-left: 8px;">${body.contactName}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Email:</strong>
          <a href="mailto:${body.contactEmail}" style="color: #3b82f6; margin-left: 8px; text-decoration: none;">${body.contactEmail}</a>
        </div>
        
        ${body.message ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <strong style="color: #374151; display: block; margin-bottom: 8px;">Message:</strong>
          <p style="color: #4b5563; margin: 0; white-space: pre-wrap;">${body.message}</p>
        </div>
        ` : ''}
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          View in Portal →
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          Respond quickly to increase your chances of conversion!
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "MakeFriends <noreply@updates.makefriends.com>",
        to: body.businessEmail,
        subject: `📩 New Lead: ${body.contactName} wants to connect`,
        html: emailHtml
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ success: false, error: result }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", result);
    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-business-lead-notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
