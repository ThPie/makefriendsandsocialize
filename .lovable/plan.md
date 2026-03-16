

# Performance & Scaling Optimizations Plan

## Current State

Your app is in early stage (3 profiles, 37 events, ~190 rate limit entries). The architecture document outlines goals for 400K users. Several optimizations are already partially in place (caching hook, indexes, rate limiting, lazy routes). Here's what I'll implement to make the app production-ready for scale.

---

## What's Already Working Well
- Lazy-loaded routes (code splitting)
- React Query with 5-min staleTime
- Database-backed cache (`cache_metadata` table + `useCachedData` hook)
- Rate limiting (API + admin + OAuth)
- Vercel caching headers for static assets
- Gallery page uses `useInfiniteQuery` (pagination)
- Skeleton loaders on dashboard

---

## Implementation Plan

### 1. Consolidate Dashboard Stats into a Single Query
**Problem**: `DashboardStats.tsx` fires 4 separate queries on every dashboard load.
**Fix**: Create a single database function `get_dashboard_stats(user_id)` that returns all 4 counts in one round trip, and update the component to use it.

### 2. Add Missing Database Indexes
**Problem**: Several high-traffic query patterns lack indexes. Based on actual queries in the codebase:
```text
- events(date, status) — EventsPage filters by date and status
- event_rsvps(user_id, status) — Dashboard + schedule queries
- notification_queue(user_id, is_read) — Notification count polling
- business_profiles(status, is_visible) — Directory page
- profiles(onboarding_completed) — Active member count
- dating_profiles(user_id) — Profile lookups
- dating_profiles(is_active, status) — Match queries
- dating_matches(user_a_id), dating_matches(user_b_id) — Match lookups
- referrals(referrer_id, status) — Referral tracking
- connections(requester_id, status), connections(requested_id, status)
```

### 3. Add Pagination to Admin Pages
**Problem**: `AdminMembers`, `AdminDating`, `AdminBusinesses`, `AdminTestimonials`, `AdminReferrals` all fetch `SELECT *` with no limit. At scale, these will time out or return massive payloads.
**Fix**: Add `.range()` pagination (25 per page) with page controls to admin list pages.

### 4. Select Only Needed Columns
**Problem**: Many queries use `.select('*')` when only a few columns are needed (e.g., events list only displays title, date, location, image).
**Fix**: Replace `select('*')` with specific column lists in the highest-traffic pages: `EventsPage`, `ConnectedCircleDirectoryPage`, `PortalSlowDating`, and admin pages.

### 5. Batch Notification Triggers on Dating Matches
**Problem**: The `dating_matches` table has 5 AFTER triggers (new match, declined, meeting scheduled, decision time, mutual match). Each UPDATE fires all 5 trigger checks.
**Fix**: Consolidate into a single trigger function that checks the specific status change and queues the appropriate notification, reducing trigger overhead from 5 to 1.

### 6. Add Periodic Cleanup via pg_cron
**Problem**: Rate limit tables, expired sessions, and old audit logs accumulate without cleanup.
**Fix**: Schedule pg_cron jobs to run cleanup functions (`cleanup_old_api_rate_limits`, `cleanup_expired_sessions`, `cleanup_expired_mfa_sessions`, `cleanup_old_oauth_rate_limits`) daily.

### 7. Enable Realtime Only Where Needed
**Problem**: `EventsPage` subscribes to realtime on the entire `events` table for all changes.
**Fix**: Scope the realtime subscription to only listen for relevant events and ensure other tables don't have unnecessary realtime enabled.

---

## What I Won't Change (Already Optimal)
- **Vercel hosting**: Keep it. CDN edge caching + static asset headers are already configured correctly.
- **React Query config**: 5-min staleTime, 30-min gcTime, retry 1 — these are good defaults.
- **Code splitting**: All routes are already lazy-loaded.
- **Connection pooling**: Handled automatically by Lovable Cloud.

---

## Summary of Changes

| Area | Files Changed | Impact |
|------|--------------|--------|
| Dashboard single query | 1 migration + 1 component | 4 queries → 1 |
| Database indexes | 1 migration | Faster reads at scale |
| Admin pagination | 5 admin pages | Prevents timeouts |
| Column selection | 5-6 page files | Less data transfer |
| Trigger consolidation | 1 migration | 5 triggers → 1 |
| Cleanup cron jobs | 1 migration (pg_cron) | Prevents table bloat |
| Realtime scoping | 1 page file | Less WebSocket load |

