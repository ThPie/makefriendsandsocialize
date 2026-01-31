
# Subdomain & Canadian Domain Routing Implementation

## Current Status

| Domain | Status | Issue |
|--------|--------|-------|
| `makefriendsandsocialize.com` | Cloudflare Error 1001 | DNS proxy needs to be disabled in Hostinger |
| `slowdating.makefriendsandsocialize.com` | Working but wrong page | Shows main homepage instead of Slow Dating landing |
| `makefriendsandsocialize.ca` | Working | Shows main homepage correctly |
| `slowdating.makefriendsandsocialize.ca` | Not configured | Domain needs to be added in Lovable settings |

## Root Cause Analysis

The `isSlowDatingSubdomain()` function has a bug. It checks `parts.length >= 3`, but for `.ca` domains:
- `slowdating.makefriendsandsocialize.ca` splits into 3 parts: `['slowdating', 'makefriendsandsocialize', 'ca']`
- `slowdating.makefriendsandsocialize.com` also splits into 3 parts: `['slowdating', 'makefriendsandsocialize', 'com']`

The current logic should work, but the issue is that the code assumes the base domain always has 2 parts (e.g., `domain.com`). For proper TLD detection, we need to handle both `.com` and `.ca` correctly.

---

## Phase 1: Fix DNS Issue (Manual Action Required)

**Problem:** `makefriendsandsocialize.com` shows Cloudflare Error 1001.

**Action in Hostinger DNS:**
1. Find the A record for `@` (root domain)
2. Ensure it points to `185.158.133.1`
3. **Disable the Cloudflare proxy** (change from orange cloud to gray cloud)
4. Wait for propagation (5-15 minutes)

---

## Phase 2: Update Subdomain Detection Logic

### File: `src/lib/subdomain-utils.ts`

Add new functions to properly handle both `.com` and `.ca` domains:

**New Functions to Add:**
```text
getTLD()
  Returns 'ca' or 'com' based on current hostname

isCanadianDomain()
  Returns true if on .ca domain

getBaseDomain()
  Returns 'makefriendsandsocialize.com' or 'makefriendsandsocialize.ca'

getEquivalentCanadianUrl()
  Converts .com URL to .ca equivalent
```

**Update Existing Functions:**
- `getCurrentSubdomain()` - Fix to work with both `.com` and `.ca` TLDs
- `redirectWwwToRoot()` - Support `.ca` www redirects
- `getSubdomainBaseUrl()` - Support `.ca` base domains

---

## Phase 3: Add Geo-Redirect for Canadian Users

### New Hook: `src/hooks/useGeoRedirect.ts`

This hook will:
1. Call the existing `detect-location` edge function
2. Check if user is in Canada AND on `.com` domain
3. Show a non-intrusive banner suggesting the `.ca` site
4. Store user preference in localStorage to avoid repeated prompts

### New Component: `src/components/ui/country-redirect-banner.tsx`

A dismissible banner for Canadian users on `.com`:
```
"It looks like you're in Canada! Visit our Canadian site?"
[Visit makefriendsandsocialize.ca] [Stay here]
```

---

## Phase 4: Update App Routing

### File: `src/App.tsx`

Update the routing logic to handle:
1. **Slow Dating subdomain** (both `.com` and `.ca`)
2. **Canadian domain context** for analytics/SEO

```text
Current: isSlowDatingSubdomain() ? SlowDatingRoutes : MainRoutes

Updated:
- slowdating.*.com -> SlowDatingRoutes
- slowdating.*.ca  -> SlowDatingRoutes
- *.ca            -> MainRoutes (with geo-redirect disabled)
- *.com           -> MainRoutes (with geo-redirect enabled)
```

---

## Phase 5: Update Main Entry Point

### File: `src/main.tsx`

Add `www.makefriendsandsocialize.ca` to `www.makefriendsandsocialize.ca` redirect (currently only handles `.com`).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/subdomain-utils.ts` | Add TLD detection, fix subdomain logic for `.ca` |
| `src/App.tsx` | Add Canadian domain context, fix subdomain routing |
| `src/main.tsx` | Add `.ca` www redirect |

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useGeoRedirect.ts` | Geo-detection with localStorage persistence |
| `src/components/ui/country-redirect-banner.tsx` | Optional redirect banner for Canadians |

---

## Technical Implementation Details

### Updated `getCurrentSubdomain()` Logic

```text
hostname: slowdating.makefriendsandsocialize.com
parts: ['slowdating', 'makefriendsandsocialize', 'com']

Step 1: Detect TLD (.com or .ca)
Step 2: Expected base domain parts = 2 (makefriendsandsocialize + TLD)
Step 3: If parts.length > 2, first part is subdomain
Step 4: Return subdomain if not 'www'
```

### Geo-Redirect Flow

```text
User visits makefriendsandsocialize.com from Canada
          |
          v
detect-location edge function called
          |
          v
Response: { country: "Canada" }
          |
          v
Check localStorage for 'geo-redirect-dismissed'
          |
   +------+------+
   |             |
   v             v
Dismissed?    Show Banner
   |             |
   v             v
No action    User clicks:
             - "Visit .ca" -> redirect
             - "Stay" -> save preference
```

---

## DNS Requirements Summary

Ensure these domains are configured in Lovable Settings AND Hostinger:

| Domain | A Record | Notes |
|--------|----------|-------|
| `makefriendsandsocialize.com` | 185.158.133.1 | Disable Cloudflare proxy |
| `www.makefriendsandsocialize.com` | 185.158.133.1 | |
| `slowdating.makefriendsandsocialize.com` | 185.158.133.1 | |
| `makefriendsandsocialize.ca` | 185.158.133.1 | |
| `www.makefriendsandsocialize.ca` | 185.158.133.1 | |
| `slowdating.makefriendsandsocialize.ca` | 185.158.133.1 | Add if needed |

---

## Expected Behavior After Implementation

| User Scenario | Result |
|---------------|--------|
| Visit `slowdating.makefriendsandsocialize.com` | See Slow Dating landing page |
| Visit `slowdating.makefriendsandsocialize.ca` | See Slow Dating landing page |
| Visit `makefriendsandsocialize.com` from Canada | See main site + optional banner to visit `.ca` |
| Visit `makefriendsandsocialize.ca` | See main site (no banner) |
| Click `/slow-dating` from main site | Navigate to slow dating marketing page |
| Authenticated slow dating user on subdomain | Auto-redirect to `/portal/slow-dating` |
