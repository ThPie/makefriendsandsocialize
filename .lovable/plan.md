

# Soul Maps — Quiz Hub Page

## Overview
Add a new `/soul-maps` route with a quiz hub page and a fully functional Attachment Style quiz at `/soul-maps/attachment-style`. Includes auth-gated results, database storage, and "Coming Soon" placeholder cards.

## Database Changes

**New table: `soul_maps_results`**
- `id` uuid PK
- `user_id` uuid FK → auth.users (on delete cascade)
- `quiz_slug` text (e.g. "attachment-style")
- `answers` jsonb (stores selected answers)
- `result_type` text (e.g. "secure", "anxious")
- `scores` jsonb (percentage breakdown)
- `created_at` timestamptz
- RLS: users can insert/select their own rows; admins can read all

## New Files

1. **`src/pages/SoulMapsPage.tsx`** — Hub page with hero + quiz grid
   - Hero: bottom-left aligned per existing pattern, "New — Soul Maps" badge, headline/subheadline
   - Responsive grid: 2-col desktop, 1-col mobile
   - Quiz cards using existing `Card` component styling (rounded-2xl, premium feel)
   - Each card: category tag, title, description, time estimate, "Take Quiz" CTA
   - 5 "Coming Soon" cards with locked/greyed state and opacity treatment

2. **`src/pages/SoulMapsQuizPage.tsx`** — Attachment Style quiz page
   - Route: `/soul-maps/attachment-style`
   - Full-page quiz flow (matches existing page patterns better than modal)
   - 7 questions, one at a time with progress bar
   - Tracks answers in local state (secure/anxious/avoidant/disorganized per answer)
   - On final "See My Results": check `useAuth()` for `user`
     - If authenticated → calculate & show results, save to DB
     - If not → show auth gate modal with "Sign Up Free" / "Sign In" buttons
   - Auth redirect: encode answers in `sessionStorage` before redirecting to `/auth?redirect=/soul-maps/attachment-style&showResults=true`; on return, read answers from storage, compute results, save & display
   - Results screen: title, subtitle, description, traits list, growth edge, percentage bars for all 4 styles

3. **`src/components/soul-maps/QuizCard.tsx`** — Reusable quiz card component
4. **`src/components/soul-maps/AuthGateModal.tsx`** — Modal prompting sign-up/sign-in
5. **`src/components/soul-maps/AttachmentResults.tsx`** — Results display component with percentage bars

## Modified Files

1. **`src/routes/config.tsx`** — Add two lazy routes:
   - `/soul-maps` → `<Layout><SoulMapsPage /></Layout>`
   - `/soul-maps/attachment-style` → `<Layout><SoulMapsQuizPage /></Layout>`

2. **`src/components/layout/Header.tsx`** — Add "Soul Maps" to desktop nav links array (line 56, alongside Events/Membership/Blog)

3. **`src/components/layout/MobileMenu.tsx`** — Add `{ label: 'Soul Maps', to: '/soul-maps', icon: Compass }` to `navLinks` array

## Auth Flow for Results

1. User completes quiz → clicks "See My Results"
2. If `user` exists in AuthContext → compute scores, render results, save to `soul_maps_results`
3. If no user → show `AuthGateModal` with headline "Your results are ready"
4. On "Sign Up Free" / "Sign In" click → store answers in `sessionStorage`, navigate to `/auth?redirect=/soul-maps/attachment-style`
5. After auth callback returns user to quiz page → detect stored answers, auto-compute and display results, save to DB
6. No partial/teaser results shown without auth

## Quiz Scoring Logic

- Each of 7 answers maps to one of: secure, anxious, avoidant, disorganized
- Tally counts per style, convert to percentages (count/7 × 100)
- Winning style determines which result profile to display
- All 4 percentages shown as horizontal bars

## Design Approach

- Hero: bottom-left aligned with `flex items-end`, subtle gradient overlay, matching existing hero pattern
- Cards: `rounded-2xl border border-border/60 bg-card` (existing card tokens)
- Category tags: small pill badges with category-specific muted colors
- "Coming Soon" cards: `opacity-60`, no CTA button, "Coming Soon" badge instead
- Lucide icons per category (Heart for Dating, Users for Friendship, Briefcase for Business, Sparkles for Self, Swords for Conflict)
- SEO: Helmet with title "Soul Maps — Know Yourself. Connect Better." and appropriate description

