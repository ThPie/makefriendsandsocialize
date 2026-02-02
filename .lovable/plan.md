
# Fix Meetup Sync to Only Import Your Group's Events

## Problem Identified
The Meetup scraper is importing events that don't belong to your group ("Make Friends and Socialize"). Events like "Singles Mix & Mingle", "Celebrate Mardi Gras", and "Quiet Conversations" are from other Meetup groups showing as "suggested events" on the page.

Your actual events are:
- **Upcoming**: "A Candlelit Gatsby Soirée – Valentine" (Feb 14)
- **Past**: "See How Slow Dating Matchmaking Works", "Founders Freelancers and Business Owners Networking Night", etc.

## Solution

### Step 1: Clean Up Foreign Events from Database
Delete events that were incorrectly imported from other Meetup groups:
- Remove events with titles that don't match your group's events
- Keep only legitimate events from your "Make Friends and Socialize" group

### Step 2: Update Scraping Functions with Stricter Validation
Modify all three edge functions to:

1. **Use your group's specific events URLs**:
   - Upcoming: `https://www.meetup.com/makefriendsandsocialize/events/`
   - Past: `https://www.meetup.com/makefriendsandsocialize/events/past/`

2. **Add venue validation** - Your events are at "HAVN at Salt Lake Crossing" - use this to filter

3. **Add stricter extraction prompts** that explicitly tell Firecrawl to:
   - Only extract events from the main event list
   - Ignore "suggested events" and "events near you" sections
   - Look for events hosted by "Make Friends and Socialize"

4. **Re-enable the sync** with the fixed logic

### Files to Update

| File | Changes |
|------|---------|
| `supabase/functions/scheduled-event-sync/index.ts` | Update extraction prompt to be more specific |
| `supabase/functions/sync-meetup-upcoming-events/index.ts` | Re-enable sync, add venue/host validation |
| `supabase/functions/scrape-meetup-events/index.ts` | Re-enable scraping, add venue/host validation |

## Technical Implementation

For each scraping function:

```text
┌─────────────────────────────────┐
│   Scrape Meetup Page            │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│   Extract Events (AI)           │
│   - Specific prompt for YOUR    │
│     group only                  │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│   Validate Each Event:          │
│   ✓ Venue = HAVN/Salt Lake      │
│   ✓ Title not generic           │
│   ✓ Matches your event style    │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│   Insert/Update in Database     │
└─────────────────────────────────┘
```

## Expected Outcome
- Only YOUR group's events will be synced
- Foreign events from other groups will be ignored
- Existing incorrect events can be manually deleted or marked as cancelled
