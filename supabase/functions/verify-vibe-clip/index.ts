import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { userId, videoUrl } = await req.json();

        if (!userId || !videoUrl) {
            throw new Error("Missing userId or videoUrl");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

        // 1. Fetch the user's profile photo for comparison (optional but good for trust)
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("avatar_urls")
            .eq("id", userId)
            .single();

        if (profileError) throw profileError;
        const profilePhoto = profile.avatar_urls?.[0];

        // 2. AI Analysis using Gemini Vision
        // We'll prompt Gemini to analyze the video (via URL) or a snapshot if full video analysis is limited
        // For now, we'll use the URL and ask it to verify authenticity and safety.
        const prompt = `Analyze this video clip for a social networking profile.
    
1. Is there a real human being visible and speaking/moving?
2. Does the content appear safe, respectful, and compliant with community standards (no nudity, violence, or hate speech)?
3. If a profile photo is provided here: ${profilePhoto || 'N/A'}, does it look like the same person?

**RESPONSE FORMAT (JSON ONLY):**
{
  "is_verified": true/false,
  "reason": "Short explanation of the decision",
  "confidence": 0-1
}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp", // Using flash for fast vision analysis
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: videoUrl } } // Gemini 2.0 can often process short video URLs as 'images' or we can extract frames
                        ]
                    },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI API Error:", errorText);
            throw new Error("AI Verification failed to respond");
        }

        const aiResult = await response.json();
        const content = aiResult.choices?.[0]?.message?.content;
        const { is_verified, reason } = JSON.parse(content);

        // 3. Update the profile with the result
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                vibe_clip_status: is_verified ? "verified" : "rejected",
                // We could also store the reason in a metadata field if we had one
            })
            .eq("id", userId);

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify({ success: true, is_verified, reason }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in verify-vibe-clip:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
