

# Verified Assessment of CPU Findings

## Finding 1: WAL Sender / START_REPLICATION — PARTIALLY CONFIRMED but MISLEADING

**What Google said:** This is consuming ~97% of CPU.

**What the data actually shows:** The walsender process IS active, but its `wait_event` is `WalSenderWaitForWal` — meaning it's **idle/sleeping**, waiting for new data. It is NOT actively burning CPU. This is normal behavior for any project with realtime enabled.

However, the underlying **realtime infrastructure IS a problem**:
- `realtime.subscription` table: **75,740 sequential scans** with 0 rows in it
- 3 tables are in the realtime publication: `events`, `business_leads`, `notification_queue`
- 5 separate realtime channel subscriptions exist in the frontend code (leads, notifications x2, activity feed, events page)
- The `notification_queue` table alone has been added to realtime AND has 7,717 seq_scans — double overhead

**Verdict:** The walsender itself isn't the 97% CPU culprit, but the **realtime subscription machinery** scanning the subscription table 75K+ times is a real contributor.

## Finding 2: Indexes Show 0 Scans — CONFIRMED but EXPECTED

**What Google said:** Indexes like `idx_user_roles_user_role` are being ignored.

**What the data shows:** Confirmed — these indexes have 0 scans:
- `idx_user_roles_user_role` — 0 scans
- `idx_memberships_active` — 0 scans
- `idx_memberships_user_active` — 0 scans
- `idx_profiles_onboarding` — 0 scans
- `idx_profiles_first_name` — 0 scans

**However, this is actually EXPECTED behavior.** Your tables are tiny (profiles: 2 rows, memberships: 2 rows, user_roles: ~1-2 rows). PostgreSQL's query planner correctly chooses sequential scan over index scan for tables with fewer than ~50 rows because reading 2 rows sequentially is faster than doing an index lookup + heap fetch. The indexes will activate once you have real user volume.

**Verdict:** Not a problem. This is correct PostgreSQL optimization for small datasets.

## Finding 3: Table Hotspots (meetup_stats, notification_queue) — CONFIRMED

**What the data shows:**
| Table | Seq Scans | Idx Scans | Rows |
|-------|-----------|-----------|------|
| meetup_stats | 8,150 | 49 | 2 |
| notification_queue | 7,717 | 17,077 | 2 |
| meeting_proposals | 6,825 | 0 | 0 |
| profiles | 6,721 | 621 | 2 |
| testimonials | 6,255 | 26 | 10 |
| memberships | 6,156 | 939 | 2 |

These are high scan counts but again — with only 2 rows per table, each seq_scan takes microseconds. The real cost is the **RLS policy evaluation overhead** that triggers these scans. Every authenticated request evaluates `has_role()`, `has_active_membership()`, etc., which scan these tables.

**Verdict:** Confirmed hotspot, but the RLS caching we already added (session-level `set_config`) should be mitigating this. The cumulative counts are historical.

## Finding 4: Storage Schema Privilege Warnings — LOW IMPACT

Cannot directly verify without access to error logs, but storage warnings are typically cosmetic and not CPU-related.

---

## The Real Fix: Remove Unnecessary Realtime Subscriptions

The single most impactful change is reducing the realtime overhead. Here's the plan:

### Step 1: Remove `notification_queue` from realtime publication
This table doesn't need realtime — notifications are already polled via React Query. Removing it from the publication stops the WAL decoder from processing every INSERT/UPDATE on this high-traffic table.

### Step 2: Remove `business_leads` from realtime publication
With only 1 business profile and 23 leads, realtime for leads is unnecessary overhead. Polling is sufficient.

### Step 3: Consolidate duplicate realtime channels
`useAppBadge.ts` and `NotificationBell.tsx` both subscribe to `notification_updates` channel — these should be consolidated into a single subscription.

### Step 4: Keep only `events` in realtime
Events is the only table where realtime genuinely benefits UX (live RSVP count updates).

### Technical Details

**Migration:**
```sql
ALTER PUBLICATION supabase_realtime DROP TABLE public.notification_queue;
ALTER PUBLICATION supabase_realtime DROP TABLE public.business_leads;
```

**Code changes:**
- `src/hooks/useLeadRealtime.ts` — Convert to polling with React Query (60s interval)
- `src/hooks/useAppBadge.ts` — Remove realtime channel, rely on React Query invalidation
- `src/components/portal/ActivityFeed.tsx` — Remove realtime channel (it listens to notification_queue which we're removing from publication)
- `src/components/portal/NotificationBell.tsx` — Keep as the single notification poller, remove realtime channel

This should dramatically reduce the internal realtime machinery overhead (75K+ subscription table scans).

