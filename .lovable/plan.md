

## Problem Summary

Currently, all three platforms (Eventbrite, Meetup, Luma) can independently create event cards on the site. This causes duplicates and stale titles. The user wants:

1. **Eventbrite is the single source of truth** for event cards — only Eventbrite events create/own cards
2. **Meetup & Luma never create new events** — they only add their attendee counts to matching Eventbrite events
3. **Event titles stay updated** from Eventbrite (e.g., "AI Builders Night" → "AI Build Night")
4. **Smarter AI-powered matching** between platforms when titles differ slightly

## Plan

### 1. Make Eventbrite the primary source — update sync-eventbrite-events

- When upserting events, always update the `title` from Eventbrite so name changes propagate immediately
- Set `source: 'eventbrite'` always (stop preserving meetup as source priority)
- Already handles insert + update correctly; just needs the title update on match

### 2. Change sync-meetup-upcoming-events to never insert new events

- Remove the INSERT branch entirely — Meetup sync should only UPDATE existing events
- When a fuzzy title match is found on the same date, update only `meetup_rsvp_count` and recalculate `rsvp_count`
- Do NOT overwrite title, description, image, time, location, source, or any other Eventbrite-owned fields
- Remove the "mark as cancelled" logic that cancels events missing from Meetup (since Eventbrite owns the lifecycle)

### 3. Change sync-luma-events to never insert new events

- Same approach: remove the INSERT branch
- Only update `luma_rsvp_count` and `luma_id` on matching events, recalculate `rsvp_count`
- Do NOT overwrite title, description, image, source, or other Eventbrite-owned fields

### 4. Update sync-all-events orchestrator

- Ensure Eventbrite syncs FIRST (it already does as step 2, but Meetup runs first)
- Reorder: Eventbrite → Meetup → Luma → matching → recalc → auto-tag
- The cross-platform matching in step 4 can remain as a safety net

### 5. Improve title matching with AI (using existing auto-tag pattern)

- Use Lovable AI (Gemini Flash) in the orchestrator's matching step for ambiguous cases where word-overlap similarity is between 0.3–0.6
- Send pairs of titles to AI asking "are these the same event?" for borderline matches
- This handles cases like "AI Builders Night" vs "AI Build Night" which share few exact words

### Files to modify

| File | Changes |
|------|---------|
| `supabase/functions/sync-all-events/index.ts` | Reorder: Eventbrite first, then Meetup & Luma. Add AI-assisted matching for ambiguous title pairs. |
| `supabase/functions/sync-eventbrite-events/index.ts` | Always update title on match. Always set `source: 'eventbrite'`. |
| `supabase/functions/sync-meetup-upcoming-events/index.ts` | Remove INSERT branch. Only update `meetup_rsvp_count` on matched events. Remove cancel logic. Don't overwrite Eventbrite fields. |
| `supabase/functions/sync-luma-events/index.ts` | Remove INSERT branch. Only update `luma_rsvp_count` on matched events. Don't overwrite Eventbrite fields. |

