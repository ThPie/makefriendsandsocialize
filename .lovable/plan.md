

# Fix Hero Video Loading + Default Dark Mode

## Problem 1: Video Loading Flash

The hero section shows the poster image first, then abruptly swaps to the video once it loads. This creates a jarring visual jump. The root cause is that the browser shows the `poster` frame until enough video data has buffered, then starts playback — revealing a different frame with a visible transition.

**Fix**: Hide the video element until it has enough data to play smoothly, then crossfade it in over the poster. This eliminates the jarring swap.

**Changes to `src/components/home/Hero.tsx`**:
- Add a `useState` for `videoReady` (default `false`)
- Add an `onCanPlayThrough` handler on the `<video>` element that sets `videoReady` to `true`
- Add `preload="auto"` to tell the browser to aggressively buffer the video
- Apply `opacity-0` by default and transition to `opacity-100` when `videoReady` is true — creating a smooth crossfade over the poster/dark background
- The poster image is already preloaded in `index.html`, so the dark background + poster shows instantly while the video silently buffers underneath

## Problem 2: Default Theme Should Be Dark

Currently `defaultTheme="system"` — so users on light-mode OS get light theme by default.

**Fix in `src/App.tsx`**:
- Change `defaultTheme="system"` to `defaultTheme="dark"` on the `ThemeProvider`
- Keep `enableSystem` removed so dark is always the default for new visitors
- The theme toggle still works — users can switch to light mode and their preference is saved to `localStorage`

## Files Modified
| File | Change |
|------|--------|
| `src/components/home/Hero.tsx` | Add `videoReady` state, `onCanPlayThrough`, crossfade transition, `preload="auto"` |
| `src/App.tsx` | Change `defaultTheme` from `"system"` to `"dark"`, remove `enableSystem` |

