---
description: MakeFriends & Socialize design system reference — fonts, colors, spacing, component patterns for all pages
---

# Design System Reference

All pages must follow these patterns extracted from the homepage. Source files:
- `src/index.css` — CSS tokens & utilities
- `tailwind.config.ts` — Font families, colors, animations

## Typography

| Role | Font | Weight | Class |
|------|------|--------|-------|
| Display / H1-H3 | Cormorant Garamond | 400 | `font-display` |
| Body / UI | Inter | 400 | default |
| Mono accents | IBM Plex Mono | — | `font-mono-accent` |
| UI headings H4-H6 | Inter | 300 | auto |

**Italic emphasis pattern**: Use `<em>` on 1-2 key words in every section heading (e.g., *Circles*, *Stand For*).

## Colors — Always Use Theme Tokens

| Token | Usage |
|-------|-------|
| `bg-background` / `text-foreground` | Page bg / primary text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `text-muted-foreground` | Secondary text |
| `hsl(var(--accent-gold))` | Gold accent (eyebrows, CTAs, focus rings) |
| `bg-primary` / `text-primary` | Forest green accent |
| `border-border` | Borders |

**Never** hardcode `bg-white/[0.04]`, `text-white`, or `border-white/[0.08]`. Use semantic tokens.

## Section Header Pattern (3-part)

```html
<p class="section-label">EYEBROW LABEL</p>
<h2 class="font-display text-4xl md:text-5xl text-foreground">
  Title <em>with Emphasis</em>
</h2>
<p class="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
  Description text.
</p>
```

## Key Utility Classes

| Class | Purpose |
|-------|---------|
| `section-label` | Gold uppercase 11px tracked eyebrow |
| `eyebrow` | Muted uppercase 11px tracked label |
| `section-spacing` | `py-24 md:py-32` |
| `section-spacing-sm` | `py-16 md:py-20` |
| `content-container` | Full-width fluid container with responsive padding |
| `section-header` | Centered header block `max-w-[680px]` |
| `premium-card` | `bg-card border border-border rounded-2xl` with transitions |
| `gold-fill` | Gold background button |
| `hover-lift` | Subtle `-translate-y-0.5` on hover |
| `scroll-animate` + `.visible` | Scroll-triggered fade-in |
| `surface-warm` | Warm neutral background section |

## Buttons

- Primary CTA: `rounded-full px-8 min-h-[52px] text-base font-medium`
- Outline: `rounded-full px-8 min-h-[52px] border-border/50`
- Always pill-shaped (`rounded-full`)

## Cards

- Always `rounded-2xl` with `border border-border/50`
- Use `hover-lift` or `hover-luxury` for hover effects
- Use `shadow-elegant` in light mode only

## Rules for New Pages

1. Always use theme tokens — never hardcode colors
2. Section headers follow the 3-part eyebrow → heading → subtitle pattern
3. Headings use `font-display` with italic emphasis on key words
4. Buttons are `rounded-full` (pill-shaped)
5. Cards use `rounded-2xl` with `border-border/50`
6. Spacing uses `section-spacing` or `section-spacing-sm`
7. Animations use `scroll-animate` + `visible` or framer-motion
