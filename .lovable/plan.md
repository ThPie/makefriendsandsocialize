

## Plan: AI Auto-Tagger, Attendee Merging Fix, and Community Count Aggregation

### Problems Identified

1. **Events show platform tags ("eventbrite") instead of circle tags** — The sync functions hardcode `tags: ['eventbrite']` or `tags: ['meetup']`. These platform names leak into the UI badge on event cards (line 458-461 in EventsPage.tsx).

2. **Timeless event shows 15 attendees, not merged** — The Timeless event (Mar 21) has `eventbrite_rsvp_count: 15` but `meetup_rsvp_count: 0`. The Feb 28 duplicate has `rsvp_count: 4` separately. The merge logic ran but the Meetup sync didn't populate `meetup_rsvp_count` correctly for this event.

3. **Attendee count not shown on event cards** — The EventsPage cards show capacity info but for external events without capacity, they show "Open event" instead of showing the actual attendee count (e.g., "15 attending").

4. **Total community member count only pulls from Meetup** — `meetup_stats.member_count` (1012) is the only source. Eventbrite and Luma follower/member counts are not aggregated.

5. **No AI agent for auto-tagging events with circle tags** — Events need to be automatically tagged with the correct circle (e.g., "AI Builders Night" → `the-exchange`, "Timeless Closet" → `the-ladies-society`).

---

### Implementation Plan

#### 1. Create AI Auto-Tagging Edge Function

Create `supabase/functions/auto-tag-events/index.ts` that:
- Fetches all events with missing or platform-only tags (`['eventbrite']`, `['meetup']`, `['luma']`)
- Uses a Lovable AI model (gemini-2.5-flash) to analyze each event's title + description and assign the correct circle tags from: `the-gentlemen`, `the-ladies-society`, `les-amis`, `couples-circle`, `active-outdoor`, `the-exchange`, `founders-circle`
- Also assigns a display category (Networking, Social, Dining, etc.)
- Updates the `tags` array in the database, removing platform source tags
- This function will be called at the end of `sync-all-events`

#### 2. Fix Eventbrite Sync to Not Overwrite Tags

In `sync-eventbrite-events/index.ts` (and the other sync functions):
- When **updating** an existing event, do NOT overwrite `tags` with `['eventbrite']`. Preserve existing tags.
- When **inserting** a new event, set tags to empty `[]` or leave null — the AI tagger will fill them in.
- Same fix needed in `sync-meetup-upcoming-events` and `sync-luma-events`.

#### 3. Fix Attendee Count Display on Event Cards

In `EventsPage.tsx` (lines 512-538), update the attendee display logic:
- When there's no capacity but `rsvp_count > 0`, show "{count} attending" instead of "Open event"
- This ensures external events with attendee data display their counts

#### 4. Fix Attendee Merging in Sync Functions

The Eventbrite sync (line 206-211) overwrites the entire event data including `tags` when merging. Fix to:
- Only update platform-specific fields (`eventbrite_rsvp_count`, `eventbrite_id`, `external_url`, etc.)
- Recalculate `rsvp_count` as sum of all platform counts
- Do NOT touch `tags`, `title`, or `source` on merge

#### 5. Aggregate Community Member Count

- Update `sync-all-events` to also fetch Eventbrite follower count via `GET /v3/organizations/{id}/` (which returns `follower_count`) and store it
- Add columns `eventbrite_follower_count` and `luma_follower_count` to `meetup_stats` table (or create a new `community_stats` table)
- Update the hero section query to sum all platform member counts

#### 6. Remove Platform Source Badges from UI

- In `EventDetailPage.tsx` (lines 328-333), remove the "Meetup" badge that shows `event.source`
- The tag badge already displays from `event.tags[0]`, which after auto-tagging will show the circle name

---

### Technical Details

**AI Auto-Tagger prompt structure:**
```
Given this event title and description, assign the most appropriate circle tag(s) from: [list].
Return JSON: { "circle_tags": [...], "category": "..." }
```

**Database migration needed:**
- Add `eventbrite_follower_count` and `luma_follower_count` integer columns to `meetup_stats` (or rename table to `community_stats`)

**Sync-all-events orchestration update:**
- After steps 1-3 (platform syncs), call `auto-tag-events`
- After that, aggregate community counts

**Files to modify:**
- `supabase/functions/sync-eventbrite-events/index.ts` — stop overwriting tags on merge
- `supabase/functions/sync-meetup-upcoming-events/index.ts` — same
- `supabase/functions/sync-luma-events/index.ts` — same
- `supabase/functions/sync-all-events/index.ts` — add auto-tag step + community count aggregation
- `supabase/functions/auto-tag-events/index.ts` — new AI tagger function
- `src/pages/EventsPage.tsx` — fix attendee count display
- `src/pages/EventDetailPage.tsx` — remove source badge
- `src/components/home/TestimonialsSection.tsx` — aggregate member counts

