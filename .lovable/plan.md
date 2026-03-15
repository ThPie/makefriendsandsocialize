

## Problem Analysis

Two issues reported:

### 1. Light Mode Header Invisible on Inner Pages
**Root cause**: The Header uses `forceWhite={!scrolled}` for the logo and white text colors for nav links when not scrolled. This works on the homepage (dark hero, `pt-0` so header overlaps the hero). But on inner pages like `/membership`, the Layout applies `pt-[68px]` which pushes content below the fixed header. The header sits over white background in light mode, making everything invisible.

However, looking at the membership page, it actually has a full-bleed dark hero (`min-h-[70vh]`). The real fix is twofold:
- Pages with dark hero banners should use `pt-0` so the header overlaps the dark hero (same as homepage)
- When scrolled (header gets frosted background), the logo and text should switch to dark variants in light mode -- this already works via `frosted-nav-light`

**Plan**:
- Modify `Layout.tsx` to remove `pt-[68px]` for pages that have full-bleed hero banners (membership, events, about, contact, circles, FAQ, journal, slow dating, connected circle pages). Since nearly all public pages now have full-bleed heroes with dark overlays, the simplest approach is to **remove the padding for all public pages** (non-portal/admin/auth) and keep `pt-0`.
- Alternatively, just set `pt-0` globally since all pages have dark hero sections now after the recent banner redesign.

### 2. "Broken Links Showing Code"
This likely refers to one of:
- Stale service worker serving old cached content on a new visitor's browser
- A deployment sync issue between Lovable and Vercel/GitHub

I need to check the service worker registration to ensure it handles updates properly, and verify the `RegisterSW` component isn't serving stale content.

## Implementation Steps

1. **Fix Layout padding** -- Change `Layout.tsx` to use `pt-0` for all pages (remove the `isHome` conditional), since all public pages now have full-bleed dark hero banners that the header should overlap.

2. **Fix Header theme-awareness** -- Update `Header.tsx` so when `!scrolled` (transparent header), it checks if we're on the homepage vs inner pages. Since all pages now have dark heroes, keeping `forceWhite={!scrolled}` is correct. The padding fix alone should resolve the visibility issue.

3. **Review service worker** -- Check `RegisterSW.tsx` to ensure it properly handles updates and doesn't serve stale content to new visitors. Add `skipWaiting` and proper update prompts if missing.

## Technical Details

**Layout.tsx change** (line 27):
```tsx
// Before:
<main id="main-content" className={`flex-1 ${isHome ? 'pt-0' : 'pt-[68px]'}`}>

// After:  
<main id="main-content" className="flex-1">
```
This removes the `isHome` variable and the conditional padding entirely. All pages with full-bleed heroes will now have the header overlay them correctly.

**Service worker** -- Will inspect `RegisterSW.tsx` and the Vite PWA config to ensure proper cache invalidation for new visitors.

