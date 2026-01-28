
# Fix Duplicate Sidebar, Performance, and Loading Issues

## Problem Analysis

Based on the screenshot and code investigation, I've identified the following issues:

### 1. Duplicate Sidebar Issue
The screenshot clearly shows two sidebars rendering side by side. This is caused by:
- The `SidebarProvider` rendering both a **mobile Sheet sidebar** AND a **desktop fixed sidebar** simultaneously
- The sidebar component in `src/components/ui/sidebar.tsx` shows both on medium+ screens because the mobile check (`isMobile` from `useIsMobile`) may be inconsistent or returning `false` while the component is also rendering

### 2. Performance Issues (Slow Dashboard)
Multiple factors are causing slow performance:

**A. Excessive API calls:**
- `useSubscription` hook calls the `check-subscription` edge function on every render AND every 60 seconds
- `ActivityFeed` polls every 30 seconds AND has realtime subscription
- `AttendanceStreak` makes 2 separate queries
- Dashboard makes 3+ simultaneous API calls on mount

**B. Component re-renders:**
- `useSubscription` is used in BOTH `PortalLayout` AND `TrialCountdownBanner`, causing duplicate edge function calls
- Multiple realtime subscriptions are created (ActivityFeed, NotificationBell) without proper cleanup
- The `useAuth` hook returns new object references, causing child re-renders

**C. React warnings (from console logs):**
- `EventCard` and `SelectContent` components are receiving refs but not forwarding them properly
- These warnings indicate unnecessary component remounting

### 3. Icons/Tabs Loading Repeatedly
This is caused by:
- Components re-rendering due to state changes in parent
- Realtime subscriptions triggering unnecessary re-fetches
- Missing memoization of expensive computations

---

## Implementation Plan

### Step 1: Fix Duplicate Sidebar Issue
**File:** `src/components/ui/sidebar.tsx`

The `useIsMobile` hook returns `undefined` initially during SSR/hydration, causing both mobile and desktop sidebars to render. Fix by:
- Adding a check for `undefined` state
- Ensuring only one sidebar renders at a time
- Adding a mounted state check

**Changes:**
- Update the `Sidebar` component to handle the initial undefined state from `useIsMobile`
- Add loading state while `isMobile` is being determined

### Step 2: Optimize useSubscription Hook
**File:** `src/hooks/useSubscription.ts`

Current issues:
- Calls edge function immediately on mount
- Polls every 60 seconds regardless of visibility
- Creates new function references on each render

**Changes:**
- Add `staleTime` to prevent duplicate calls within a time window
- Only poll when page is visible (using Page Visibility API)
- Memoize the hook's return value
- Reduce polling interval to 5 minutes (300000ms) instead of 60 seconds
- Use React Query instead of useState for better caching

### Step 3: Optimize Dashboard Performance
**File:** `src/pages/portal/PortalDashboard.tsx`

**Changes:**
- Memoize expensive calculations (`calculateCompletion`)
- Use `useMemo` for `quickActions` array
- Lazy load non-critical components (BadgeDisplay, SubmitReview)
- Add dependency array fixes to useEffects

### Step 4: Optimize ActivityFeed
**File:** `src/components/portal/ActivityFeed.tsx`

**Changes:**
- Increase `refetchInterval` from 30 seconds to 60 seconds
- Add `refetchOnWindowFocus: false` to prevent unnecessary refetches
- Add `staleTime` to cache results
- Properly cleanup realtime subscription

### Step 5: Optimize TrialCountdownBanner
**File:** `src/components/portal/TrialCountdownBanner.tsx`

**Changes:**
- Pass subscription as a prop from parent instead of calling `useSubscription` again
- Or use React Query's cache to share subscription data

### Step 6: Fix forwardRef Warnings
**File:** `src/components/home/EventSection.tsx`

**Changes:**
- Wrap `EventCard` with `React.forwardRef` to properly handle refs

### Step 7: Optimize PortalLayout
**File:** `src/components/portal/PortalLayout.tsx`

**Changes:**
- Memoize the sidebar menu items
- Pass subscription to child components instead of letting them fetch independently
- Add loading boundary for children

---

## Technical Details

### Sidebar Fix Implementation

```text
// In src/hooks/use-mobile.tsx
// Ensure hook returns false instead of undefined initially
// Add mounted state to prevent hydration mismatch

// In src/components/ui/sidebar.tsx
// Add early return if isMobile is undefined
// Prevent rendering both Sheet and fixed sidebar
```

### Performance Optimization Pattern

```text
// Use React Query for all API calls to leverage caching
// Share subscription data via context or prop drilling
// Add proper staleTime and cacheTime values
// Use visibility API to pause polling when tab is hidden
```

### Polling Optimization

```text
// Current: 60 second polling
// New: 5 minute polling + visibility check

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkSubscription();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

## Files to Modify

| Priority | File | Changes |
|----------|------|---------|
| High | `src/hooks/use-mobile.tsx` | Fix initial undefined state |
| High | `src/components/ui/sidebar.tsx` | Handle undefined isMobile state |
| High | `src/hooks/useSubscription.ts` | Add caching, reduce polling, visibility API |
| Medium | `src/pages/portal/PortalDashboard.tsx` | Memoize calculations and arrays |
| Medium | `src/components/portal/ActivityFeed.tsx` | Increase staleTime, reduce polling |
| Medium | `src/components/portal/TrialCountdownBanner.tsx` | Accept subscription as prop |
| Low | `src/components/home/EventSection.tsx` | Add forwardRef to EventCard |

---

## Expected Outcomes

1. **Single sidebar** - Only one sidebar will render at a time
2. **Faster dashboard** - Reduced API calls from ~8 to ~3 on initial load
3. **Smoother experience** - Reduced re-renders and polling frequency
4. **No console warnings** - forwardRef properly implemented

---

## Verification Steps

1. Navigate to `/portal/referrals` and verify only ONE sidebar appears
2. Check Network tab - verify subscription check only fires once per 5 minutes
3. Check React DevTools - verify no duplicate re-renders
4. Check Console - verify no forwardRef warnings
5. Navigate between portal pages and verify smooth transitions
