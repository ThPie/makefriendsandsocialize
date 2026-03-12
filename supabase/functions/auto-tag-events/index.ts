import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { getCorsHeaders } from '../_shared/cors.ts';

const CIRCLE_TAGS = [
  'the-gentlemen',
  'the-ladies-society',
  'les-amis',
  'couples-circle',
  'active-outdoor',
  'the-exchange',
  'founders-circle',
];

const CATEGORIES = [
  'Networking', 'Social', 'Dining', 'Workshop', 'Outdoor', 'Cultural', 'Wellness', 'Tech', 'Fashion', 'Art',
];

const PLATFORM_TAGS = ['meetup', 'eventbrite', 'luma', 'networking'];

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ success: false, error: 'Supabase not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Denver',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    // Fetch events that need tagging: platform-only tags or empty tags
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('id, title, description, tags')
      .gte('date', today)
      .neq('status', 'cancelled');

    if (fetchError) {
      console.error('Error fetching events:', fetchError);
      return new Response(JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Filter to events that need tagging
    const needsTagging = (events || []).filter(e => {
      const tags = e.tags || [];
      if (tags.length === 0) return true;
      // Only has platform tags
      return tags.every((t: string) => PLATFORM_TAGS.includes(t.toLowerCase()));
    });

    console.log(`Found ${needsTagging.length} events needing auto-tagging`);

    if (needsTagging.length === 0) {
      return new Response(JSON.stringify({ success: true, data: { tagged: 0 } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Build a single prompt for all events (batch)
    const eventsList = needsTagging.map((e, i) =>
      `${i + 1}. Title: "${e.title}"${e.description ? ` | Description: "${e.description.substring(0, 200)}"` : ''}`
    ).join('\n');

    const systemPrompt = `You are an event categorizer for "Make Friends & Socialize", a social club in Salt Lake City. 
Assign each event the most appropriate circle tag and category.

Circle tags (pick ONE primary):
- the-gentlemen: Men's networking, grooming, style, whiskey tastings, cigar events
- the-ladies-society: Women's events, fashion, beauty, brunch, closet sales
- les-amis: French-themed, language practice, cultural events
- couples-circle: Date nights, couples activities
- active-outdoor: Hiking, sports, fitness, outdoor adventures
- the-exchange: Tech, AI, business networking, professional development, startup events
- founders-circle: Entrepreneurship, founder meetups, investor events

Categories: Networking, Social, Dining, Workshop, Outdoor, Cultural, Wellness, Tech, Fashion, Art

Return ONLY a JSON array with objects for each event in order:
[{"circle_tag": "the-exchange", "category": "Tech"}, ...]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Categorize these events:\n${eventsList}` },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      return new Response(JSON.stringify({ success: false, error: `AI error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle markdown code blocks)
    let tags: Array<{ circle_tag: string; category: string }> = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tags = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ success: false, error: 'Failed to parse AI tags' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let taggedCount = 0;
    for (let i = 0; i < needsTagging.length && i < tags.length; i++) {
      const event = needsTagging[i];
      const tag = tags[i];

      // Validate the circle tag
      const circleTag = CIRCLE_TAGS.includes(tag.circle_tag) ? tag.circle_tag : 'les-amis';
      const category = CATEGORIES.includes(tag.category) ? tag.category : 'Social';

      const newTags = [circleTag, category.toLowerCase()];

      const { error } = await supabase
        .from('events')
        .update({ tags: newTags, updated_at: new Date().toISOString() })
        .eq('id', event.id);

      if (!error) {
        taggedCount++;
        console.log(`Tagged "${event.title}" → ${circleTag} / ${category}`);
      } else {
        console.error(`Error tagging event ${event.id}:`, error);
      }
    }

    console.log(`Auto-tagging complete: ${taggedCount} events tagged`);

    return new Response(
      JSON.stringify({ success: true, data: { eventsChecked: needsTagging.length, tagged: taggedCount } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-tag-events:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
