

# Hero Buttons + Member Avatars Restoration & Portal Token Consistency

## What You Asked For

1. **Restore the 2 buttons and member avatars** to the hero section (they were removed during the Soho House redesign)
2. **Make portal pages use consistent color tokens** (dashboard, events, profile) — replace all hardcoded hex colors with CSS variable tokens
3. **Responsive container widths** across portal pages

---

## Changes

### 1. `src/components/home/Hero.tsx` — Restore Buttons + Member Avatars

Add back to the hero section (below the subheadline, above the bottom padding):

- **Two buttons side by side:**
  - "Apply for Membership" — gold filled pill button (`bg-[hsl(var(--accent-gold))]`, white text)
  - "Sign In" — ghost text link (white, no border, no button styling)
- **Member avatars row:** Import `useSiteStats` hook and `MemberAvatars` component to display stacked real member avatars + member count ("1,000+ Members · Salt Lake City") in `text-white/60` below the buttons

This restores the social proof and dual CTA that existed before.

### 2. `src/pages/portal/PortalProfile.tsx` — Replace All Hardcoded Colors

Replace every hardcoded hex color with design system tokens:

| Current | Replacement |
|---|---|
| `bg-[#1e2b21]` | `bg-card` |
| `bg-[#253028]` | `bg-muted` |
| `border-white/5` | `border-border` |
| `text-white` | `text-foreground` |
| `text-slate-400` | `text-muted-foreground` |
| `text-slate-200` | `text-foreground` |
| `text-slate-300` | `text-muted-foreground` |
| `text-[#1a5b2a]` (edit links) | `text-[hsl(var(--accent-gold))]` |
| `bg-[#1a5b2a]` (waveform bars, play button) | `bg-[hsl(var(--accent-gold))]` / `text-[hsl(var(--accent-gold))]` |
| `hover:bg-[#253028]` | `hover:bg-muted` |

This makes the profile page fully theme-aware (works in both light and dark mode).

### 3. `src/components/portal/dashboard/DashboardStats.tsx` — Token Cleanup

Replace hardcoded colors:

| Current | Replacement |
|---|---|
| `text-[#d4af37]` | `text-[hsl(var(--accent-gold))]` |
| `bg-[#d4af37]/10` | `bg-[hsl(var(--accent-gold))]/10` |
| `bg-white/[0.04]` | `bg-card` |
| `border-white/[0.08]` | `border-border` |
| `bg-gradient-to-r from-primary to-[#d4af37]` | `bg-[hsl(var(--accent-gold))]` (flat, no gradient) |
| `hover:bg-white/[0.06]` | `hover:border-[hsl(var(--accent-gold))]/40` |
| `text-emerald-500` / `bg-emerald-500/10` | `text-[hsl(var(--accent-gold))]` / `bg-[hsl(var(--accent-gold))]/10` |
| `duration-300` | `duration-200` |
| `hover:-translate-y-1 hover:shadow-lg` | Remove (no scale/shadow transforms per design system) |

### 4. `src/components/portal/EventCard.tsx` — Token Cleanup

Replace hardcoded colors:

| Current | Replacement |
|---|---|
| `bg-[#d4af37]/20` / `text-[#d4af37]` / `border-[#d4af37]/30` | Use `hsl(var(--accent-gold))` variants |
| `premium-card hover-luxury` | Remove these deprecated classes |
| `bg-white/[0.04]` / `border-white/[0.08]` | `bg-card` / `border-border` |
| `duration-500` | `duration-200` |
| `text-amber-600` | `text-[hsl(var(--accent-gold))]` |

### 5. `src/components/portal/PortalLayout.tsx` — Mobile Header Token Fix

- Line 261: Replace `dark:bg-[#131f16]/95` with `bg-background/95` (use token, not hardcoded)

### 6. `src/components/portal/ReferralDashboard.tsx` — Token Cleanup

Replace all `text-[#d4af37]` → `text-[hsl(var(--accent-gold))]` and `bg-[#d4af37]/10` → `bg-[hsl(var(--accent-gold))]/10`, and `bg-white/[0.04]` → `bg-card`, `border-white/[0.08]` → `border-border`.

### 7. `src/pages/portal/PortalConnections.tsx` — Token Cleanup

Replace `text-[#d4af37]`, `bg-[#d4af37]/15`, `border-[#d4af37]/25` with `hsl(var(--accent-gold))` variants.

### 8. `src/pages/portal/PortalPerks.tsx` — Token Cleanup

Replace `text-[#d4af37]`, `border-[#d4af37]/20`, `bg-gradient-to-br from-[#d4af37]/5` with token equivalents. Replace `bg-white/[0.04]` / `border-white/[0.08]` with `bg-card` / `border-border`.

### 9. `src/components/portal/PortalOnboardingLayout.tsx` — Token Cleanup

Replace `bg-[#0a110c]`, `bg-[#131f16]`, `bg-[#0f2915]` gradient with `from-background/90 via-background/85 to-background/80`.

---

## Files to Modify

| File | Scope |
|---|---|
| `src/components/home/Hero.tsx` | Add 2 buttons + member avatars back |
| `src/pages/portal/PortalProfile.tsx` | Full token replacement (15+ color swaps) |
| `src/components/portal/dashboard/DashboardStats.tsx` | Token cleanup + remove prohibited animations |
| `src/components/portal/EventCard.tsx` | Token cleanup + remove deprecated classes |
| `src/components/portal/PortalLayout.tsx` | 1-line mobile header fix |
| `src/components/portal/ReferralDashboard.tsx` | Token cleanup |
| `src/pages/portal/PortalConnections.tsx` | Token cleanup |
| `src/pages/portal/PortalPerks.tsx` | Token cleanup |
| `src/components/portal/PortalOnboardingLayout.tsx` | Token cleanup |

