
## Fix 3 Build Errors

These are targeted, surgical fixes — no structural changes, no new files. The goal is to unblock the build so the app compiles and runs.

---

### Error 1 — `src/pages/AuthPage.tsx` line 732
**Problem:** A `<Link>` JSX element has `class="..."` (HTML attribute) instead of `className="..."` (React/JSX attribute). This was introduced when the auth page mobile layout was edited.

**Fix:** Change `class=` to `className=` on the Forgot Password link.

```tsx
// Before (broken)
<Link to="/auth/forgot-password" class="text-xs text-[#d4af37] ...">

// After (fixed)
<Link to="/auth/forgot-password" className="text-xs text-[#d4af37] ...">
```

---

### Error 2 — `src/pages/admin/AdminApplications.tsx` lines 346, 362, 378
**Problem:** Three `<EmptyState>` usages pass a `heading` prop, but the `EmptyState` component's TypeScript interface (`src/components/ui/empty-state.tsx`) defines the prop as `title`, not `heading`. This was introduced when the admin applications page was edited.

**Fix:** Rename `heading` to `title` on all three `<EmptyState>` usages.

```tsx
// Before (broken) — 3 occurrences
<EmptyState icon={FileText} heading="No Pending Applications" description="..." />
<EmptyState icon={Check} heading="No Approved Applications" description="..." />
<EmptyState icon={X} heading="No Rejected Applications" description="..." />

// After (fixed)
<EmptyState icon={FileText} title="No Pending Applications" description="..." />
<EmptyState icon={Check} title="No Approved Applications" description="..." />
<EmptyState icon={X} title="No Rejected Applications" description="..." />
```

---

### Error 3 — `src/pages/portal/PortalBilling.tsx` line 136
**Problem:** The code reads `subscription.status` and uses it in a ternary (`subscription.status === 'active' ? 'Active' : subscription.status`), but the `SubscriptionStatus` interface in `src/hooks/useSubscription.ts` has no `status` field. The equivalent is the boolean `subscription.subscribed`.

**Fix:** Replace `subscription.status === 'active' ? 'Active' : subscription.status` with a simpler check using the available `subscribed` boolean and `is_trialing` flag:

```tsx
// Before (broken)
{subscription.status === 'active' ? 'Active' : subscription.status}

// After (fixed)
{subscription.is_trialing ? 'Trial' : subscription.subscribed ? 'Active' : 'Inactive'}
```

---

### Files Modified
- `src/pages/AuthPage.tsx` — 1 character fix: `class` → `className`
- `src/pages/admin/AdminApplications.tsx` — 3 prop renames: `heading` → `title`
- `src/pages/portal/PortalBilling.tsx` — Replace `subscription.status` with `subscription.subscribed` logic

---

### Regarding "Write me a full MVP to restart from scratch"
This project already has a very complete codebase — 14 portal pages, 23 admin pages, full auth flow, Stripe billing, slow dating feature, and more. Restarting from scratch would mean deleting all of this work.

Before proceeding with a full restart, it would be helpful to clarify what you mean. Some possibilities:
- **Option A**: Keep the existing code and do a major design/UX overhaul to make it feel more like a polished mobile app
- **Option B**: Identify which features should be in the MVP and strip everything else out, keeping only the essentials
- **Option C**: Truly start over with a blank slate — new design system, new component structure, same database

Once these 3 build errors are fixed, we can discuss the MVP direction. For now, approving this plan will only fix the 3 compile errors.
