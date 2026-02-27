

## Plan: Fix Slow Dating Application Layout & Header Avatar

### 1. Center form content and remove empty right space
**File: `src/components/dating/intake/IntakeWizard.tsx`**
- Change the form content container from left-aligned (`max-w-2xl` without centering) to centered (`max-w-3xl mx-auto`)
- This fills the right-side void and creates a balanced layout
- Increase inner content max-width slightly so fields don't feel cramped

### 2. Remove duplicate logo in sidebar
**File: `src/components/dating/intake/IntakeProgress.tsx`**
- Remove the `<BrandLogo>` component from the desktop sidebar (lines 51-53) — the main site header already shows the logo, so showing it again in the sidebar is redundant
- Remove the `BrandLogo` import

### 3. Add description text under step title "The Basics"
**File: `src/components/dating/intake/IntakeWizard.tsx`**
- Below the `<h2>` step title in the desktop step header, add a dynamic subtitle/description per step
- For "The Basics": *"Please provide as much detail as possible — the more we know about you, the better we can match you with someone truly compatible."*
- Add a `description` field to `INTAKE_STEPS` in `intakeSchemas.ts` so each step can have its own contextual subtitle

**File: `src/components/dating/intake/intakeSchemas.ts`**
- Add a `description` string to each step in the `INTAKE_STEPS` array with contextually relevant guidance text

### 4. Fix header avatar to show profile photo
**File: `src/components/layout/Header.tsx`**
- The code already uses `profile?.avatar_urls?.[0]` — the issue is the logged-in user has no photo in their profile's `avatar_urls` array
- Add a fallback chain: try `avatar_urls[0]`, then check `user.user_metadata?.avatar_url` (set by Google OAuth or signup), then fall back to initials
- Update the `AvatarImage` src to: `profile?.avatar_urls?.[0] || user?.user_metadata?.avatar_url`

### Files to modify:
- `src/components/dating/intake/IntakeWizard.tsx` — center content, add step description
- `src/components/dating/intake/IntakeProgress.tsx` — remove duplicate logo
- `src/components/dating/intake/intakeSchemas.ts` — add step descriptions
- `src/components/layout/Header.tsx` — avatar fallback chain

