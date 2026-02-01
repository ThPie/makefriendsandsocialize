

# Instagram Gallery Sync Integration

## Overview
I'll create a system that allows you to enter your Instagram profile URL and automatically sync photos to your gallery. The sync can run manually or on a schedule.

---

## How It Will Work

### Admin Experience
1. Navigate to **Admin → Photos**
2. Click **"Sync from Instagram"** button
3. Enter your Instagram username (e.g., `makefriendsandsocialize`)
4. Click **"Fetch Photos"** to preview recent posts
5. Select which photos to import
6. Photos are added to your gallery with proper metadata

### Automatic Syncing
- Optional: Set up a scheduled job to sync new Instagram posts daily
- New posts are automatically added to the gallery
- Duplicates are detected and skipped via URL matching

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Instagram Sync Button → Enter Username → Fetch Posts    │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Edge Function: fetch-instagram-photos               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  1. Use Firecrawl to scrape Instagram profile page        │    │
│  │  2. Extract image URLs and captions from page content     │    │
│  │  3. Return structured photo data                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  event_photos table                                       │    │
│  │  + instagram_settings table (username, last_sync, etc.)   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Database Changes

**New table: `instagram_settings`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| instagram_username | text | Your Instagram handle |
| last_synced_at | timestamp | Last successful sync |
| auto_sync_enabled | boolean | Enable daily sync |
| default_category | text | Category for imported photos |
| created_at | timestamp | Record creation time |

**Modify: `event_photos` table**
| New Column | Type | Description |
|------------|------|-------------|
| instagram_post_id | text | Original IG post ID for deduplication |
| source | text | 'manual' or 'instagram' |

### 2. Edge Function: `fetch-instagram-photos`

Uses Firecrawl (already connected) to scrape the public Instagram page:
- Fetches `https://www.instagram.com/makefriendsandsocialize/`
- Extracts image URLs, captions, and timestamps
- Returns structured data for the admin to review

### 3. Admin UI Updates

**New component in AdminPhotos.tsx:**
- "Sync from Instagram" button in the header
- Dialog to enter/change Instagram username
- Preview grid of fetched photos with select/deselect
- "Import Selected" button to add to gallery

### 4. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/fetch-instagram-photos/index.ts` | Create | Edge function to scrape Instagram |
| `src/pages/admin/AdminPhotos.tsx` | Modify | Add Instagram sync UI |
| `src/components/admin/InstagramSyncDialog.tsx` | Create | Dialog for Instagram configuration |
| SQL Migration | Create | Add instagram_settings table + modify event_photos |
| `supabase/config.toml` | Modify | Add function config |

---

## Technical Approach

### Why Firecrawl?
- You already have Firecrawl connected (API key configured)
- Instagram public profiles can be scraped without authentication
- Firecrawl handles JavaScript rendering needed for Instagram
- No need for Instagram API credentials or OAuth

### How Scraping Works
```typescript
// Edge function calls Firecrawl
const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: `https://www.instagram.com/${username}/`,
    formats: ["markdown", "html"],
    waitFor: 3000, // Wait for JS to load images
  }),
});

// Parse response to extract image URLs and captions
```

### Deduplication Logic
- Each imported photo stores the original Instagram post ID
- Before importing, check if `instagram_post_id` already exists
- Skip duplicates, only import new posts

---

## User Interface Preview

### Instagram Sync Dialog
```text
┌────────────────────────────────────────────────┐
│         📷 Sync from Instagram                  │
├────────────────────────────────────────────────┤
│                                                │
│  Instagram Username                            │
│  ┌────────────────────────────────────────┐   │
│  │ makefriendsandsocialize                 │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  Default Category: [Dropdown: Networking ▾]    │
│                                                │
│  ☐ Enable automatic daily sync                 │
│                                                │
│         [Cancel]  [Fetch Photos]               │
│                                                │
├────────────────────────────────────────────────┤
│  Fetched Photos (12 found, 3 already imported) │
│  ┌──────┬──────┬──────┬──────┐               │
│  │ [☑]  │ [☑]  │ [☐]  │ [☑]  │               │
│  │ img1 │ img2 │ img3 │ img4 │               │
│  └──────┴──────┴──────┴──────┘               │
│                                                │
│  Selected: 9 photos                            │
│                                                │
│         [Select All]  [Import Selected]        │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Limitations & Notes

1. **Public Profiles Only**: The Instagram profile must be public for scraping to work
2. **Rate Limits**: Instagram may rate-limit excessive requests; recommend syncing once daily
3. **Image Quality**: Scraped images may be at Instagram's default resolution
4. **Terms of Service**: Web scraping is in a gray area; use responsibly for your own content
5. **Alternative**: If you have an Instagram Business account, we could integrate the official Graph API instead (requires additional setup)

---

## Estimated Implementation Time
~30 minutes to implement all components

