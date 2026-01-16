import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-DAILY-QUOTE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting daily quote generation");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in UTC
    const today = new Date().toISOString().split('T')[0];
    logStep("Checking for existing quote", { date: today });

    // Check if we already have a quote for today
    const { data: existingQuote, error: fetchError } = await supabase
      .from("daily_quotes")
      .select("*")
      .eq("quote_date", today)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is expected
      throw new Error(`Failed to fetch existing quote: ${fetchError.message}`);
    }

    if (existingQuote) {
      logStep("Quote already exists for today", { quote: existingQuote.quote_text });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Quote already exists",
        quote: existingQuote.quote_text 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate a new quote using Lovable AI
    logStep("Generating new quote with AI");

    const systemPrompt = `You are a wise, thoughtful mentor for a private social club called MakeFriends & Socialize. 
This club is for professionals who value authentic connections, meaningful friendships, and intentional networking.

Generate a single, inspiring motivational quote or message for today. The quote should:
- Focus on themes like: authentic connections, building genuine friendships, professional growth, community, intentional living, meaningful relationships, courage to meet new people, or the value of shared experiences
- Be elegant, sophisticated, and thought-provoking
- Be concise (1-2 sentences maximum, under 200 characters is ideal)
- NOT be attributed to anyone - it should be original
- NOT include quotation marks in your response
- Inspire members to engage with their community

Examples of the tone you should match:
- "The richest connections begin with the courage to say hello."
- "In a world of screens, be the one who shows up."
- "Your next meaningful friendship is just one conversation away."`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate today's motivational quote for our community members." }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limits exceeded, please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Payment required, please add funds to Lovable AI workspace.");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const quoteText = aiResponse.choices?.[0]?.message?.content?.trim();

    if (!quoteText) {
      throw new Error("No quote generated from AI");
    }

    logStep("AI generated quote", { quote: quoteText });

    // Save the quote to the database
    const { data: newQuote, error: insertError } = await supabase
      .from("daily_quotes")
      .insert({
        quote_text: quoteText,
        quote_date: today,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save quote: ${insertError.message}`);
    }

    logStep("Quote saved successfully", { id: newQuote.id });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Quote generated and saved",
      quote: newQuote.quote_text 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
