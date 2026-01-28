import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PasswordChangedRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId }: PasswordChangedRequest = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log(`Sending password changed confirmation for user: ${userId}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user email and profile
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (!user?.email) {
      throw new Error("User email not found");
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name')
      .eq('id', userId)
      .single();

    const firstName = profile?.first_name || 'Member';
    const changedAt = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1a1a1a; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
          }
          .header { 
            background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .icon-circle {
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          .content { 
            padding: 40px 30px; 
          }
          .success-badge {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 24px;
          }
          .info-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #64748b;
            font-size: 14px;
          }
          .info-value {
            font-weight: 500;
            font-size: 14px;
          }
          .warning-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          .warning-box p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
          }
          .cta-button { 
            display: inline-block; 
            background: #c4a052; 
            color: #1a1a1a; 
            padding: 14px 28px; 
            border-radius: 8px; 
            text-decoration: none; 
            font-weight: 600;
            margin-top: 16px;
          }
          .footer {
            background: #f8fafc;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
          }
          .footer a {
            color: #c4a052;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1>Password Changed Successfully</h1>
          </div>
          
          <div class="content">
            <p>Hi ${firstName},</p>
            
            <div class="success-badge">✓ Password Updated</div>
            
            <p>Your password has been successfully changed. You can now use your new password to sign in to your account.</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Account</span>
                <span class="info-value">${user.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Changed On</span>
                <span class="info-value">${changedAt}</span>
              </div>
            </div>
            
            <div class="warning-box">
              <p><strong>⚠️ Didn't make this change?</strong></p>
              <p style="margin-top: 8px;">If you didn't change your password, your account may have been compromised. Please contact our support team immediately or reset your password again.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="https://makefriendsandsocialize.com/portal" class="cta-button">
                Go to Your Portal
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated security notification from MakeFriends & Socialize.</p>
            <p style="margin-top: 8px;">
              <a href="https://makefriendsandsocialize.com">Visit our website</a> · 
              <a href="mailto:support@makefriendsandsocialize.com">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "MakeFriends & Socialize <onboarding@resend.dev>",
        to: [user.email],
        subject: "Your password has been changed",
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Error sending email:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Password changed confirmation email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending password changed email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
