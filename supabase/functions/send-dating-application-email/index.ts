import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox } from '../_shared/email-layout.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      throw new Error(`Failed to get user email: ${userError?.message ?? "no email found"}`);
    }

    const userEmail = userData.user.email;

    // Generate AI coaching message (fail gracefully)
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

    const emailHtml = buildBrandedEmail({
      preheader: `Your Intentional Connections application has been received`,
      heading: "Application Received",
      subheading: "Intentional Connections",
      body: `
        ${p(`Dear ${displayName},`)}
        ${p(`Congratulations on taking this step. Submitting your Intentional Connections profile takes courage — it means you're ready to be known, and to find someone worth knowing.`)}
        ${infoBox(`
          <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8B6914;font-weight:600;">⏱ What Happens Next</p>
          <p style="margin:0 0 10px;font-size:14px;color:#4A5A4D;line-height:1.6;">
            <strong style="color:#0D1F0F;">24–48 hours:</strong> Our matchmaking team reviews your application personally.
          </p>
          <p style="margin:0 0 10px;font-size:14px;color:#4A5A4D;line-height:1.6;">
            <strong style="color:#0D1F0F;">Social verification:</strong> We gently verify your profile to keep our community authentic.
          </p>
          <p style="margin:0;font-size:14px;color:#4A5A4D;line-height:1.6;">
            <strong style="color:#0D1F0F;">We'll reach out:</strong> If you're a great fit, expect a brief consultation call from our team.
          </p>
        `)}
        <div style="background-color:#E8E6E1;border-left:4px solid #8B6914;border-radius:0 12px 12px 0;padding:20px 24px;margin:0 0 24px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8B6914;font-weight:600;">💌 A note from your dating coach</p>
          <p style="margin:0;font-size:15px;line-height:1.7;font-style:italic;color:#4A5A4D;">"${coachingMessage}"</p>
        </div>
        ${p(`📧 Keep an eye on your inbox — we may reach out with next steps or any follow-up questions.`)}
      `,
      ctaUrl: `${SITE_URL}/slow-dating`,
      ctaText: "View Your Application Status",
      footerText: "Intentional Connections · You're receiving this because you applied to our matchmaking service.",
    });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDERS.dating,
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
