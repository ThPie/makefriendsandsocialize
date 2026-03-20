

# Obfuscate Admin & Sensitive Route Paths

## What's Changing

Replace all predictable route paths (`/admin`, `/auth/waiting`, `/health`) with non-obvious alternatives that don't reveal their purpose to attackers scanning URLs.

| Current Path | New Path | Why |
|---|---|---|
| `/admin` | `/cx` | Generic, meaningless prefix |
| `/admin/*` | `/cx/*` | All admin sub-routes |
| `/health` | `/sys/status` | Less discoverable |

> **Note:** The `/portal` and `/auth` paths are fine — they serve authenticated users and are expected to be discoverable. The security concern is specifically about admin paths that signal "attack surface here."

## Files to Modify

### 1. Route constant file (NEW) — `src/lib/route-paths.ts`
Create a single source of truth for the admin base path so it's easy to change in the future:
```ts
export const ADMIN_BASE = '/cx';
```

### 2. `src/routes/config.tsx`
Replace all `/admin` path prefixes with the constant.

### 3. `src/components/admin/AdminLayout.tsx`
Update all `menuItems` URLs and `SENSITIVE_ROUTES` array to use the new base.

### 4. `src/lib/auth-redirect.ts`
Change the `'/admin'` redirect destination type and return value.

### 5. `src/components/auth/ProtectedRoute.tsx`
Update the admin fallback redirect from `/portal` (already correct, no `/admin` reference to change).

### 6. `src/components/portal/PortalLayout.tsx`
Update the admin link from `/admin` to the new path.

### 7. `src/pages/AuthWaitingPage.tsx`
Update `navigate('/admin')` call.

### 8. `src/pages/admin/*.tsx` (6 files)
Update internal navigation links in `AdminDashboard`, `AdminApplications`, `AdminDating`, `AdminDatingProfile`, `AdminEvents`, `AdminSettings`.

### 9. `src/pages/HealthCheckPage` route
Change from `/health` to `/sys/status` in `routes/config.tsx`.

### 10. `src/components/dating/MatchCard.tsx`
Update admin dating profile navigation.

## Technical Details

- All changes are string replacements of `/admin` → `${ADMIN_BASE}` (or the literal `/cx`)
- No database changes needed — routes are purely frontend
- The `ProtectedRoute` with `requireAdmin` still guards all admin routes server-side via role check
- Old `/admin` URLs will hit the 404 page (no redirect to avoid confirming the path existed)

