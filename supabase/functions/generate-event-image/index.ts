import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { title, description, eventType } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Event title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating image for event:", { title, description, eventType });

    // Create a detailed prompt for the image
    const imagePrompt = `Create a sophisticated, premium event thumbnail image for: "${title}". 
${description ? `Event description: ${description}.` : ""}
${eventType ? `Event type: ${eventType}.` : ""}

Style requirements:
- Ultra high resolution, professional photography quality
- Dark, moody atmosphere with rich shadows
- Elegant and luxurious aesthetic
- Subtle gold/amber accent lighting
- Deep forest green or charcoal tones
- Perfect for a premium membership club event
- No text or words in the image
- 16:9 aspect ratio composition
- Cinematic lighting with depth`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");

    // Extract the generated image
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image was generated");
    }

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert base64 to blob
    const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const fileName = `event-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const filePath = `events/${fileName}`;

    // Check if events bucket exists, if not we'll return the base64 directly
    const { data: buckets } = await supabase.storage.listBuckets();
    const eventsBucket = buckets?.find((b) => b.name === "events");

    let imageUrl = generatedImage;

    if (eventsBucket) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, imageBytes, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        // Return base64 if upload fails
      } else {
        const { data: urlData } = supabase.storage
          .from("events")
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
        console.log("Image uploaded successfully:", imageUrl);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        message: "Event image generated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating event image:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate image",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
