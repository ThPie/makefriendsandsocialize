import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// All circles/topics the agent draws from
const CONTENT_TOPICS = [
  {
    circle: "The Gentlemen",
    themes: [
      "male friendship and vulnerability",
      "brotherhood in modern society",
      "men's mental health and social connection",
      "building trust between men",
    ],
  },
  {
    circle: "The Ladies Society",
    themes: [
      "women's empowerment through community",
      "female friendship dynamics",
      "women supporting women in career and life",
      "building a women's inner circle",
    ],
  },
  {
    circle: "Les Amis",
    themes: [
      "francophone community building",
      "cultural connection through language",
      "bilingual social life",
      "French-speaking networking",
    ],
  },
  {
    circle: "Couple's Circle",
    themes: [
      "couples socializing together",
      "double dates and couple friendships",
      "maintaining social life as a couple",
      "relationship growth through community",
    ],
  },
  {
    circle: "Active & Outdoor",
    themes: [
      "fitness and social bonding",
      "outdoor activities for mental health",
      "sports as social connection",
      "adventure-based friendships",
    ],
  },
  {
    circle: "Founders Circle",
    themes: [
      "entrepreneur networking strategies",
      "business relationship building",
      "founder loneliness and community",
      "professional growth through connections",
    ],
  },
  {
    circle: "Soul Maps",
    themes: [
      "attachment styles and relationships",
      "self-awareness and personal growth",
      "psychology of friendship",
      "understanding your social patterns",
      "conflict resolution styles",
      "emotional intelligence in dating",
    ],
  },
  {
    circle: "Dating & Relationships",
    themes: [
      "intentional dating in the modern world",
      "slow dating philosophy",
      "building healthy romantic relationships",
      "dating readiness and self-reflection",
    ],
  },
];

const BLOG_CATEGORIES = [
  "Making Friends",
  "Dating & Relationships",
  "Community Stories",
  "Personal Growth",
  "Networking & Career",
  "Lifestyle",
  "Soul Maps",
  "Club Culture",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get existing posts to avoid duplicates
    const { data: existingPosts } = await supabase
      .from("journal_posts")
      .select("title, slug, category, tags")
      .order("created_at", { ascending: false })
      .limit(20);

    const existingTitles = (existingPosts || []).map((p: any) => p.title);

    // Pick a random topic/circle
    const topicGroup =
      CONTENT_TOPICS[Math.floor(Math.random() * CONTENT_TOPICS.length)];
    const theme =
      topicGroup.themes[Math.floor(Math.random() * topicGroup.themes.length)];
    const category =
      BLOG_CATEGORIES[Math.floor(Math.random() * BLOG_CATEGORIES.length)];

    // Generate blog post using Lovable AI
    const systemPrompt = `You are an expert content strategist and writer for MakeFriends & Socialize (makefriendsandsocialize.com), a premium private social club for professionals. You write insightful, SEO-optimized blog posts that attract organic traffic.

Your writing style is:
- Warm, authoritative, and psychology-informed
- Uses storytelling and real research
- Naturally weaves in internal links to the platform's features
- Includes actionable takeaways
- Written for professionals aged 25-45

The platform has these circles: The Gentlemen, The Ladies Society, Les Amis, Couple's Circle, Active & Outdoor, Founders Circle, and features like Soul Maps (psychology quizzes), Slow Dating, and curated events.

IMPORTANT SEO RULES:
- Title must be compelling and under 60 characters
- Include a meta description under 160 characters  
- Use H2 and H3 subheadings throughout
- Include natural keyword variations
- Reference studies, books, or experts when relevant
- End with a call-to-action encouraging readers to explore the platform`;

    const userPrompt = `Write a professional, SEO-optimized blog post about "${theme}" related to the "${topicGroup.circle}" circle.

Category: ${category}

AVOID these existing titles: ${existingTitles.slice(0, 10).join(", ")}

Return a JSON object using the tool provided with these fields:
- title: SEO-optimized title (under 60 chars)
- slug: URL-friendly slug  
- excerpt: Meta description (under 160 chars)
- content: Full article in markdown (1200-2000 words), with:
  - An engaging intro paragraph
  - 4-6 H2 sections with substance
  - Research references and expert quotes where relevant
  - Internal links like [Soul Maps](/soul-maps), [Our Events](/events), [Membership](/membership), [Slow Dating](/slow-dating)
  - A concluding CTA section
- tags: Array of 3-5 relevant tags
- reading_time_minutes: Estimated reading time (number)`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_blog_post",
                description: "Create a new blog post with all required fields",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    slug: { type: "string" },
                    excerpt: { type: "string" },
                    content: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    reading_time_minutes: { type: "number" },
                  },
                  required: [
                    "title",
                    "slug",
                    "excerpt",
                    "content",
                    "tags",
                    "reading_time_minutes",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "create_blog_post" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, will retry later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required for AI usage" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No tool call returned from AI");
    }

    const post = JSON.parse(toolCall.function.arguments);

    // Ensure unique slug
    const timestamp = Date.now().toString(36);
    const uniqueSlug = `${post.slug}-${timestamp}`;

    // Insert the blog post
    const { data: inserted, error: insertError } = await supabase
      .from("journal_posts")
      .insert({
        title: post.title,
        slug: uniqueSlug,
        excerpt: post.excerpt,
        content: post.content,
        category,
        tags: post.tags,
        reading_time_minutes: post.reading_time_minutes,
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select("id, title, slug")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to insert post: ${insertError.message}`);
    }

    console.log(`✅ Auto-published: "${post.title}" → /journal/${uniqueSlug}`);

    return new Response(
      JSON.stringify({
        success: true,
        post: {
          id: inserted.id,
          title: inserted.title,
          slug: inserted.slug,
          category,
          circle: topicGroup.circle,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Content agent error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
