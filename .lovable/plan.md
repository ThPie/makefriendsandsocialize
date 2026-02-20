
## Three Improvements: Avatar Photos, Desktop Layout Density, and Membership Plan Status

### Overview

This plan addresses three distinct issues across the app:
1. **Avatar** — The header shows a letter fallback instead of the user's profile photo when they are logged in
2. **Desktop layout** — Several homepage sections have content constrained too narrowly, leaving large empty margins that look sparse on wide screens
3. **Membership plan status** — The pricing cards on `/membership` don't reflect the user's actual current tier (no "Current Plan" badge, no grayed-out state, no Upgrade/Downgrade labeling)

---

### Issue 1 — Avatar Shows Letter Instead of Photo

**Current behavior:** The `Header.tsx` already calls `getAvatarUrl()` which reads `profile.avatar_urls[0]`. The `<AvatarImage>` is wired up correctly. However, the screenshot shows only the letter fallback.

**Root cause:** The `profile` from `AuthContext` is populated from the `profiles` table, but the `avatar_urls` column stores an array of storage paths (e.g. `["profiles/uuid/photo.jpg"]`), not full public URLs. The `getAvatarUrl()` function returns the raw path string, which the browser cannot load as an image, so `<AvatarImage>` silently fails and the fallback letter renders.

**Fix:** Modify `getAvatarUrl()` in `Header.tsx` to construct a full Supabase Storage public URL from the raw path:

```typescript
const getAvatarUrl = () => {
  const raw = profile?.avatar_urls?.[0];
  if (!raw) return undefined;
  // If already a full URL (http/https), use as-is
  if (raw.startsWith('http')) return raw;
  // Otherwise construct the public storage URL
  const { data } = supabase.storage.from('profile-photos').getPublicUrl(raw);
  return data.publicUrl;
};
```

**Also increase avatar size** from `h-9 w-9 md:h-10 md:w-10` to `h-11 w-11 md:h-12 md:w-12` for the header avatar link, and keep the border visible with slightly stronger contrast: `border-2 border-primary/50 hover:border-primary`.

The menu panel avatar (h-12 w-12) is already a good size — no change needed there.

---

### Issue 2 — Desktop Layout Density (Homepage Sections)

The screenshots reveal three specific problems:

**A. EthosSection** — Constrained to `max-w-4xl` in a wide viewport, leaving large gutters. The 2×2 grid cards are small and sparse.

**Fix:**
- Expand container from `max-w-4xl` → `max-w-6xl`
- On desktop (md+), switch from `grid-cols-2` to `grid-cols-4` so all four ethos pillars sit in one row — wide, impactful, professional
- Increase card padding: `p-5 md:p-8`
- Increase icon container: `w-12 h-12` with `w-6 h-6` icon
- Increase heading size: `text-xl md:text-2xl`
- Expand description: `text-sm md:text-base`

**B. EventSection** — The section heading and event cards are constrained to the left side of the screen, matching the screenshot showing massive empty space to the right.

**Fix:**
- The section is already `max-w-7xl` which is correct — the issue is the heading uses `max-w-2xl` which clips it on wide screens; change to `max-w-none` for the heading row
- Increase skeleton and card container gaps on desktop: `gap-6 lg:gap-8`
- Ensure event cards render 3 columns on large screens (already done with `lg:grid-cols-3`)

**C. ClubShowcaseSection (Curated Collections)** — Currently a constrained horizontal scroll container (`max-w-4xl`) that looks tiny on a 1920px monitor.

**Fix:**
- Remove the `max-w-4xl` constraint; let it fill `max-w-7xl`
- On desktop (lg+), switch from horizontal scroll to a `grid grid-cols-5` layout so all five clubs show at once in a cinematic film-strip style (each card `min-w-0` not `min-w-[280px]`)
- On mobile, keep the horizontal scroll behavior unchanged

**D. PricingSection (homepage)** — Pricing cards capped at `max-w-6xl` which is fine, but the section header text is limited to `max-w-2xl`, feeling narrow on wide screens.

**Fix:** Change pricing header `max-w-2xl` → `max-w-3xl` for the description paragraph.

**E. SlowDatingSection** — Section is already full `max-w-7xl` — looks OK. No change needed.

**F. TestimonialsSection** — Already `max-w-7xl` and 3-column grid — fine. No change needed.

---

### Issue 3 — Membership Plan Current Tier Status (MembershipPage)

**Current behavior:** `isCurrentTier()` already correctly maps DB tier to UI tier name. However:
- No visual indicator is shown when `isCurrent === true`
- The CTA buttons always show fixed text ("Get Started", "Start Free Trial", "Join Waitlist") regardless of the user's current plan
- The current plan card is not visually differentiated

**Fix in `MembershipPage.tsx`:**

**3a. Current plan badge:** When `isCurrent === true`, add a green "Your Current Plan" badge at the top of the card (similar to the "Most Popular" badge):

```tsx
{isCurrent && (
  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
    <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
      Your Current Plan
    </Badge>
  </div>
)}
```

**3b. Grayed-out styling for current plan:** When `isCurrent`, reduce card opacity and add a subtle ring:
```tsx
isCurrent ? 'ring-2 ring-primary/40 opacity-75' : ''
```

**3c. Smart CTA button labels:** Replace the hardcoded button logic with a tier-rank comparison:

```
Tier order: socialite (0) < insider (1) < patron (2)
```

- If `isCurrent` → button shows "Your Plan" (disabled, muted style)
- If target tier rank > current tier rank → "Upgrade to [Tier]"
- If target tier rank < current tier rank → "Downgrade to [Tier]"
- If not logged in → existing labels ("Get Started", "Start Free Trial")

**3d. Disabled state for current plan:** The "Your Plan" button should be visually disabled and not clickable.

**Also apply the same treatment to the homepage `PricingSection.tsx`** — it also has `isCurrentTier()` but never uses it to change the UI. The fix is identical: add a "Current Plan" badge and disable the CTA button.

---

### Files to Modify

| File | Change |
|---|---|
| `src/components/layout/Header.tsx` | Fix `getAvatarUrl()` to generate full public URL; increase avatar size |
| `src/components/home/EthosSection.tsx` | Expand to `max-w-6xl`, 4-col on desktop, larger cards |
| `src/components/home/EventSection.tsx` | Remove heading `max-w-2xl` constraint |
| `src/components/home/ClubShowcaseSection.tsx` | Grid layout on desktop, remove `max-w-4xl` cap |
| `src/components/home/PricingSection.tsx` | Add current-plan badge, smart CTA labels |
| `src/pages/MembershipPage.tsx` | Add "Your Current Plan" badge, disabled state, Upgrade/Downgrade labels |

### Technical Notes

- The `useSubscription` hook already returns `subscription.tier` as the DB tier (`patron` | `fellow` | `founder`). The `isCurrentTier()` function in `MembershipPage.tsx` already maps this correctly. We just need to use the result to control the UI.
- `supabase.storage.from('profile-photos').getPublicUrl(path)` is synchronous and returns `{ data: { publicUrl } }` — no async needed.
- The storage bucket name needs to match what is actually used for profile photo uploads. Based on the `PortalProfile.tsx` code which references `avatar_urls`, the bucket is likely `profile-photos` or similar — this will be verified at implementation time.
- All homepage layout fixes are pure CSS/Tailwind changes — no data or logic changes.
