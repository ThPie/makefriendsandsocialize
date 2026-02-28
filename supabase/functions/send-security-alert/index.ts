import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox, detailRow } from '../_shared/email-layout.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface SecurityAlertRequest {
  reportId: string;
  userId: string;
  severity: string;
  redFlags: string[];
  aiRecommendation: string;
  riskAssessment: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { reportId, userId, severity = 'medium', redFlags = [], aiRecommendation = '', riskAssessment = '' }: SecurityAlertRequest = body;

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });

    const { data: profile } = await supabaseAdmin.from('profiles').select('first_name, last_name').eq('id', userId).single();
    const memberName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Member' : 'Unknown Member';

    const { data: adminRoles } = await supabaseAdmin.from('user_roles').select('user_id').eq('role', 'admin');
    if (!adminRoles || adminRoles.length === 0) return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: { users: adminUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const adminEmails = adminUsers?.filter(u => adminRoles.some(r => r.user_id === u.id)).map(u => u.email).filter((e): e is string => !!e);
    if (!adminEmails || adminEmails.length === 0) return new Response(JSON.stringify({ success: true, message: 'No admin emails found' }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const severityColors: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308' };
    const severityColor = severityColors[severity] || '#eab308';

    const redFlagsList = redFlags.length > 0
      ? redFlags.map(flag => `<li style="margin:0 0 8px;font-size:14px;color:#ef4444;">⚠️ ${flag}</li>`).join('')
      : '<li style="margin:0;font-size:14px;color:#22c55e;">No red flags detected</li>';

    const htmlContent = buildBrandedEmail({
      preheader: `Security Alert: ${severity.toUpperCase()} - ${memberName}`,
      heading: "🚨 Security Alert",
      subheading: "A security scan has flagged potential concerns",
      headerBg: "#1a0a0a",
      body: `
        ${infoBox(`
          ${detailRow('👤', 'Member', memberName)}
          <p style="margin:8px 0 0;font-size:14px;color:#4A5A4D;">
            <strong style="color:#0D1F0F;">Severity:</strong> 
            <span style="background-color:${severityColor};color:#ffffff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">${severity.toUpperCase()}</span>
          </p>
        `)}
        <div style="margin:0 0 20px;">
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#0D1F0F;">Red Flags Detected</p>
          <ul style="margin:0;padding-left:20px;">${redFlagsList}</ul>
        </div>
        ${infoBox(`
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8B6914;">AI Recommendation</p>
          <p style="margin:0;font-size:14px;font-weight:500;color:#0D1F0F;">${aiRecommendation || 'Review manually'}</p>
        `)}
        ${infoBox(`
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8B6914;">Risk Assessment</p>
          <p style="margin:0;font-size:14px;color:#4A5A4D;">${riskAssessment || 'No assessment available'}</p>
        `)}
      `,
      ctaUrl: `${SITE_URL}/admin/security`,
      ctaText: "View Security Report",
      ctaColor: severityColor,
    });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDERS.security, to: adminEmails, subject: `🚨 [${severity.toUpperCase()}] Security Alert: ${memberName}`, html: htmlContent }),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error sending security alert:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);