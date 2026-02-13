

## The Ladies Society Circle -- Implementation Plan

### Overview
Create a premium landing page for "The Ladies Society" circle, matching the structure and quality of The Gentlemen page. Also update The Gentlemen page to include a mission section, membership pricing, and enhanced application form fields (age, occupation). Finally, add The Ladies Society to the Circles directory page.

---

### 1. Database Migration

Add new columns to `circle_applications` to support both The Ladies Society and the enhanced Gentlemen form:

- `age` (integer, nullable) -- applicant's age
- `occupation` (text, nullable) -- applicant's occupation  
- `contribution_statement` (text, nullable) -- "What do you hope to contribute to this circle?"
- `support_meaning` (text, nullable) -- "What does support among women mean to you?"

No new RLS policies needed; existing policies already cover inserts by authenticated users and admin management.

---

### 2. New File: `src/pages/circles/TheLadiesSocietyPage.tsx`

Structure mirrors TheGentlemenPage with these sections:

**Hero Section**
- Background image (reuse an existing elegant asset or a gradient-based hero)
- Title: "The Ladies Society" with primary color accent
- Subtitle: "Where women build women."
- Descriptive paragraph about private membership for growth, support, accountability, and meaningful connection
- CTA button: "Apply Now" scrolling to form

**Mission Section**
- Heading: "Our Mission"
- Content about everyday being women's day, consistent support rather than once a year
- Elegant icon (Crown or gem, per brand guidelines)

**What Members Receive Section**
- 6 benefit cards in a grid:
  - Monthly private gatherings
  - Growth conversations
  - Networking opportunities
  - Wellness evenings
  - Priority access to events
  - Annual appreciation dinner

**Membership Pricing Section**
- Monthly and Annual pricing options displayed as cards
- "Apply Now" CTA
- Note about Member tier and above access; suggestion for Fellows with business listings

**Application Form**
- Fields: Full Name, Email, Age, Occupation, "Why do you want to join?", "What does support among women mean to you?", "What do you hope to contribute?", Membership Tier (Member/Fellow)
- Pre-fills name/email from auth context
- Submits to `circle_applications` with `circle_name: "the-ladies-society"`
- Review note at bottom

---

### 3. Update: `src/pages/circles/TheGentlemenPage.tsx`

Align with the same enhanced structure:

- **Add Mission Section** after hero: Explain the purpose of The Gentlemen -- a space for men to connect through timeless style and presence
- **Add Age and Occupation fields** to the application form
- **Add "What do you hope to contribute?"** textarea field
- Keep existing style preference and dress code commitment fields

---

### 4. Update: `src/pages/CirclesPage.tsx`

Add The Ladies Society to the circles array:
```text
{
  title: "The Ladies Society",
  description: "A private circle for women who value growth, support, and meaningful connection.",
  icon: Crown (or gem icon),
  tags: ["Women Only", "Selective", "Monthly / Curated"],
  path: "/circles/the-ladies-society",
  isFree: false,
}
```

Update the grid from `md:grid-cols-2` to `md:grid-cols-3` to accommodate three circles.

---

### 5. Update: `src/App.tsx`

Add route and lazy import:
```text
const TheLadiesSocietyPage = lazy(() => import("@/pages/circles/TheLadiesSocietyPage"));

<Route path="/circles/the-ladies-society" element={<TheLadiesSocietyPage />} />
```

---

### 6. Fix Existing Build Error

Remove the unused `@ts-expect-error` directive in `src/components/dating/intake/IntakeProgress.test.tsx` line 6.

---

### Design Notes

- The Ladies Society page uses the same design system (fonts, colors, card styles, animations) as The Gentlemen
- Tone is elegant, empowering, and structured -- no casual language
- Icons use Crown or gem variants (no sparkles/lightbulb per brand guidelines)
- Both circle pages will share a consistent section flow: Hero, Mission, Benefits/Expectations, Pricing (if applicable), Application Form

