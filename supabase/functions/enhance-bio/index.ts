import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { bio, firstName } = await req.json();

    if (!bio || bio.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Please write at least a few words about yourself first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional bio writer for an exclusive social club called MakeFriends. Rewrite the user's bio to be polished, warm, and engaging while preserving their personality and key details. Keep it concise (2-3 sentences max). Don't use emojis. Don't make things up - only enhance what they wrote. Return ONLY the improved bio text, nothing else.`
          },
          {
            role: "user",
            content: `Here is my bio to improve:\n\n"${bio}"\n\nMy first name is ${firstName || 'a member'}.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedBio = data.choices?.[0]?.message?.content?.trim();

    return new Response(
      JSON.stringify({ enhancedBio }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('enhance-bio error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to enhance bio' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
