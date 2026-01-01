import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  reportId: string;
  userId: string;
  severity: string;
  redFlags: string[];
  aiRecommendation: string;
  riskAssessment: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId, userId, severity, redFlags, aiRecommendation, riskAssessment }: SecurityAlertRequest = await req.json();

    console.log(`Sending security alert for report ${reportId}, severity: ${severity}`);

    // Get admin email - using service role to access admin emails
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user details
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    const memberName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Member' : 'Unknown Member';

    // Get admin emails
    const { data: adminRoles } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (!adminRoles || adminRoles.length === 0) {
      console.log('No admins found to notify');
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin emails from auth.users
    const { data: { users: adminUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const adminEmails = adminUsers
      ?.filter(u => adminRoles.some(r => r.user_id === u.id))
      .map(u => u.email)
      .filter((email): email is string => !!email);

    if (!adminEmails || adminEmails.length === 0) {
      console.log('No admin emails found');
      return new Response(JSON.stringify({ success: true, message: 'No admin emails found' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const severityColor = severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f97316' : '#eab308';
    const severityLabel = severity.toUpperCase();

    const redFlagsList = redFlags.length > 0 
      ? redFlags.map(flag => `<li style="color: #ef4444;">⚠️ ${flag}</li>`).join('')
      : '<li style="color: #22c55e;">No red flags detected</li>';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
          .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
          .section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
          .section-title { font-weight: 600; color: #374151; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .cta-button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; }
          ul { margin: 0; padding-left: 20px; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0 0 10px 0;">🚨 Security Alert</h1>
            <p style="margin: 0; opacity: 0.9;">A security scan has flagged potential concerns</p>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">Member Details</div>
              <p style="margin: 0;"><strong>Name:</strong> ${memberName}</p>
              <p style="margin: 8px 0 0 0;">
                <strong>Severity:</strong> 
                <span class="severity-badge" style="background: ${severityColor}; color: white;">${severityLabel}</span>
              </p>
            </div>
            
            <div class="section">
              <div class="section-title">Red Flags Detected</div>
              <ul>${redFlagsList}</ul>
            </div>
            
            <div class="section">
              <div class="section-title">AI Recommendation</div>
              <p style="margin: 0; font-weight: 500;">${aiRecommendation || 'Review manually'}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Risk Assessment</div>
              <p style="margin: 0;">${riskAssessment || 'No assessment available'}</p>
            </div>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://preview--make-friends-socialize.lovable.app/admin/security" class="cta-button">
                View Security Report
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to all admins using fetch
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Security Alerts <onboarding@resend.dev>",
        to: adminEmails,
        subject: `🚨 [${severityLabel}] Security Alert: ${memberName}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Security alert email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending security alert:", error);
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
