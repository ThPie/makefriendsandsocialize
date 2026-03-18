import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InstagramPhoto {
  id: string;
  imageUrl: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!firecrawlKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get instagram settings where auto_sync is enabled
    const { data: settings, error: settingsError } = await supabase
      .from('instagram_settings')
      .select('*')
      .eq('auto_sync_enabled', true);

    if (settingsError) {
      console.error('Error fetching instagram settings:', settingsError);
      throw settingsError;
    }

    if (!settings || settings.length === 0) {
      console.log('No Instagram accounts configured for auto-sync');
      return new Response(
        JSON.stringify({ success: true, message: 'No accounts to sync', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalImported = 0;

    for (const setting of settings) {
      const username = setting.instagram_username.replace(/^@/, '').trim();
      const defaultCategory = setting.default_category || null;

      console.log(`Auto-syncing Instagram: @${username}`);

      // Fetch existing instagram_post_ids to deduplicate
      const { data: existingPhotos } = await supabase
        .from('event_photos')
        .select('instagram_post_id')
        .not('instagram_post_id', 'is', null);

      const existingIds = new Set(
        (existingPhotos || []).map((p: { instagram_post_id: string | null }) => p.instagram_post_id).filter(Boolean)
      );

      // Scrape Instagram via Firecrawl
      const instagramUrl = `https://www.instagram.com/${username}/`;
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: instagramUrl,
          formats: ['html', 'links'],
          waitFor: 5000,
          onlyMainContent: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Firecrawl error for @${username}:`, data);
        continue; // Skip this account, try next
      }

      // Parse HTML for image URLs
      const html = data.data?.html || '';
      const imagePatterns = [
        /https:\/\/scontent[^"'\s]+\.jpg[^"'\s]*/gi,
        /https:\/\/scontent[^"'\s]+\.webp[^"'\s]*/gi,
        /https:\/\/instagram[^"'\s]+\.(jpg|webp|png)[^"'\s]*/gi,
        /content="(https:\/\/[^"]+\.(jpg|webp|png)[^"]*)"/gi,
      ];

      const foundUrls = new Set<string>();

      for (const pattern of imagePatterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          let url = match[1] || match[0];
          url = url.replace(/&amp;/g, '&');

          // Filter out tiny images and profile pics
          if (url.includes('s150x150') || url.includes('s44x44') ||
              url.includes('s40x40') || url.includes('s32x32') ||
              url.includes('profile_pic') || url.includes('_s.jpg')) {
            continue;
          }

          foundUrls.add(url);
        }
      }

      // Get max display_order
      const { data: maxOrderData } = await supabase
        .from('event_photos')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      let nextOrder = (maxOrderData?.[0]?.display_order ?? 0) + 1;

      // Insert new photos (skip duplicates)
      const newPhotos: Array<{
        image_url: string;
        instagram_post_id: string;
        source: string;
        category: string | null;
        display_order: number;
        title: string | null;
      }> = [];
      let photoIndex = 0;

      for (const url of foundUrls) {
        const postId = `ig_${username}_${Buffer.from(url).toString('base64').slice(0, 20)}`;

        if (existingIds.has(postId)) {
          continue; // Already imported
        }

        newPhotos.push({
          image_url: url,
          instagram_post_id: postId,
          source: 'instagram',
          category: defaultCategory,
          display_order: nextOrder++,
          title: null,
        });

        photoIndex++;
        if (photoIndex >= 30) break;
      }

      if (newPhotos.length > 0) {
        const { error: insertError } = await supabase
          .from('event_photos')
          .insert(newPhotos);

        if (insertError) {
          console.error(`Error inserting photos for @${username}:`, insertError);
        } else {
          console.log(`Imported ${newPhotos.length} new photos from @${username}`);
          totalImported += newPhotos.length;
        }
      } else {
        console.log(`No new photos to import from @${username}`);
      }

      // Update last_synced_at
      await supabase
        .from('instagram_settings')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', setting.id);
    }

    return new Response(
      JSON.stringify({ success: true, imported: totalImported }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auto-sync Instagram error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
