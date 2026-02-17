

## Premium PWA Optimization Plan

### Overview
Transform the existing app into a high-end Progressive Web App that feels indistinguishable from a native iOS/Android app. This covers native interaction CSS, safe area fixes, a mobile bottom navigation bar for the portal, skeleton screen components, and PWA manifest/meta tag improvements. Also fixes two existing build errors.

---

### 1. Fix Existing Build Errors

In `src/pages/portal/PortalDashboard.tsx` (line 103) and `src/pages/portal/PortalSlowDating.tsx` (line 257), replace `'explorer'` with `'patron'` (the actual lowest DBTier value). The type `DBTier` is `'patron' | 'fellow' | 'founder'` -- there is no `'explorer'` tier.

---

### 2. PWA Manifest and Meta Tags

**vite.config.ts** -- Update the VitePWA configuration:
- Add `navigateFallbackDenylist: [/^\/~oauth/]` to workbox config (critical for OAuth)
- Add `start_url: "/"` and `scope: "/"` to manifest
- Update `theme_color` to brand forest green `#1a2e1a` for dark mode consistency
- Keep existing icons and display: standalone

**index.html** -- Enhance meta tags:
- Already has `apple-mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style` set to `black-translucent` -- these are correct
- Add `<meta name="mobile-web-app-capable" content="yes">` for Android Chrome
- Ensure `viewport-fit=cover` is present (already there)

---

### 3. Native Interaction CSS

Add to `src/index.css` in the base layer:

- **Remove gray tap highlight**: `-webkit-tap-highlight-color: transparent` on all elements
- **Disable text selection on interactive elements**: `user-select: none` on buttons, nav links, and interactive elements while keeping it enabled on content areas
- **Disable pinch-to-zoom**: `touch-action: pan-x pan-y` on the html element (allows scrolling but prevents pinch zoom)
- **Prevent rubber-band overscroll**: `overscroll-behavior-y: contain` on body
- **Smooth scrolling momentum**: `-webkit-overflow-scrolling: touch` for scroll containers

---

### 4. Safe Area Design Improvements

**src/index.css** -- Add global safe area utilities:
- `.safe-area-top` class applying `padding-top: env(safe-area-inset-top, 0px)`
- `.safe-area-bottom` class applying `padding-bottom: env(safe-area-inset-bottom, 0px)`
- Body gets `padding-bottom: env(safe-area-inset-bottom, 0px)` when in standalone mode via `@media (display-mode: standalone)`

**Header** -- Already applies `paddingTop: env(safe-area-inset-top, 0px)` -- no changes needed.

**Portal Mobile Header** -- Add safe area top padding for standalone PWA mode.

**Bottom Navigation** -- Will include `env(safe-area-inset-bottom)` padding (see next section).

---

### 5. Mobile Bottom Navigation Bar for Portal

Create a new component `src/components/portal/PortalBottomNav.tsx`:

- Fixed to bottom of screen, visible only on mobile (`md:hidden`)
- 5 core tabs: Dashboard, Events, Connections, Dating, Profile
- Active state indicator with primary color
- Includes `env(safe-area-inset-bottom)` padding for iPhone home indicator
- Uses frosted-glass backdrop: `bg-background/90 backdrop-blur-lg`
- Border top separator

Integrate into `src/components/portal/PortalLayout.tsx`:
- Add `<PortalBottomNav />` at the bottom of the portal layout
- Add bottom padding to the main content area on mobile to prevent content being hidden behind the nav bar (`pb-20 md:pb-0`)

---

### 6. Skeleton Screen Components

Create `src/components/ui/content-skeleton.tsx` with reusable skeleton patterns:

- **CardSkeleton**: Mimics a card with image placeholder, title bar, and text lines
- **ListSkeleton**: Multiple row items with avatar circle + text lines
- **ProfileSkeleton**: Avatar + name + bio layout
- **EventCardSkeleton**: Image header + event details skeleton
- **DashboardSkeleton**: Stats cards row + content area

All use the existing `Skeleton` component from `src/components/ui/skeleton.tsx` which already has `animate-pulse` styling. These are composition patterns for common layouts.

---

### 7. Standalone PWA Detection Hook

Create `src/hooks/useStandalonePWA.ts`:
- Detects if the app is running in standalone mode (installed PWA)
- Returns `isStandalone` boolean
- Used to conditionally apply PWA-specific behaviors (e.g., hiding browser-only UI, adjusting padding)

---

### Files Modified
- `src/index.css` -- Native interaction CSS + safe area utilities
- `index.html` -- Additional mobile meta tag
- `vite.config.ts` -- PWA workbox denylist for OAuth
- `src/pages/portal/PortalDashboard.tsx` -- Fix build error (explorer -> patron)
- `src/pages/portal/PortalSlowDating.tsx` -- Fix build error (explorer -> patron)
- `src/components/portal/PortalLayout.tsx` -- Integrate bottom nav + safe area + bottom padding

### Files Created
- `src/components/portal/PortalBottomNav.tsx` -- Mobile bottom navigation
- `src/components/ui/content-skeleton.tsx` -- Skeleton screen patterns
- `src/hooks/useStandalonePWA.ts` -- PWA detection hook

