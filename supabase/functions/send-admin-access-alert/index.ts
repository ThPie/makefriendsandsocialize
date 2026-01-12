import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminAccessAlertRequest {
  suspiciousAdminId: string;
  suspiciousAdminName: string;
  accessCount: number;
  resourceType: string;
  detectedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      suspiciousAdminId, 
      suspiciousAdminName, 
      accessCount, 
      resourceType, 
      detectedAt 
    }: AdminAccessAlertRequest = await req.json();

    console.log("Processing admin access alert:", { suspiciousAdminId, accessCount, resourceType });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get suspicious admin's email
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const suspiciousAdmin = users?.find(u => u.id === suspiciousAdminId);
    const suspiciousAdminEmail = suspiciousAdmin?.email || 'Unknown';

    // Get all other admin emails to notify
    const { data: adminRoles } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .neq('user_id', suspiciousAdminId);

    const adminEmails = users
      ?.filter(u => adminRoles?.some(r => r.user_id === u.id))
      .map(u => u.email)
      .filter((email): email is string => !!email);

    if (!adminEmails || adminEmails.length === 0) {
      console.log("No admins to notify");
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Sending alert to admins:", adminEmails);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .alert-header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
          .alert-header h1 { margin: 0; font-size: 20px; }
          .alert-header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
          .content { background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
          .stat { background: #fef2f2; padding: 16px; border-radius: 8px; margin: 12px 0; border-left: 4px solid #dc2626; }
          .stat strong { color: #7f1d1d; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .stat span { color: #1f2937; font-size: 16px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 20px; }
          .warning p { margin: 0; color: #92400e; font-size: 14px; line-height: 1.5; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-header">
            <h1>⚠️ Unusual Admin Access Detected</h1>
            <p>Security alert from your application</p>
          </div>
          <div class="content">
            <div class="stat">
              <strong>Admin User</strong>
              <span>${suspiciousAdminName} (${suspiciousAdminEmail})</span>
            </div>
            <div class="stat">
              <strong>Access Count (Last Hour)</strong>
              <span>${accessCount} accesses</span>
            </div>
            <div class="stat">
              <strong>Resource Type</strong>
              <span>${resourceType}</span>
            </div>
            <div class="stat">
              <strong>Detection Time</strong>
              <span>${new Date(detectedAt).toLocaleString()}</span>
            </div>
            <div class="warning">
              <p><strong>Action Required:</strong> This admin has accessed application data an unusually high number of times within the last hour. Please review their recent activity for potential data harvesting or unauthorized access patterns.</p>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated security alert. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Security Alerts <onboarding@resend.dev>",
        to: adminEmails,
        subject: `🚨 SECURITY: Unusual admin access pattern detected - ${suspiciousAdminName}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending admin access alert:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
