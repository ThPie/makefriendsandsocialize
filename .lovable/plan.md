

# Global Layout, Alignment & Color Token Consistency — Full Project Sweep

## Scope

Every page, section, and component across the entire project: public site, portal, admin, auth, onboarding, and dating intake. This covers ~45+ files with token swaps, container standardization, centered headers, and removal of hardcoded colors.

---

## Changes

### Phase 1 — CSS Foundation

**`src/index.css`**
- Add `.section-label` utility (11px uppercase, Inter 500, gold color) — currently referenced but not defined
- Confirm `.content-container` stays at `max-w-[1200px]` (fits the 1100–1280px range)

---

### Phase 2 — Public Homepage Sections (Token + Container + Centering)

**`src/components/home/SlowDatingSection.tsx`**
- Replace `px-6 md:px-12 lg:px-24` outer padding with `section-spacing` + `content-container`
- Center title block with `section-header` pattern (`max-w-[680px] mx-auto text-center`)
- Replace all 7 `hsl(var(--gold))` → `hsl(var(--accent-gold))`
- Replace `hsl(var(--gold-light))` → `hsl(var(--accent-gold-light))`
- Center the CTA button

**`src/components/home/FAQSection.tsx`**
- Replace `px-6 md:px-12 lg:px-24` with `section-spacing` + `content-container`
- Center title block with `section-header`
- Replace 2 `hsl(var(--gold))` → `hsl(var(--accent-gold))`
- Replace `bg-surface` → `bg-card` (no `bg-surface` in Tailwind config)

**`src/components/home/ContactFormSection.tsx`**
- Replace `px-6 md:px-12 lg:px-24` with `section-spacing` + `content-container`
- Replace 3 `hsl(var(--gold))` → `hsl(var(--accent-gold))`
- Replace `hsl(var(--gold-light))` → `hsl(var(--accent-gold-light))`
- Replace 3 `bg-surface` → `bg-card`

**`src/components/home/PhotoGallerySection.tsx`**
- Line 46: `text-white` → `text-foreground` (section is on `bg-card`, not a dark overlay)

**`src/components/home/ClubShowcaseSection.tsx`**
- Line 148: Remove `dark:bg-[#101e17]` (bg-card already handles dark mode)

---

### Phase 3 — Layout Components

**`src/components/layout/Footer.tsx`**
- Line 47: Remove `dark:bg-[#101e17]` (bg-background already handles dark mode)

**`src/components/portal/PortalBottomNav.tsx`**
- Line 29: Replace `bg-surface` → `bg-card`
- Line 42: Replace `hsl(var(--gold))` → `hsl(var(--accent-gold))`

---

### Phase 4 — Auth & Onboarding

**`src/pages/AuthPage.tsx`**
- Line 960: Replace `from-[#0a110c]/95 via-[#131f16]/90 to-[#0f2915]/85` → `from-background/95 via-background/90 to-background/85`

**`src/components/dating/intake/steps/DeepDiveStep.tsx`**
- Replace all ~9 `bg-[#1a231b]` → `bg-card`
- Replace `border-white/10` on selects → `border-border`
- Replace `focus:bg-white/10` → `focus:bg-muted`

**`src/components/dating/intake/steps/DealbreakersStep.tsx`** (and all other intake step files with `bg-[#1a231b]`)
- Same token swaps as DeepDiveStep

---

### Phase 5 — Portal Page Headers (Center) + Token Cleanup

Center the page-level title + subtitle in each portal page by wrapping in `text-center max-w-[680px] mx-auto mb-8`:

| File | Title to Center |
|---|---|
| `PortalDashboard.tsx` | "Welcome back, {name}" + subtitle |
| `PortalProfile.tsx` | Page title area |
| `PortalEvents.tsx` | "Events" header |
| `PortalPerks.tsx` | Page title |
| `PortalConnections.tsx` | Page title |
| `PortalReferrals.tsx` | "Referrals & Rewards" |
| `PortalBilling.tsx` | "Billing & Subscriptions" |
| `PortalNetwork.tsx` | "The Network" header |

Token cleanup in portal pages — replace all `border-white/[0.08]` → `border-border`, `bg-white/[0.04]` → `bg-card`:
- `PortalBilling.tsx` (4 Card instances + dividers)
- `PortalEvents.tsx` (2 Card instances)
- `PortalConcierge.tsx` (4 Card instances)
- `PortalOnboarding.tsx` (card wrapper + border)
- `PortalSlowDating.tsx` (skeleton wrapper)

---

### Phase 6 — Admin Page Headers (Center) + Token Cleanup

Center the page-level title in each admin page:

| File | Title to Center |
|---|---|
| `AdminDashboard.tsx` | "Hello, Admin" |
| `AdminApplications.tsx` | Page title |
| `AdminMembers.tsx` | Page title |
| `AdminEvents.tsx` | Page title |
| `AdminMatches.tsx` | Page title |
| `AdminAnalytics.tsx` | Page title |
| `AdminSecurityDashboard.tsx` | Page title |
| `AdminSettings.tsx` | Page title |
| All remaining admin pages | Page title area |

Token cleanup across all admin pages:
- Replace all `border-white/[0.08]` → `border-border`
- Replace all `bg-white/[0.04]` → `bg-card`
- Replace `bg-white/[0.06]` → `bg-muted`
- Replace `border-white/[0.06]` → `border-border`
- Replace `border-white/[0.12]` → `border-border`
- Replace `hover:bg-white/[0.04]` → `hover:bg-muted`
- `AdminDashboard.tsx` line 204: Replace `bg-emerald-500/10 text-emerald-400` → `bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]` for Founder tier
- `AdminLayout.tsx` line 134: Replace `bg-white/[0.06]` → `bg-muted`

---

### Phase 7 — Standalone Pages (Container Standardization)

Replace `container max-w-6xl` / `max-w-[1400px]` / `max-w-7xl` with `content-container` in:

| File | Current Pattern |
|---|---|
| `CirclesPage.tsx` | `max-w-[1400px]` |
| `ConnectedCirclePage.tsx` | `container max-w-6xl` (3 instances) |
| `ConnectedCircleDirectoryPage.tsx` | `container max-w-7xl` |
| `ContactPage.tsx` | `max-w-6xl` (2 instances) |
| `SlowDatingLandingPage.tsx` | `max-w-6xl` |
| `AboutPage.tsx` | `container max-w-6xl` (3 instances) |
| `MembershipPage.tsx` | `container max-w-6xl` (2 instances) |
| `LesAmisPage.tsx` | `container max-w-[1400px]` + `max-w-6xl` |
| `TheGentlemenPage.tsx` | `container max-w-[1400px]` (2 instances) |
| `ThePartnersPage.tsx` | `container max-w-[1400px]` (2 instances) |
| `ThePursuitsPage.tsx` | `container max-w-[1400px]` |
| `TheLadiesSocietyPage.tsx` | `max-w-6xl` |

---

## Summary

| Category | Files | Key Changes |
|---|---|---|
| CSS foundation | 1 | Add `.section-label` |
| Public sections | 5 | Container + center + `--gold` → `--accent-gold` |
| Layout components | 2 | Remove hardcoded dark hex, fix `bg-surface` |
| Auth/onboarding/dating | 3+ | Replace hardcoded hex with tokens |
| Portal pages | 8+ | Center headers, replace `white/[0.0x]` → tokens |
| Admin pages | 15+ | Center headers, replace `white/[0.0x]` → tokens |
| Standalone pages | 12 | Container standardization |

Total: ~45 files modified, primarily find-and-replace token swaps + header centering + container class changes.

