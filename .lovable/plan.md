

# Multi-Platform Event Publishing System

## Summary

Build a "Publish Everywhere" system on top of your existing Admin Events dashboard. Direct Eventbrite API publishing (you already have the key), plus webhook-based publishing for Luma, Meetup, Posh, Partiful, and others. Includes a Platform Connections settings page and per-platform sync status tracking.

## Database Changes

### New table: `event_platform_sync`
Tracks publish status per platform per event.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK → events | ON DELETE CASCADE |
| platform | text | 'eventbrite', 'luma', 'meetup', 'posh', 'partiful', 'facebook', 'linkedin' |
| status | text | 'pending', 'publishing', 'published', 'failed', 'skipped' |
| external_id | text | Platform's event ID |
| external_url | text | Link to event on platform |
| error_message | text | |
| enabled | boolean | Default true |
| last_synced_at | timestamptz | |
| created_at | timestamptz | Default now() |
| UNIQUE(event_id, platform) | | |

RLS: Admin-only (all operations).

### New table: `platform_connections`
Stores webhook URLs and connection status per platform.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| platform | text UNIQUE | |
| connection_type | text | 'api', 'webhook' |
| webhook_url | text | Zapier/Make webhook URL |
| is_active | boolean | Default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS: Admin-only.

### Add column to `events` table
- `publish_status` text DEFAULT 'draft' — values: 'draft', 'published', 'partial'

## New Edge Function: `publish-event`

Receives `{ event_id, platforms: string[] }` from admin UI.

1. Fetches the event from DB
2. For **Eventbrite** (if toggled): calls `POST /v3/organizations/{org_id}/events/` using existing `EVENTBRITE_API_KEY` to create the event, then publishes it via `POST /v3/events/{id}/publish/`
3. For **all other platforms**: sends structured JSON to the configured webhook URL from `platform_connections`
4. Updates `event_platform_sync` row for each platform with status/URL
5. Updates `events.publish_status` to 'published' or 'partial'

Webhook payload shape (for Zapier/Make):
```json
{
  "action": "create_event",
  "event": { "title", "description", "date", "time", "location", "capacity", "price", "image_url", "tags" },
  "target_platform": "luma",
  "callback_url": "https://.../functions/v1/publish-event-callback"
}
```

## New Edge Function: `publish-event-callback`

Simple endpoint that receives `{ event_id, platform, external_id, external_url }` from Zapier/Make after event creation, and updates `event_platform_sync`.

## UI Changes

### 1. AdminEvents.tsx — Add Draft Mode + Publish Panel

- Add "Draft" to the status dropdown (currently: upcoming/ongoing/past/cancelled)
- After saving an event, show a **"Publish Everywhere" panel** — a section below the event form or a modal with:
  - Toggle switches for each connected platform (fetched from `platform_connections`)
  - "Publish Selected" button
  - Real-time status per platform: spinner → green check / red X with error message
- Add a "Drafts" tab alongside All/Upcoming/Past/Featured
- Event list: show small platform icons (colored by status) next to each event
- RSVP column: tooltip breakdown showing Eventbrite/Meetup/Luma counts

### 2. New Page: AdminIntegrations.tsx (`/cx/integrations`)

- Card per platform: Eventbrite, Luma, Meetup, Posh, Partiful, Facebook, LinkedIn
- Eventbrite card: shows "Connected" (API key exists), no webhook needed
- All others: webhook URL input + active toggle + "Test" button (sends a test payload)
- Save button persists to `platform_connections` table

### 3. AdminLayout.tsx

- Add "Integrations" item to "System Insights" section

### 4. routes/config.tsx

- Add lazy import + route for `AdminIntegrations`

## New Components

| Component | Purpose |
|---|---|
| `PublishEverywherePanel.tsx` | Modal/panel with platform toggles, publish button, status indicators |
| `PlatformSyncStatus.tsx` | Small icon row showing publish status per platform on event cards |

## Files Summary

| File | Action |
|---|---|
| DB migration | Create `event_platform_sync`, `platform_connections`, add `publish_status` to `events` |
| `supabase/functions/publish-event/index.ts` | New — Eventbrite API + webhook dispatch |
| `supabase/functions/publish-event-callback/index.ts` | New — webhook callback receiver |
| `src/pages/admin/AdminEvents.tsx` | Add draft mode, publish panel trigger, sync status icons, RSVP breakdown |
| `src/pages/admin/AdminIntegrations.tsx` | New — platform connection manager |
| `src/components/admin/PublishEverywherePanel.tsx` | New — publish modal with per-platform status |
| `src/components/admin/PlatformSyncStatus.tsx` | New — sync status icons for event list |
| `src/components/admin/AdminLayout.tsx` | Add "Integrations" sidebar item |
| `src/routes/config.tsx` | Add integrations route |
| `supabase/config.toml` | Add publish-event + publish-event-callback function config |

