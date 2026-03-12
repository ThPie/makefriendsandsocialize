

## Plan: Add "The Exchange" Circle + Host Application Page + Fix Build Errors

### 1. Fix Build Errors (NodeJS.Timeout)

Replace all `NodeJS.Timeout` references with `ReturnType<typeof setTimeout>` across:
- `src/components/ui/city-autocomplete.tsx` (line 45)
- `src/hooks/useInactivityLogout.ts` (lines 26-28)
- `src/pages/AuthPage.tsx` (line 162)
- `src/pages/ResetPasswordPage.tsx` (line 44)
- `src/test/setup.ts` — replace `global` with `globalThis`

### 2. Create "The Exchange" Circle Page

New file: `src/pages/circles/TheExchangePage.tsx`
- Uses existing `CirclePageTemplate` with config:
  - `circleTag`: `"the-exchange"`
  - Hero image: Unsplash stock (workshop/community learning theme)
  - Title: "The Exchange"
  - Tagline: "Learn. Teach. Share."
  - Features: Skill Workshops, Teach What You Know, Community Learning, Cross-Industry Exchange
  - Open to all members (not selective)

### 3. Add to Circles Grid

Update `src/pages/CirclesPage.tsx`:
- Add "The Exchange" card to the circles array with tags like "Skills", "Workshops", "Open to All" and `isFree: true`

### 4. Add Route

Update `src/routes/config.tsx`:
- Lazy import `TheExchangePage`
- Add route: `/circles/the-exchange`

### 5. Add to Navigation

Update `src/components/layout/MobileMenu.tsx` and `src/components/layout/CirclesMegamenu.tsx`:
- Add "The Exchange" to circle navigation items

### 6. Create "Host a Workshop" Application Page

New file: `src/pages/HostApplicationPage.tsx`
- Standalone page with form fields: name, email, skill/topic, experience level, description of what they'd teach, preferred format (workshop/class/demo), availability
- Submit to a new `host_applications` database table
- Route: `/host` or `/become-a-host`

### 7. Database Migration

Create `host_applications` table:
```sql
CREATE TABLE public.host_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  skill_topic text NOT NULL,
  experience_description text,
  teaching_format text,
  availability text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can submit
CREATE POLICY "Users can submit host applications"
  ON public.host_applications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can view their own
CREATE POLICY "Users can view own host applications"
  ON public.host_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage all host applications"
  ON public.host_applications FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anonymous submissions too
CREATE POLICY "Anyone can submit host application"
  ON public.host_applications FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
```

### 8. Add "Become a Host" Section on Homepage

New component: `src/components/home/BecomeAHostSection.tsx`
- Placed after EventSection in `HomePage.tsx` (order-3.5 on desktop)
- CTA-focused section: "Share Your Skills" with brief description and link to `/become-a-host`
- Matches existing design language

### 9. Add to Footer

Update `src/components/layout/Footer.tsx`:
- Add "Become a Host" link under the COMMUNITY section

### Summary of Files

| Action | File |
|--------|------|
| Create | `src/pages/circles/TheExchangePage.tsx` |
| Create | `src/pages/HostApplicationPage.tsx` |
| Create | `src/components/home/BecomeAHostSection.tsx` |
| Edit | `src/routes/config.tsx` (route + lazy import) |
| Edit | `src/pages/CirclesPage.tsx` (add to grid) |
| Edit | `src/pages/HomePage.tsx` (add host section after events) |
| Edit | `src/components/layout/Footer.tsx` (add link) |
| Edit | `src/components/layout/MobileMenu.tsx` (add to nav) |
| Edit | `src/components/layout/CirclesMegamenu.tsx` (add to nav) |
| Edit | `src/components/home/ClubShowcaseSection.tsx` (add card) |
| Fix | `src/components/ui/city-autocomplete.tsx` (NodeJS type) |
| Fix | `src/hooks/useInactivityLogout.ts` (NodeJS type) |
| Fix | `src/pages/AuthPage.tsx` (NodeJS type) |
| Fix | `src/pages/ResetPasswordPage.tsx` (NodeJS type) |
| Fix | `src/test/setup.ts` (global → globalThis) |
| Migration | Create `host_applications` table |

