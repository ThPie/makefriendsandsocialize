

# Pre-Launch Audit: Performance, Matchmaking, and UX Improvements

## Findings

### A. Slow Portal Tabs — Root Causes

**1. PortalEvents: N+1 RSVP Count Query (Critical)**
Lines 114-135 of `PortalEvents.tsx` loop through every event and fire a separate `SELECT COUNT(*)` query per event. With 37 events, that's 37 sequential database calls on page load.

**2. PortalConnections: Uses `useEffect` + `setState` instead of React Query**
No caching, no stale-time — re-fetches every mount. Two sequential queries (sent + received) with no parallelization.

**3. PortalNetwork: Same pattern** — `useEffect` fetch with no caching.

**4. BlurredMatchCard: Edge function per photo**
Each blurred match card invokes the `blur-image` edge function. With multiple matches, this fires N cold-start edge function calls on the Slow Dating page.

---

### B. Matchmaking Algorithm Analysis

**Strengths:**
- Solid Gottman-based weighted scoring (30% communication, 25% values, 20% life/family, 17% dealbreakers, 8% lifestyle)
- Hard dealbreaker pre-filtering before AI calls (saves API costs)
- Reciprocal preference enforcement (gender + age)
- Profile completeness gating (50% minimum)
- Rate limiting (3 calls/hour)
- Batch AI processing with `Promise.allSettled`
- Confidence scoring based on answer depth

**Issues Found:**

1. **No location/radius filtering** — `search_radius` field exists but is never used in `find-matches`. Two people 3,000 miles apart can match.

2. **Two separate match queries** — Lines 100-108 fire two queries (`user_a_id = X` then `user_b_id = X`) instead of using `.or()`. Doubles query count.

3. **`select('*')` on dating_profiles** — The match query and profile query both pull all columns when only a subset is needed.

4. **No existing-match deduplication before AI** — The function runs AI analysis on ALL candidates, then checks for existing matches when storing results. It should skip candidates who already have an active match with the target.

5. **AI model choice: `gemini-2.5-pro`** — This is the most expensive/slowest model. For batch matching, `gemini-2.5-flash` (already used in preprocess) would be 5-10x faster at minimal quality loss.

6. **Missing `drinking_status` dealbreaker** — Smoking is checked but heavy drinking isn't.

7. **No religion/politics compatibility** — These fields aren't in the profile schema or scoring, despite being mentioned in the audit doc.

---

### C. UX Improvements for Launch

1. **Empty states need polish** — "No Active Matches Yet" card is functional but could show estimated wait time or tips.

2. **Match card "Why you match" text is generic when not revealed** — Always shows "Strong compatibility in communication and shared values" regardless of actual scores. Could vary the teaser based on the highest dimension.

3. **No match notification sound/animation** — Users get matches silently. A celebratory moment when first viewing a new match would increase engagement.

4. **Dating intake already refactored** — Good. The `IntakeWizard` component is clean.

5. **PortalSlowDating `select('*')` on dating_profiles** — Should only select the fields defined in the component's interface.

---

## Implementation Plan

### Phase 1: Fix Slow Tabs (Performance)

**1. Fix PortalEvents N+1 RSVP counts**
Replace the per-event loop with a single aggregated query using `.in('event_id', eventIds)` and group counts client-side. Or use an RPC function.

**2. Migrate PortalConnections to React Query**
Replace `useEffect` + `setState` with `useQuery` for caching and parallel fetching. Use `Promise.all` for sent/received.

**3. Migrate PortalNetwork to React Query**
Same pattern — add caching with 5-min staleTime.

**4. Cache blurred images in database**
Store the blurred URL in `dating_profiles.blurred_photo_url` during preprocessing, eliminating per-render edge function calls.

**5. Optimize PortalSlowDating queries**
- Merge the two match queries into one using `.or()`
- Replace `select('*')` with specific columns on dating_profiles

### Phase 2: Matchmaking Algorithm Fixes

**6. Add location/radius filtering**
Add a geocoding step in preprocessing and filter candidates by `search_radius` in `find-matches`.

**7. Skip already-matched candidates before AI**
Query existing `dating_matches` for the target profile and exclude those candidate IDs from AI analysis.

**8. Switch AI model to `gemini-2.5-flash`**
Change find-matches from `gemini-2.5-pro` to `gemini-2.5-flash` for faster batch processing. Quality difference is minimal for structured JSON scoring.

**9. Add drinking dealbreaker**
Add heavy drinking check alongside smoking in `passesDealbreakerCheck`.

### Phase 3: UX Polish for Launch

**10. Dynamic match teaser text**
Instead of the static "Strong compatibility in communication and shared values", generate a teaser based on the highest-scoring dimension from `match_dimensions`.

**11. Improve empty states**
Add contextual messaging: estimated review time for pending profiles, tips for improving match quality.

---

## Summary

| # | Change | Impact | Effort |
|---|--------|--------|--------|
| 1 | Fix RSVP N+1 query | Eliminates ~37 queries per page load | Small |
| 2 | React Query for Connections | Adds caching, removes re-fetch on mount | Small |
| 3 | React Query for Network | Same | Small |
| 4 | Cache blurred photos | Eliminates N edge function calls | Medium |
| 5 | Optimize SlowDating queries | 2 queries → 1, less data transfer | Small |
| 6 | Location/radius filtering | Prevents cross-country matches | Medium |
| 7 | Skip existing matches pre-AI | Saves AI API calls + cost | Small |
| 8 | Switch to gemini-2.5-flash | 5-10x faster matching | Trivial |
| 9 | Drinking dealbreaker | Better match quality | Trivial |
| 10 | Dynamic match teasers | Better engagement | Small |
| 11 | Improved empty states | Better first-run experience | Small |

