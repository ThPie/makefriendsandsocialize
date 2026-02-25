

# Global Layout, Alignment & Color Consistency Pass

## Scope

This is a project-wide sweep across all public pages, portal, admin, auth, and onboarding screens to unify: (1) content container width, (2) centered section titles, (3) color token consistency, and (4) responsiveness.

---

## Technical Details

### 1. Content Container — `src/index.css`

The `.content-container` is already set to `max-w-[1200px]` with `px-6 md:px-8 lg:px-10`. This is close to the user's 1100-1280px request. We will keep `1200px` as it fits the range.

**Problem:** Several pages bypass `content-container` and use their own inline widths:
- `SlowDatingSection.tsx`: `px-6 md:px-12 lg:px-24` + `max-w-[1200px]`
- `ContactFormSection.tsx`: `px-6 md:px-12 lg:px-24` + `max-w-[1200px]`
- `FAQSection.tsx`: `px-6 md:px-12 lg:px-24` + `max-w-[720px]`
- `CirclesPage.tsx`: `max-w-[1400px]`
- Various circle pages: `container max-w-[1400px]`, `max-w-6xl`, `max-w-7xl`
- `ConnectedCircleDirectoryPage.tsx`: `container max-w-7xl`
- `ContactPage.tsx`: `max-w-6xl`

**Fix:** Replace all inline container patterns with `content-container` class usage. For narrow sections like FAQ, wrap in `content-container` then use `max-w-[720px] mx-auto` for the inner text.

Also add a `section-label` utility class (currently referenced but missing from CSS):
```css
.section-label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: hsl(var(--accent-gold));
}
```

### 2. Hero — Full-Bleed Image + Centered Text Column

The hero already uses a full-bleed image. The text content inside uses `content-container` which provides the centered column. No changes needed structurally. The hero pattern is correct.

### 3. Center Section Titles — Public Pages

Several sections already use `section-header` (`max-w-[680px] mx-auto text-center`). The following sections do NOT and need updating:

| File | Current | Fix |
|---|---|---|
| `SlowDatingSection.tsx` | Left-aligned `max-w-lg` | Wrap in `content-container`, use `section-header` for title area, center heading |
| `FAQSection.tsx` | Left-aligned | Wrap in `content-container`, center title block |
| `ContactFormSection.tsx` | Left-aligned (acceptable for split form) | Keep as-is — form layout requires left alignment |
| `TestimonialsSection.tsx` | Left column in split layout | Keep as-is — split layout intentional |

### 4. Color Token Cleanup — Replace All Non-Token Colors

**A. `--gold` references (wrong variable name):**
4 files use `hsl(var(--gold))` which doesn't exist — should be `hsl(var(--accent-gold))`:
- `SlowDatingSection.tsx` (7 instances)
- `FAQSection.tsx` (2 instances)
- `ContactFormSection.tsx` (3 instances)
- `PortalBottomNav.tsx` (1 instance)

**B. Hardcoded hex colors still present:**

| File | Current | Replacement |
|---|---|---|
| `Footer.tsx` L47 | `dark:bg-[#101e17]` | Remove (bg-background already handles dark mode) |
| `AuthPage.tsx` L960 | `from-[#0a110c]/95 via-[#131f16]/90 to-[#0f2915]/85` | `from-background/95 via-[hsl(var(--card))]/90 to-background/85` |
| `ClubShowcaseSection.tsx` L148 | `dark:bg-[#101e17]` | Remove (bg-card already handles it) |
| `DeepDiveStep.tsx` (dating intake) | `bg-[#1a231b]` (6+ select dropdowns) | `bg-card` |
| `AdminDashboard.tsx` | `bg-white/[0.04]`, `border-white/[0.08]`, `bg-emerald-500/10 text-emerald-400` | `bg-card`, `border-border`, `bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]` |
| `AdminLayout.tsx` L134 | `bg-white/[0.06]` | `bg-muted` |

**C. Semantic status colors (keep as-is):**
Admin pages (`AdminMatches.tsx`, etc.) use `text-green-600`, `text-amber-600`, `text-red-600` for status indicators (pending/accepted/declined). These are **semantic status colors** and should remain — they convey meaning (success, warning, error) distinct from brand colors. Same for `text-green-500` "check" icons after copy actions.

