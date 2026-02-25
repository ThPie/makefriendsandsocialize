

# Fix: Make Layout Full-Width and Responsive on All Screen Sizes

## Problem

The entire app is constrained to a `max-w-[1200px]` centered column. On large monitors, this creates big empty spaces on the left and right — the header/nav, content, and cards all sit in a narrow strip in the middle instead of using the full screen.

This affects three layers:
1. **`.content-container`** in CSS — capped at 1200px, used by the header and all public sections
2. **PortalLayout** — inner content wrapper capped at `max-w-[1200px]`
3. **AdminLayout** — inner content wrapper capped at `max-w-[1200px]`

## Solution

Remove the fixed `max-w-[1200px]` cap everywhere and switch to a fluid layout with comfortable padding. Content will stretch to fill the viewport on any screen size.

## Technical Details

### 1. `src/index.css` — Update `.content-container`

Change from:
```css
.content-container {
  @apply max-w-[1200px] w-full mx-auto px-6 md:px-8 lg:px-10;
}
```
To:
```css
.content-container {
  @apply w-full mx-auto px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24;
}
```

This removes the max-width cap. On large monitors, padding scales up to keep content comfortable but uses the full width. On small screens, padding stays tight.

### 2. `src/components/portal/PortalLayout.tsx`

Line 281: Change `max-w-[1200px] mx-auto` to just remove the max-width constraint, keeping the existing padding from the parent `p-4 md:p-6 lg:p-8`.

### 3. `src/components/admin/AdminLayout.tsx`

Line 240: Same change — remove `max-w-[1200px] mx-auto` so admin content fills the available width.

### 4. Section text readability

For section headers that use `.section-header` (`max-w-[680px] mx-auto text-center`), keep that constraint — headings should still be readable, but the cards/grids/content around them will now fill the screen.

## Files to Modify

| File | Change |
|---|---|
| `src/index.css` | Remove `max-w-[1200px]` from `.content-container`, add scaling padding |
| `src/components/portal/PortalLayout.tsx` | Remove `max-w-[1200px] mx-auto` from content wrapper |
| `src/components/admin/AdminLayout.tsx` | Remove `max-w-[1200px] mx-auto` from content wrapper |

3 files, minimal changes, fixes the entire app.

