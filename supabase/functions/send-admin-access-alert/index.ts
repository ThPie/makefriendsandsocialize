import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, p, infoBox, detailRow } from '../_shared/email-layout.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface AdminAccessAlertRequest {
  suspiciousAdminId: string;
  suspiciousAdminName: string;
  accessCount: number;
  resourceType: string;
  detectedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { suspiciousAdminId, suspiciousAdminName, accessCount, resourceType, detectedAt }: AdminAccessAlertRequest = await req.json();

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const suspiciousAdmin = users?.find(u => u.id === suspiciousAdminId);
    const suspiciousAdminEmail = suspiciousAdmin?.email || 'Unknown';

    const { data: adminRoles } = await supabaseAdmin.from('user_roles').select('user_id').eq('role', 'admin').neq('user_id', suspiciousAdminId);
    const adminEmails = users?.filter(u => adminRoles?.some(r => r.user_id === u.id)).map(u => u.email).filter((e): e is string => !!e);

    if (!adminEmails || adminEmails.length === 0) return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const htmlContent = buildBrandedEmail({
      preheader: `Unusual admin access detected - ${suspiciousAdminName}`,
      heading: "⚠️ Unusual Access Detected",
      subheading: "Security Alert",
      headerBg: "#1a0a0a",
      body: `
        ${infoBox(`
          ${detailRow('👤', 'Admin User', `${suspiciousAdminName} (${suspiciousAdminEmail})`)}
          ${detailRow('📊', 'Access Count (Last Hour)', `${accessCount} accesses`)}
          ${detailRow('📁', 'Resource Type', resourceType)}
          ${detailRow('🕐', 'Detection Time', new Date(detectedAt).toLocaleString())}
        `)}
        <div style="background-color:#FEF3CD;border:1px solid #8B691440;border-radius:10px;padding:16px;margin:0 0 20px;">
          <p style="margin:0;font-size:14px;color:#856404;"><strong>Action Required:</strong> This admin has accessed application data an unusually high number of times. Please review their recent activity for potential data harvesting or unauthorized access patterns.</p>
        </div>
      `,
      footerText: "This is an automated security alert. Please do not reply to this email.",
    });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDERS.security, to: adminEmails, subject: `🚨 SECURITY: Unusual admin access - ${suspiciousAdminName}`, html: htmlContent }),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error sending admin access alert:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);