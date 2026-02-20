import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getApplicationReceivedEmailHtml(displayName: string, coachingMessage: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Received – Intentional Connections</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0a0f0b; font-family: Georgia, 'Times New Roman', serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #0a0f0b; }
    .header { background-color: #0a2118; padding: 48px 40px 36px; text-align: center; border-bottom: 1px solid #D4AF3730; }
    .heart { font-size: 48px; display: block; margin-bottom: 16px; }
    .header h1 { color: #D4AF37; font-size: 28px; font-weight: 300; letter-spacing: 0.05em; margin: 0; }
    .header p { color: #ffffff80; font-size: 14px; margin: 8px 0 0; letter-spacing: 0.1em; text-transform: uppercase; }
    .body { padding: 40px; }
    .greeting { color: #f5f0e8; font-size: 18px; line-height: 1.7; margin-bottom: 28px; }
    .timeline-box { background-color: #0a2118; border: 1px solid #D4AF3730; border-radius: 12px; padding: 28px; margin-bottom: 28px; }
    .timeline-box h2 { color: #D4AF37; font-size: 14px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 16px; }
    .timeline-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .timeline-dot { width: 6px; height: 6px; background-color: #D4AF37; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
    .timeline-text { color: #ffffffcc; font-size: 15px; line-height: 1.6; }
    .coach-box { background-color: #f5f0e8; border-left: 3px solid #D4AF37; border-radius: 8px; padding: 28px; margin-bottom: 28px; }
    .coach-label { color: #5a4a2a; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
    .coach-message { color: #2a1f0a; font-size: 16px; line-height: 1.8; font-style: italic; margin: 0; }
    .email-notice { color: #ffffff60; font-size: 14px; line-height: 1.6; margin-bottom: 32px; text-align: center; }
    .cta-wrapper { text-align: center; margin-bottom: 32px; }
    .cta-btn { display: inline-block; background-color: #D4AF37; color: #0a0f0b; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 15px; font-weight: 600; letter-spacing: 0.05em; }
    .resource-link { text-align: center; margin-bottom: 40px; }
    .resource-link a { color: #D4AF3799; font-size: 13px; text-decoration: none; border-bottom: 1px solid #D4AF3740; padding-bottom: 2px; }
    .footer { border-top: 1px solid #ffffff10; padding: 32px 40px; text-align: center; }
    .footer p { color: #ffffff40; font-size: 13px; line-height: 1.8; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="heart">🌿</span>
      <h1>Application Received</h1>
      <p>Intentional Connections</p>
    </div>
    <div class="body">
      <p class="greeting">
        Dear ${displayName},<br/><br/>
        Congratulations on taking this step. Submitting your Intentional Connections profile takes courage — it means you're ready to be known, and to find someone worth knowing.
      </p>

      <div class="timeline-box">
        <h2>⏱ What Happens Next</h2>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <span class="timeline-text"><strong style="color:#D4AF37">24–48 hours:</strong> Our matchmaking team reviews your application personally.</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <span class="timeline-text"><strong style="color:#D4AF37">Social verification:</strong> We gently verify your profile to keep our community authentic.</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <span class="timeline-text"><strong style="color:#D4AF37">We'll reach out:</strong> If you're a great fit, expect a brief consultation call from our team.</span>
        </div>
      </div>

      <div class="coach-box">
        <div class="coach-label">💌 A note from your dating coach</div>
        <p class="coach-message">"${coachingMessage}"</p>
      </div>

      <p class="email-notice">📧 Keep an eye on your inbox — we may reach out with next steps or any follow-up questions.</p>

      <div class="cta-wrapper">
        <a href="https://www.gottman.com/blog/the-importance-of-being-intentional-in-your-relationship/" class="cta-btn">
          Read: The Art of Intentional Dating →
        </a>
      </div>

      <div class="resource-link">
        <a href="https://makefriendsandsocializecom.lovable.app/slow-dating">View your application status in the portal</a>
      </div>
    </div>
    <div class="footer">
      <p>With warmth,<br/><strong style="color:#D4AF3799">The Intentional Connections Team</strong><br/><br/>
      makefriendsandsocialize.com · You're receiving this because you applied to Intentional Connections.</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, displayName } = await req.json();

    if (!userId || !displayName) {
      return new Response(
        JSON.stringify({ error: "userId and displayName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env vars missing");

    // 1. Get user email via service role
    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      throw new Error(`Failed to get user email: ${userError?.message ?? "no email found"}`);
    }

    const userEmail = userData.user.email;

    // 2. Generate AI coaching message (fail gracefully)
    let coachingMessage = `You've shown real bravery by putting yourself out there with intention. The fact that you took the time to share your true self speaks volumes about the kind of partner you'll be. Trust the process — the right connection is worth the wait.`;

    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: "You are a warm, thoughtful dating coach who specializes in intentional, meaningful relationships. Your tone is encouraging, specific, and hopeful — never generic or cliché. Write in 2–3 sentences maximum.",
              },
              {
                role: "user",
                content: `Write 2-3 sentences of personalized encouragement for ${displayName}, who just submitted their Intentional Connections matchmaking application. They are actively choosing to pursue meaningful love with intention and vulnerability. Make it feel personal, warm, and hopeful. Do not use quotes around the message.`,
              },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          const content = aiResult?.choices?.[0]?.message?.content;
          if (content) coachingMessage = content.trim();
        }
      } catch (aiErr) {
        console.error("AI generation failed, using fallback:", aiErr);
      }
    }

    // 3. Send email via Resend
    const emailHtml = getApplicationReceivedEmailHtml(displayName, coachingMessage);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Intentional Connections <dating@makefriendsandsocialize.com>",
        to: [userEmail],
        subject: "Your Application is In — What Happens Next 🌿",
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.text();
      throw new Error(`Resend error: ${resendError}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-dating-application-email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
