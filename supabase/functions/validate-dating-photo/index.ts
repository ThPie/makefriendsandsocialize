import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Expect a multipart form with the image file
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ valid: false, reason: "No photo provided." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Image = btoa(binary);
    const mimeType = file.type || "image/jpeg";

    const prompt = `You are a photo moderation system for a premium matchmaking platform.

Analyze this photo and determine if it is acceptable as a real human profile photo.

REJECT the photo (return valid: false) if it is:
- AI-generated (e.g. created by Midjourney, DALL-E, Stable Diffusion, or any AI image generator)
- A cartoon, illustration, drawing, painting, or digital art
- A celebrity, famous person, or public figure
- A group photo with multiple people
- A pet, animal, object, or nature scene without a clear human subject
- Nudity or sexually explicit content
- A selfie in inappropriate settings (e.g. bathroom mirror if face is not clearly visible)
- Heavily filtered to the point where face authenticity cannot be verified
- A screenshot of another photo or profile

ACCEPT the photo (return valid: true) if it is:
- A real photograph of a single human being
- The face is reasonably visible and identifiable
- The photo appears genuine and unmanipulated

Return ONLY valid JSON in this exact format:
{
  "valid": true or false,
  "reason": "Brief 1-sentence explanation (shown to user if rejected)"
}

Do not include any other text or formatting.`;

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
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        // On rate limit, allow the photo through (fail open) to avoid blocking users
        console.warn("AI rate limited — allowing photo through");
        return new Response(
          JSON.stringify({ valid: true, reason: "Validation skipped (rate limit)." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.warn("AI payment required — allowing photo through");
        return new Response(
          JSON.stringify({ valid: true, reason: "Validation skipped (quota)." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      // Fail open on unexpected errors to avoid blocking uploads
      return new Response(
        JSON.stringify({ valid: true, reason: "Validation unavailable." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content ?? "";

    // Parse the JSON from the AI response
    let parsed: { valid: boolean; reason: string };
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      // Fail open if parsing fails
      return new Response(
        JSON.stringify({ valid: true, reason: "Could not parse validation result." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("validate-dating-photo error:", error);
    // Fail open — don't block uploads on unexpected errors
    return new Response(
      JSON.stringify({ valid: true, reason: "Validation error." }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
