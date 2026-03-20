

# CPU at 99% — Root Cause Analysis & Fix Plan

## Diagnosis Summary

Your database has **only 37 events, 2 profiles, and 2 user_roles rows** — yet it's performing **hundreds of thousands of sequential scans**. The CPU isn't overloaded by traffic; it's overloaded by **RLS policy evaluation overhead**.

### The Bottleneck: `has_role()` called on every single query

```text
Every authenticated query path:

  User query → Table RLS check
                 ├── Policy 1: has_role(auth.uid(), 'admin')  → scans user_roles table
                 ├── Policy 2: user_id = auth.uid()           → simple, fast
                 └── Policy 3: has_role(auth.uid(), 'admin')  → scans user_roles AGAIN

  × 44 tables with has_role policies
  × 166 total RLS policies
  = thousands of redundant user_roles lookups per page load
```

**Key stats from your database right now:**
- `user_roles` index: **7,184 scans** (for a 2-row table)
- `profiles` table: **6,712 sequential scans** (for 2 rows)
- `memberships` table: **6,155 sequential scans** (for 2 rows)
- `meeting_proposals` table: **6,816 sequential scans** (for 0 rows!)
- `testimonials` table: **6,200 sequential scans** (for 10 rows)

### Additional CPU drains found:
- **Nested subquery RLS policies** on `meeting_proposals` — 3 levels deep (dating_profiles → dating_matches → meeting_proposals) evaluated on every scan
- **`is_connected_with()` in profiles RLS** — joins connections + profiles on every profile read
- **Realtime subscriptions** on 5 channels (each triggers RLS checks)
- **EventHeatmap** polling every **10 seconds** (hits events table + RLS)
- **DashboardStats** polling every **30 seconds**
- **Subscription check** polling every **5 minutes** (edge function invoke)

---

## Fix Plan

### Phase 1: Eliminate redundant `has_role()` calls with a cached session variable

Instead of querying `user_roles` on every single policy check, set the role once per connection using a session variable.

**Migration:**
1. Create a function `set_user_role_context()` that runs once per request and stores the role in `current_setting('app.user_role')`
2. Replace `has_role(auth.uid(), 'admin')` in all 44 tables with a simple `current_setting('app.user_role', true) = 'admin'` check — zero table lookups

### Phase 2: Simplify nested RLS policies

1. **meeting_proposals**: Replace 3-level nested subquery with a `SECURITY DEFINER` helper function `is_match_participant(auth.uid(), match_id)` that does one efficient join
2. **dating_matches**: Same — replace nested `dating_profiles` subqueries with a helper
3. **profiles**: Replace `is_connected_with()` call in SELECT policy with a simpler approach — allow all authenticated users to see basic profiles (first_name, avatar) since the `get_connected_profile_limited` RPC already handles access control

### Phase 3: Reduce client-side polling

1. **EventHeatmap**: Change from 10s to 60s polling (or remove — event density doesn't change every 10 seconds)
2. **DashboardStats**: Change from 30s to 120s polling
3. **EmailVerificationPage**: Already at 5s, which is fine for its specific use case
4. **Remove duplicate realtime channels**: `notification_updates` and `badge_updates` both listen to `notification_queue` — consolidate to one

### Phase 4: Add missing indexes for RLS query patterns

```sql
-- For is_connected_with() function
CREATE INDEX IF NOT EXISTS idx_connections_pair 
  ON connections (requester_id, requested_id) WHERE status = 'accepted';

-- For meeting_proposals nested subquery
CREATE INDEX IF NOT EXISTS idx_dating_profiles_user_id 
  ON dating_profiles (user_id);

-- For testimonials seq scans
CREATE INDEX IF NOT EXISTS idx_testimonials_approved 
  ON testimonials (is_approved) WHERE is_approved = true;
```

---

## Expected Impact

| Change | CPU Reduction |
|--------|--------------|
| Session-cached role check | ~40-50% (eliminates 7K+ user_roles lookups) |
| Simplified nested RLS | ~15-20% (eliminates 6K+ meeting_proposals scans) |
| Reduced polling intervals | ~10-15% (fewer total queries) |
| New indexes | ~5-10% (faster remaining queries) |

**Realistic outcome**: CPU should drop from 99% to 20-40%, potentially allowing a downgrade from XLarge to a smaller instance.

---

## Technical Details

### Files to modify:
- **Database migration**: New helper functions + updated RLS policies for all 44 tables
- `src/components/events/EventHeatmap.tsx` — increase polling interval
- `src/components/portal/dashboard/DashboardStats.tsx` — increase polling interval
- `src/hooks/useAppBadge.ts` + `src/components/portal/NotificationBell.tsx` — consolidate realtime channels

### Risk mitigation:
- All RLS changes are additive (create new policies, then drop old ones)
- Helper functions are `SECURITY DEFINER` with `search_path = public`
- Changes can be rolled back by re-creating original policies

