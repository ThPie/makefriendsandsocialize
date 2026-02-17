import { getCorsHeaders } from '../_shared/cors.ts';


interface InstagramPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  timestamp: string | null;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();

    if (!username) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl is not configured. Please connect Firecrawl in Settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '').trim();
    const instagramUrl = `https://www.instagram.com/${cleanUsername}/`;

    console.log('Fetching Instagram profile:', instagramUrl);

    // Use Firecrawl to scrape Instagram
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: instagramUrl,
        formats: ['html', 'links'],
        waitFor: 5000, // Wait for JS to load images
        onlyMainContent: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error || `Failed to fetch Instagram profile (status ${response.status})` 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Firecrawl response received');

    // Parse the HTML to extract image URLs
    const html = data.data?.html || '';
    const photos: InstagramPhoto[] = [];

    // Instagram image patterns - looking for CDN URLs
    // Instagram uses various CDN domains
    const imagePatterns = [
      // scontent CDN URLs (most common)
      /https:\/\/scontent[^"'\s]+\.jpg[^"'\s]*/gi,
      /https:\/\/scontent[^"'\s]+\.webp[^"'\s]*/gi,
      // Instagram CDN URLs
      /https:\/\/instagram[^"'\s]+\.(jpg|webp|png)[^"'\s]*/gi,
      // og:image and meta image tags
      /content="(https:\/\/[^"]+\.(jpg|webp|png)[^"]*)"/gi,
    ];

    const foundUrls = new Set<string>();

    for (const pattern of imagePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        // Get the URL from either the full match or first capture group
        let url = match[1] || match[0];
        
        // Clean up the URL
        url = url.replace(/&amp;/g, '&');
        
        // Filter out profile pics, icons, and very small images
        // Keep images that look like post images (usually larger)
        if (url.includes('s150x150') || 
            url.includes('s44x44') || 
            url.includes('s40x40') ||
            url.includes('s32x32') ||
            url.includes('profile_pic') ||
            url.includes('_s.jpg')) {
          continue;
        }

        // Only add unique URLs
        if (!foundUrls.has(url)) {
          foundUrls.add(url);
        }
      }
    }

    // Convert to photo objects
    let photoIndex = 0;
    for (const url of foundUrls) {
      // Generate a unique ID based on URL hash
      const postId = `ig_${cleanUsername}_${photoIndex}_${Date.now()}`;
      
      photos.push({
        id: postId,
        imageUrl: url,
        caption: null, // Instagram doesn't expose captions without login
        timestamp: null,
      });
      
      photoIndex++;
      
      // Limit to first 30 photos
      if (photoIndex >= 30) break;
    }

    console.log(`Found ${photos.length} photos from Instagram profile`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          username: cleanUsername,
          photos,
          profileUrl: instagramUrl,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Instagram photos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Instagram photos';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
