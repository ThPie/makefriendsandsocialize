

# Fix Plan: Build Errors + 7 Recommended Pre-Launch Fixes

## Part A: Fix Build Errors (Blocking)

### 1. PortalEvents.tsx — Multiple TypeScript errors
**Root cause**: `useInfiniteQuery` is missing `initialPageParam`, and the code references non-existent RPC functions (`get_event_rsvp_counts`, `get_event_waitlist_counts`).

**Fix**:
- Add `initialPageParam: 0` to both `useInfiniteQuery` calls
- Add proper generic types to `useInfiniteQuery<{ events: Event[]; hasMore: boolean }>`
- Replace the RPC calls for RSVP/waitlist counts with direct `.in()` queries on `event_rsvps` and `event_waitlist` tables (these RPC functions were never created)
- Fix `upcomingEvents.length` → use flattened array properly

### 2. find-matches/index.ts — `updated_at` not on DatingProfile
**Fix**: Add `updated_at: string | null;` to the `DatingProfile` interface (line 53).

---

## Part B: 7 Recommended Pre-Launch Fixes

### 3. Schedule cleanup cron jobs (database migration)
Create a migration that schedules 5 `pg_cron` entries for the existing cleanup functions at 3 AM UTC daily. These functions exist but were never scheduled.

### 4. Fix detect-location edge function
The function uses `http://ip-api.com` which fails from edge functions (no HTTP allowed, only HTTPS). Replace with a fallback that gracefully returns null location instead of failing, or switch to an HTTPS geolocation API.

### 5. Add RSVP optimistic updates
Already implemented in the current code (lines 245-270 have `onMutate` with rollback). This is done — just needs the build errors fixed first.

### 6. Add event pagination
Already implemented with `useInfiniteQuery` + "Load More" buttons. Just needs the TypeScript fixes from Part A.

### 7-9. Missing secrets (VITE_SENTRY_DSN, STRIPE_WEBHOOK_SECRET, VITE_GA4_MEASUREMENT_ID)
These require you to obtain values from external services (Sentry, Stripe, Google Analytics). I will prompt you to add each one, but cannot create the values — you need to get them from each service's dashboard.

---

## Summary of Code Changes

| File | Change |
|------|--------|
| `src/pages/portal/PortalEvents.tsx` | Fix `useInfiniteQuery` types, add `initialPageParam`, replace missing RPC with `.in()` queries |
| `supabase/functions/find-matches/index.ts` | Add `updated_at` to `DatingProfile` interface |
| `supabase/functions/detect-location/index.ts` | Fix HTTP→HTTPS issue or add graceful fallback |
| Database (insert tool) | Schedule 5 cleanup cron jobs |
| Secrets | Prompt for VITE_SENTRY_DSN, STRIPE_WEBHOOK_SECRET, GA4 ID |

