import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const eventsContext = `
You are the Event Assistant for The Gathering Society, an exclusive membership club. You help members discover and learn about our curated events.

Available Events:
1. Wine Tasting Masterclass - October 28, 2024 at The Cellar Room, Downtown. Category: Dining. Join our sommelier for an intimate evening exploring rare vintages from Bordeaux and Tuscany. Includes paired canapés.

2. Charity Polo Match - November 05, 2024 at Greenfield Polo Club. Category: Sports. Experience the thrill of the sport of kings. All proceeds go to the Children's Arts Foundation. VIP tent access available.

3. Modern Art Gallery Opening - November 12, 2024 at Lumina Gallery. Category: Art & Culture. Be the first to view the 'Digital Horizons' exhibition. Meet the artists and enjoy champagne reception.

4. Jazz & Cocktails Night - November 20, 2024 at Blue Note Lounge. Category: Music. A relaxed evening featuring the smooth sounds of the Miles Quartet. Signature cocktails served throughout the night.

5. Private Chef's Table Experience - December 01, 2024 at The Private Kitchen. Category: Dining. An exclusive 8-course tasting menu prepared by Michelin-starred Chef Laurent. Limited to 12 guests.

6. Opera Under the Stars - December 15, 2024 at Hartwell Estate Gardens. Category: Music. Experience a magical evening of arias and duets in the gardens of Hartwell Estate. Black tie attire.

Guidelines:
- Be warm, sophisticated, and helpful
- Recommend events based on member interests
- Keep responses concise but informative
- If asked about events not listed, politely explain these are our current offerings
- Encourage RSVPs for events that match their interests
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
          { role: "system", content: eventsContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Event assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