**D. `bg-surface` class (doesn't exist in Tailwind config):**
`ContactFormSection.tsx` L61 uses `bg-surface` which isn't defined. Replace with `bg-card`.

### 5. Portal Pages — Center Page Headers

Currently portal page headers are left-aligned. Update the main welcome/title areas:

| File | Change |
|---|---|
| `PortalDashboard.tsx` | Center the "Welcome back" heading + subtitle |
| `PortalProfile.tsx` | Center page title at top |
| `PortalEvents.tsx` | Center page title |
| `PortalPerks.tsx` | Center page title |
| `PortalConnections.tsx` | Center page title |
| `PortalReferrals.tsx` | Center page title |
| `PortalBilling.tsx` | Center page title |
| `PortalNetwork.tsx` | Center page title |

Pattern: Wrap title + subtitle in `text-center max-w-[680px] mx-auto mb-10`.

### 6. Admin Pages — Center Page Headers

Same pattern for admin pages:

| File | Change |
|---|---|
| `AdminDashboard.tsx` | Center "Hello, Admin" heading |
| `AdminApplications.tsx` | Center page title |
| `AdminMembers.tsx` | Center page title |
| `AdminEvents.tsx` | Center page title |
| All other admin pages | Center page title area |

Also fix `AdminDashboard.tsx` hardcoded `bg-white/[0.04]` and `border-white/[0.08]` → `bg-card` and `border-border`.

### 7. `SlowDatingSection.tsx` — Full Refactor

This section uses old patterns (`px-6 md:px-12 lg:px-24`, `section-label`, `hsl(var(--gold))`, left-aligned title). Update to:
- Use `section-spacing` + `content-container`
- Use `section-header` for centered title
- Replace all `--gold` → `--accent-gold`
- Center the CTA button

### 8. `FAQSection.tsx` — Refactor

- Use `section-spacing` + `content-container`
- Center the title block using `section-header`
- Replace `--gold` → `--accent-gold`
- Replace `bg-surface` → `bg-card`

### 9. `ContactFormSection.tsx` — Refactor

- Replace `px-6 md:px-12 lg:px-24` with `section-spacing` + `content-container`
- Replace all `--gold` and `--gold-light` → `--accent-gold` and `--accent-gold-light`
- Replace `bg-surface` → `bg-card`

### 10. `PhotoGallerySection.tsx` — Fix Heading Color

Line 46: `text-white` should be `text-foreground` (it's on a `bg-card` section, not a dark overlay).

### 11. Pages Using `container max-w-*` Instead of `content-container`

Multiple circle/directory pages use Tailwind's `container` class with custom max widths. These should use `content-container` instead for consistency. Files affected:
- `CirclesPage.tsx`
- `ConnectedCirclePage.tsx`
- `ConnectedCircleDirectoryPage.tsx`
- `ContactPage.tsx`
- `SlowDatingLandingPage.tsx`
- `LesAmisPage.tsx`
- `TheGentlemenPage.tsx`
- `ThePursuitsPage.tsx`
- `TheLadiesSocietyPage.tsx`

---

## Files to Modify

| File | Changes |
|---|---|
| `src/index.css` | Add `.section-label` utility class |
| `src/components/home/SlowDatingSection.tsx` | Use content-container, section-header, fix --gold → --accent-gold |
| `src/components/home/FAQSection.tsx` | Use content-container, section-header, fix --gold → --accent-gold, bg-surface → bg-card |
| `src/components/home/ContactFormSection.tsx` | Use content-container, fix --gold → --accent-gold, bg-surface → bg-card |
| `src/components/home/PhotoGallerySection.tsx` | Fix text-white → text-foreground on heading |
| `src/components/home/ClubShowcaseSection.tsx` | Remove dark:bg-[#101e17] |
| `src/components/layout/Footer.tsx` | Remove dark:bg-[#101e17] |
| `src/components/portal/PortalBottomNav.tsx` | Fix --gold → --accent-gold |
| `src/pages/AuthPage.tsx` | Replace hardcoded gradient hex colors with tokens |
| `src/components/dating/intake/steps/DeepDiveStep.tsx` | Replace bg-[#1a231b] → bg-card |
| `src/pages/admin/AdminDashboard.tsx` | Replace bg-white/[0.04] → bg-card, border-white/[0.08] → border-border, center heading, fix emerald → gold |
| `src/components/admin/AdminLayout.tsx` | Replace bg-white/[0.06] → bg-muted |
| `src/pages/portal/PortalDashboard.tsx` | Center page header |
| `src/pages/portal/PortalProfile.tsx` | Center page header |
| `src/pages/portal/PortalEvents.tsx` | Center page header |
| `src/pages/portal/PortalPerks.tsx` | Center page header |
| `src/pages/portal/PortalConnections.tsx` | Center page header |
| `src/pages/portal/PortalReferrals.tsx` | Center page header |
| `src/pages/portal/PortalBilling.tsx` | Center page header |
| `src/pages/portal/PortalNetwork.tsx` | Center page header |
| `src/pages/CirclesPage.tsx` | Replace max-w-[1400px] with content-container |
| `src/pages/ConnectedCirclePage.tsx` | Replace container max-w-6xl with content-container |
| `src/pages/ConnectedCircleDirectoryPage.tsx` | Replace container max-w-7xl with content-container |
| `src/pages/ContactPage.tsx` | Replace max-w-6xl with content-container |
| `src/pages/SlowDatingLandingPage.tsx` | Replace max-w-6xl with content-container |
| `src/pages/circles/LesAmisPage.tsx` | Replace max-w-[1400px] / max-w-6xl with content-container |
| `src/pages/circles/TheGentlemenPage.tsx` | Replace max-w-[1400px] with content-container |
| `src/pages/circles/ThePursuitsPage.tsx` | Replace max-w-[1400px] with content-container |
| `src/pages/circles/TheLadiesSocietyPage.tsx` | Replace max-w-6xl with content-container |

Total: ~30 files, mostly find-and-replace token swaps + centering page headers.

