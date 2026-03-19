import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { buildBrandedEmail, SENDERS, SITE_URL, p, h2 } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

const styleSuggestions: Record<string, { title: string; description: string; url: string }[]> = {
  secure: [
    { title: 'Slow Dating', description: 'Your secure foundation makes you an ideal partner. Explore intentional dating.', url: '/slow-dating' },
    { title: 'The Ladies Society / The Gentlemen', description: 'Build deeper connections in a curated circle.', url: '/circles' },
    { title: 'Understanding Your Partner', description: 'Learn how other attachment styles experience love.', url: '/soul-maps' },
  ],
  anxious: [
    { title: 'Couples Circle', description: 'Strengthen your relationship skills in a supportive group.', url: '/circles/couples-circle' },
    { title: 'Slow Dating', description: 'Intentional connections that give you the reassurance you need.', url: '/slow-dating' },
    { title: 'Explore More Quizzes', description: 'Discover your love language, conflict style, and more.', url: '/soul-maps' },
  ],
  avoidant: [
    { title: 'Active & Outdoor Circle', description: 'Connect through shared activities instead of pressure.', url: '/circles/active-outdoor' },
    { title: 'The Exchange', description: 'Build connections through skills and workshops.', url: '/circles/the-exchange' },
    { title: 'Slow Dating', description: 'A low-pressure approach to meeting someone meaningful.', url: '/slow-dating' },
  ],
  disorganized: [
    { title: 'Explore Soul Maps', description: 'Take more quizzes to understand your patterns better.', url: '/soul-maps' },
    { title: 'Les Amis', description: 'A welcoming space to practise connection at your own pace.', url: '/circles/les-amis' },
    { title: 'Community Events', description: 'Meet people in structured, safe social settings.', url: '/events' },
  ],
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
    const suggestions = styleSuggestions[winningStyle] || styleSuggestions.secure;

    // Score bars
    const scoreBarHtml = ['secure', 'anxious', 'avoidant', 'disorganized']
      .map((style) => {
        const score = scores[style] || 0;
        const isWinner = style === winningStyle;
        const labels: Record<string, string> = {
          secure: 'Secure',
          anxious: 'Anxious',
          avoidant: 'Avoidant',
          disorganized: 'Disorganized',
        };
        return `
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#4A5A4D;font-weight:${isWinner ? '600' : '400'};">${labels[style]}</td>
            <td style="padding:4px 0;text-align:right;font-size:13px;color:${isWinner ? color : '#999999'};font-weight:600;">${score}%</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:0 0 10px;">
              <div style="background:#E8E6E1;border-radius:6px;height:10px;overflow:hidden;">
                <div style="background:${isWinner ? color : '#CCCCCC'};height:100%;width:${score}%;border-radius:6px;transition:width 0.3s;"></div>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    // Traits
    const traitsHtml = (traits || [])
      .map((t: string) => `<li style="margin-bottom:8px;font-size:14px;color:#4A5A4D;line-height:1.5;">${t}</li>`)
      .join('');

    // Suggestions cards
    const suggestionsHtml = suggestions
      .map((s) => `
        <a href="${SITE_URL}${s.url}" style="display:block;text-decoration:none;padding:16px 20px;background:#FFFFFF;border:1px solid #E8E6E1;border-radius:12px;margin-bottom:10px;">
          <p style="margin:0 0 4px;font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;font-weight:600;color:#0D1F0F;">${s.title} →</p>
          <p style="margin:0;font-size:13px;color:#6B7B6E;line-height:1.4;">${s.description}</p>
        </a>
      `)
      .join('');

    const bodyHtml = `
      <!-- Result Header -->
      <div style="text-align:center;padding:8px 0 16px;">
        <span style="font-size:52px;line-height:1;">${emoji}</span>
      </div>
      
      <div style="text-align:center;margin-bottom:24px;">
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#999999;margin:0 0 8px;">Your Attachment Style</p>
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;color:#0D1F0F;margin:0;font-weight:600;">${profileTitle}</h1>
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;color:${color};font-size:17px;margin:10px 0 0;">"${profileSubtitle}"</p>
      </div>

      <div style="background:#FFFFFF;border:1px solid #E8E6E1;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="font-size:14px;color:#4A5A4D;line-height:1.7;margin:0;">${profileDescription || ''}</p>
      </div>

      <!-- Traits -->
      <div style="margin-bottom:24px;">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:${color};margin:0 0 14px;font-weight:600;">Key Traits</p>
        <ul style="padding-left:18px;margin:0;">
          ${traitsHtml}
        </ul>
      </div>

      <!-- Growth Edge -->
      <div style="background:#FFFFFF;border-left:4px solid ${color};padding:20px 24px;border-radius:0 12px 12px 0;margin-bottom:28px;">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:${color};margin:0 0 10px;font-weight:600;">Your Growth Edge</p>
        <p style="font-style:italic;font-size:14px;color:#4A5A4D;margin:0;line-height:1.7;">${growthEdge || ''}</p>
      </div>

      <!-- Score Breakdown -->
      <div style="background:#FFFFFF;border:1px solid #E8E6E1;border-radius:12px;padding:24px;margin-bottom:28px;">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#999999;margin:0 0 16px;font-weight:600;">Score Breakdown</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${scoreBarHtml}
        </table>
      </div>

      <!-- Divider -->
      <div style="border-top:1px solid #E8E6E1;margin:28px 0;"></div>

      <!-- Suggestions -->
      <div style="margin-bottom:24px;">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:${color};margin:0 0 16px;font-weight:600;">What's Next for You</p>
        ${suggestionsHtml}
      </div>

      <!-- Download reminder -->
      <div style="text-align:center;padding:16px 0 8px;">
        <p style="font-size:13px;color:#999999;margin:0;">Visit your results page to download a branded PDF or shareable social card.</p>
      </div>
    `;

    const html = buildBrandedEmail({
      preheader: `Your attachment style: ${profileTitle} — "${profileSubtitle}"`,
      heading: "Soul Maps Results",
      subheading: "Attachment Style Quiz",
      body: bodyHtml,
      ctaUrl: `${SITE_URL}/soul-maps/attachment-style`,
      ctaText: "View Full Results",
      footerText: `You're receiving this because you took the Attachment Style quiz on Soul Maps.`,
    });

    const { error } = await resend.emails.send({
      from: SENDERS.hello,
      to: [email],
      subject: `${emoji} ${profileTitle} — Your Attachment Style Results`,
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
