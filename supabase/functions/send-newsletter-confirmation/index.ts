import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { buildBrandedEmail, SENDERS, SITE_URL, p } from '../_shared/email-layout.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildBrandedEmail({
      preheader: "Welcome to the MakeFriends community newsletter",
      heading: "MakeFriends Social Club",
      subheading: "Welcome to the Community",
      body: `
        ${p("Thank you for subscribing to our newsletter. You'll receive curated updates on upcoming events, community stories, and exclusive invitations.")}
        ${p("We keep things intentional — no spam, only what matters.")}
      `,
      ctaUrl: `${SITE_URL}/events`,
      ctaText: "Explore Upcoming Events",
      footerText: `You're receiving this because ${email} subscribed to our newsletter.`,
    });

    const { error } = await resend.emails.send({
      from: SENDERS.hello,
      to: [email],
      subject: "Welcome to the MakeFriends Newsletter ✨",
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
    console.error("Newsletter email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
