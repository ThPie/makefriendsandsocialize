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
                overall_rating: { type: "number" },
                total_reviews: { type: "number" },
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
                    required: ["reviewer_name", "rating"],
                  },
                },
              },
              required: ["reviews"],
            },
            prompt:
              "Extract the overall group rating and total number of reviews. Then extract all individual member reviews/feedback. For each review get the reviewer's full name, their star rating (1-5), the review text (leave empty string if they only left a star rating without text), and their profile photo URL if available.",
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
          error: "Scraping failed — Meetup feedback page may require authentication.",
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
      review_text?: string;
      profile_photo_url?: string;
    }> = json?.reviews || [];

    // Update overall rating and review count in meetup_stats
    const overallRating = json?.overall_rating;
    const totalReviews = json?.total_reviews;
    
    if (overallRating || totalReviews) {
      const updateData: Record<string, unknown> = { last_updated: new Date().toISOString() };
      if (overallRating) updateData.rating = overallRating;
      if (totalReviews) updateData.review_count = totalReviews;
      
      await supabase
        .from("meetup_stats")
        .update(updateData)
        .eq("meetup_url", "https://www.meetup.com/makefriendsandsocialize/");
      
      console.log(`Updated meetup_stats: rating=${overallRating}, review_count=${totalReviews}`);
    }

    if (reviews.length === 0) {
      console.log("No reviews extracted — page may require login");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No individual reviews found (page may require login), but stats may have been updated.",
          rating_updated: !!overallRating,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only save reviews that have actual written text (not just star ratings)
    const writtenReviews = reviews.filter(
      (r) => r.rating >= 4 && r.review_text && r.review_text.trim().length > 0
    );
    console.log(`Found ${reviews.length} total reviews, ${writtenReviews.length} with 4+ stars AND written text`);

    let upserted = 0;
    for (const review of writtenReviews) {
      const { error } = await supabase.from("testimonials").upsert(
        {
          name: review.reviewer_name,
          quote: review.review_text!.trim(),
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
        with_written_text: writtenReviews.length,
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
