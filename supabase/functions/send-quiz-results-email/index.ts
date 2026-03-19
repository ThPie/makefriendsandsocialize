import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { buildBrandedEmail, SENDERS, SITE_URL, p } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const styleEmojis: Record<string, string> = {
  secure: '🌿',
  anxious: '🌊',
  avoidant: '🏔️',
  disorganized: '🌀',
};

const styleColors: Record<string, string> = {
  secure: '#8B6914',
  anxious: '#4A90C4',
  avoidant: '#4A9A6A',
  disorganized: '#8A5AB5',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, winningStyle, scores, profileTitle, profileSubtitle, profileDescription, traits, growthEdge } = body;

    if (!email || !winningStyle || !scores) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emoji = styleEmojis[winningStyle] || '✨';
    const color = styleColors[winningStyle] || '#8B6914';

    // Build score bars HTML
    const scoreBarHtml = ['secure', 'anxious', 'avoidant', 'disorganized']
      .map((style) => {
        const score = scores[style] || 0;
        const isWinner = style === winningStyle;
        const labels: Record<string, string> = {
          secure: 'Securely Attached',
          anxious: 'Anxiously Attached',
          avoidant: 'Avoidantly Attached',
          disorganized: 'Disorganized',
        };
        return `
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #333333;">${labels[style]}</td>
            <td style="padding: 6px 0; text-align: right; font-size: 13px; color: #666666;">${score}%</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 0 0 8px 0;">
              <div style="background: #EEEEEE; border-radius: 4px; height: 8px; overflow: hidden;">
                <div style="background: ${isWinner ? '#8B6914' : '#CCCCCC'}; height: 100%; width: ${score}%; border-radius: 4px;"></div>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    // Build traits list
    const traitsHtml = (traits || [])
      .map((t: string) => `<li style="margin-bottom: 6px; font-size: 13px; color: #333333;">${t}</li>`)
      .join('');

    const bodyHtml = `
      <div style="text-align: center; padding: 20px 0 10px;">
        <span style="font-size: 48px;">${emoji}</span>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-family: Georgia, serif; font-size: 28px; color: #333333; margin: 0;">${profileTitle}</h2>
        <p style="font-family: Georgia, serif; font-style: italic; color: ${color}; font-size: 16px; margin: 8px 0 0;">"${profileSubtitle}"</p>
      </div>

      ${p(profileDescription || '')}

      <div style="margin: 24px 0;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8B6914; margin-bottom: 12px;">Your Traits</p>
        <ul style="padding-left: 18px; margin: 0;">
          ${traitsHtml}
        </ul>
      </div>

      <div style="background: #F9F8F5; border-left: 3px solid #8B6914; padding: 16px 20px; border-radius: 4px; margin: 24px 0;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8B6914; margin: 0 0 8px;">Growth Edge</p>
        <p style="font-style: italic; font-size: 13px; color: #555555; margin: 0; line-height: 1.6;">${growthEdge || ''}</p>
      </div>

      <div style="margin: 24px 0;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8B6914; margin-bottom: 12px;">Your Full Breakdown</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${scoreBarHtml}
        </table>
      </div>
    `;

    const html = buildBrandedEmail({
      preheader: `Your attachment style: ${profileTitle} — "${profileSubtitle}"`,
      heading: "Your Soul Maps Results",
      subheading: "Attachment Style Quiz",
      body: bodyHtml,
      ctaUrl: `${SITE_URL}/soul-maps`,
      ctaText: "Explore More Quizzes",
      footerText: `You're receiving this because you took the Attachment Style quiz on Soul Maps.`,
    });

    const { error } = await resend.emails.send({
      from: SENDERS.hello,
      to: [email],
      subject: `${emoji} Your Attachment Style: ${profileTitle}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Quiz results email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
