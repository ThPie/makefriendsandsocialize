import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Scraping Meetup feedback page...");

    // Use Firecrawl extract (JSON mode) to pull structured review data
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://www.meetup.com/makefriendsandsocialize/feedback-overview/",
        formats: [
          {
            type: "json",
            schema: {
              type: "object",
              properties: {
                reviews: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      reviewer_name: { type: "string" },
                      rating: { type: "number" },
                      review_text: { type: "string" },
                      profile_photo_url: { type: "string" },
                    },
                    required: ["reviewer_name", "rating", "review_text"],
                  },
                },
              },
              required: ["reviews"],
            },
            prompt:
              "Extract all member reviews/feedback. For each review get the reviewer's full name, their star rating (1-5), the review text, and their profile photo URL if available.",
          },
        ],
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error("Firecrawl error:", scrapeData);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Scraping failed — Meetup feedback page may require authentication. Seed reviews manually.",
          details: scrapeData,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract reviews from the response
    const json = scrapeData?.data?.json || scrapeData?.json;
    const reviews: Array<{
      reviewer_name: string;
      rating: number;
      review_text: string;
      profile_photo_url?: string;
    }> = json?.reviews || [];

    if (reviews.length === 0) {
      console.log("No reviews extracted — page may require login");
      return new Response(
        JSON.stringify({
          success: false,
          error: "No reviews found. The Meetup feedback page likely requires authentication. Please seed reviews manually.",
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to 4+ stars only
    const goodReviews = reviews.filter((r) => r.rating >= 4);
    console.log(`Found ${reviews.length} total reviews, ${goodReviews.length} with 4+ stars`);

    let upserted = 0;
    for (const review of goodReviews) {
      const { error } = await supabase.from("testimonials").upsert(
        {
          name: review.reviewer_name,
          quote: review.review_text,
          rating: review.rating,
          image_url: review.profile_photo_url || null,
          source: "meetup",
          is_approved: true,
          is_featured: false,
        },
        { onConflict: "name,source" }
      );

      if (error) {
        console.error(`Failed to upsert review from ${review.reviewer_name}:`, error);
      } else {
        upserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_found: reviews.length,
        filtered_4plus: goodReviews.length,
        upserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in sync-meetup-reviews:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
