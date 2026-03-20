

# Simplify Platform: Keep Slow Dating + Business Directory, Remove Network/Connections/Leads

## Summary

Strip out the Network (member browsing/introductions) and Connections features entirely. Simplify the Business portal by removing the lead generation system — founders just list their business, it appears in a public directory, and members reach out directly. Slow Dating remains the core premium feature.

## Changes

### 1. Remove Network & Connections from Portal Navigation

**Files**: `PortalLayout.tsx`, `MobileDashboardNav.tsx`, `PortalBottomNav.tsx`, `BottomNav.tsx`, `PortalBreadcrumb.tsx`

- Remove "Connections" and "The Network" nav items from all sidebar/bottom nav groups
- Update bottom nav: replace "Network" tab with "Directory" pointing to `/founders-circle/directory`
- Remove breadcrumb entries for `/portal/network` and `/portal/connections`

### 2. Remove Network & Connections Routes

**File**: `src/routes/config.tsx`

- Remove routes for `/portal/network` and `/portal/connections`
- Remove lazy imports for `PortalNetwork` and `PortalConnections`
- Remove admin `/connections` route and lazy import for `AdminConnections`

### 3. Remove Lead System from Business Portal

**File**: `src/pages/portal/PortalBusiness.tsx`

- Remove the "Leads" tab and "Synergy" tab — keep only the "Profile" tab (business listing form)
- Remove all lead-related queries (`business-leads`, `business-lead-stats`, `business-lead-usage`)
- Remove `useLeadRealtime`, `LeadDetailSheet`, `BusinessLeadsSection`, `BusinessSynergySection` imports
- Remove lead state variables (`statusFilter`, `selectedLead`, `leadSheetOpen`, `showAnalytics`)
- Simplify to just: create/edit your business profile → it shows in directory

### 4. Remove Admin Lead Generation Page

**File**: `src/components/admin/AdminLayout.tsx`

- Remove "Lead Generation" from admin sidebar
- Remove admin `/leads` route from `config.tsx`

### 5. Update Dashboard Quick Actions & Discover Section

**Files**: `QuickActions.tsx`, `DiscoverForYou.tsx`

- Replace "Browse Network" with "Business Directory" linking to `/founders-circle/directory`
- Remove any network-related discovery cards

### 6. Make Business Directory Public & Visible

**File**: `src/pages/BusinessDirectoryPage.tsx` (already exists at `/founders-circle/directory`)

- Remove the `canAccessDirectory` tier gate — make it visible to ALL visitors (public page)
- Keep search and filter functionality working for everyone
- The `BusinessProfileDialog` already shows contact info — this becomes the "reach out" mechanism
- Update copy to remove "request introductions" language → "discover member businesses"

### 7. Update Admin Sidebar — Remove Connections

**File**: `src/components/admin/AdminLayout.tsx`

- Remove "Connections" item from the "Engagement & Events" section

### 8. Clean Up Auth Context

**File**: `src/contexts/AuthContext.tsx`

- Keep `canAccessMatchmaking` for Slow Dating — it's still used there
- No changes needed here

### 9. Update Portal Dashboard

**File**: `src/pages/portal/PortalDashboard.tsx`

- Remove any references to connections/network widgets if present

### 10. Remove `useLeadRealtime` Hook

**File**: `src/hooks/useLeadRealtime.ts` — can be deleted (no longer used)

---

## Files to Modify
| File | Action |
|------|--------|
| `src/components/portal/PortalLayout.tsx` | Remove Connections & Network nav items |
| `src/components/portal/MobileDashboardNav.tsx` | Remove Connections & Network nav items |
| `src/components/portal/PortalBottomNav.tsx` | Replace Network with Directory |
| `src/components/layout/BottomNav.tsx` | Replace Network with Directory |
| `src/components/portal/PortalBreadcrumb.tsx` | Remove network/connections entries |
| `src/components/portal/dashboard/QuickActions.tsx` | Replace Browse Network → Business Directory |
| `src/components/portal/dashboard/DiscoverForYou.tsx` | Remove network discovery card |
| `src/routes/config.tsx` | Remove network/connections/leads routes |
| `src/pages/portal/PortalBusiness.tsx` | Remove leads/synergy tabs, keep profile only |
| `src/pages/BusinessDirectoryPage.tsx` | Make public (remove tier gate) |
| `src/components/admin/AdminLayout.tsx` | Remove Connections & Lead Generation sidebar items |
| `src/hooks/useLeadRealtime.ts` | Delete |

## What's Preserved
- **Slow Dating** — untouched, remains the core feature
- **Business Profile creation** — founders can still list their business
- **Business Directory page** — now public so all members (and visitors) can browse and reach out
- **Events, Perks, Referrals, Concierge** — all unchanged
- **Database tables** — no schema changes needed; the `connections` and `business_leads` tables remain but are simply unused by the UI

