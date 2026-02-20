
## Fix Build Errors + Dating Application QA Issues

### Part 0 — Build Errors (Must Fix First)

Two files use `TransitionLink` without importing it:

**`src/pages/ConnectedCircleDirectoryPage.tsx`** — Uses `TransitionLink` at lines 167, 170, 311, 385 but only imports `Link` from react-router-dom.

**`src/pages/portal/PortalBusiness.tsx`** — Uses `TransitionLink` at lines 252, 307, 313 but only imports `Link`.

Fix: Add `import { TransitionLink } from '@/components/ui/TransitionLink';` to both files.

---

### Part 1 — BUG 1 & 2: Blank Page + Infinite Spinner

**Root cause:** `DatingIntakePage.tsx` uses `useAuth()` which follows the "separate initial load" pattern — `isLoading` starts `true` and goes `false` once auth resolves. However the current auth context sets `isLoading = false` inside `onAuthStateChange`, which can cause a deadlock on direct URL access or navigation from unauthenticated contexts (as described in the stack overflow pattern).

**Current code in `DatingIntakePage.tsx`:**
```tsx
if (isLoading) {
  return <div>...<Loader2 /></div>; // Spins forever on Bug 2
}
if (!user) {
  return <Navigate to="/auth" replace />; // Never reached on Bug 1
}
```

**Fix — Add loading timeout to `DatingIntakePage.tsx`:**

Add a local `loadingTimedOut` state with an 8-second timeout. If `isLoading` is still true after 8 seconds, show a friendly error with a "Try Again" button that reloads the page. This addresses Bug 2 (infinite spinner) with a fallback.

```tsx
const [loadingTimedOut, setLoadingTimedOut] = useState(false);

useEffect(() => {
  if (!isLoading) return;
  const timer = setTimeout(() => setLoadingTimedOut(true), 8000);
  return () => clearTimeout(timer);
}, [isLoading]);

if (isLoading && !loadingTimedOut) {
  return <LoadingUI />;
}

if (loadingTimedOut || !user) {
  // Instead of hanging, redirect to auth
  return <Navigate to="/auth" replace />;
}
```

**Fix — Auth context pattern (the real root cause):**

The `AuthContext.tsx` uses `onAuthStateChange` to set both user state AND `isLoading = false`. On hard refresh, Supabase needs to restore the session via `getSession()` before `onAuthStateChange` fires. The fix is to call `supabase.auth.getSession()` explicitly on mount to guarantee `isLoading` resolves:

In `AuthContext.tsx`, add an `initializeAuth` function that:
1. Calls `supabase.auth.getSession()` to get the initial session
2. If session exists, calls `fetchUserData()`
3. Sets `isLoading(false)` in its `finally` block — guaranteed even on hard refresh

The `onAuthStateChange` listener stays for subsequent changes (login, logout) but does NOT control `isLoading`. This matches the `auth-state-loading-patterns.yaml` pattern from the stack overflow context.

---

### Part 2 — BUG 3: No Inline Error When Photo Missing

**Current behavior:** In `useIntakeForm.ts` `goToStep()`, when validation fails it calls `toast()` but also sets `fieldErrors`. The `BasicsStep.tsx` already reads `fieldErrors` and shows red borders/messages for most fields. However, the photo section at line 169-175 only shows the error text — it does NOT scroll to it.

**Fix in `useIntakeForm.ts`:** After setting `fieldErrors`, emit a custom DOM event or use a `ref` callback to scroll to the first errored field. Alternatively, add a `firstErrorField` to the returned state, then in `IntakeWizard.tsx`, after `nextStep()` fails, scroll to the first error.

**Simpler approach:** In `IntakeWizard.tsx`'s `handleNext`, after calling `nextStep()`, check if `form.validationErrors.length > 0` — if so, find the first element with class `border-red-500` using `document.querySelector` and scroll to it:

```tsx
const handleNext = useCallback(() => {
  nextStep();
  setTimeout(() => {
    const firstError = document.querySelector('[class*="border-red-500"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 100);
}, [nextStep]);
```

The photo area already has `border-red-500` on error — this will scroll directly to the missing photo.

---

### Part 3 — BUG 4: Step Nav Breadcrumb Resets Validation

**Root cause:** In `useIntakeForm.ts` `goToStep()` at line 263-284, when going **backward** (targetStep < step), the code skips validation (`if (targetStep > step)` guard) but still clears `validationErrors` and `fieldErrors` at lines 281-283. This wipes out the "completed" state of the current step, meaning if someone is on step 3 and clicks step 1 breadcrumb, coming back forward re-requires all step 1 validation again.

**Fix:** Track a `completedSteps` set (Set of step numbers) in `useIntakeForm`. When a step passes validation and the user advances, add it to `completedSteps`. When going backward via breadcrumb, don't clear errors for already-completed steps. Only clear `fieldErrors` when entering a step fresh in the forward direction.

**Implementation:**
```typescript
const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

// In goToStep:
if (targetStep > step) {
  const validation = validateStep(step, formData);
  if (!validation.success) { /* show errors */ return; }
  // Mark current step as completed
  setCompletedSteps(prev => new Set([...prev, step]));
}

setValidationErrors([]);
setFieldErrors({});
setStep(targetStep);
```

Add `completedSteps` to the returned context so `IntakeProgress` can show completed steps with a checkmark.

---

### Part 4 — Step 1 Improvements

**4a. "I identify as" → "Gender Identity"**

In `BasicsStep.tsx` line 214: change `"I identify as"` label to `"Gender Identity"`.

**4b. Bio character counter**

In `BasicsStep.tsx`, add a character counter below the Bio textarea:
```tsx
<p className="text-xs mt-1 text-right text-white/40">
  {formData.bio?.length || 0} characters
</p>
```

**4c. "Interested in meeting" — allow multi-select**

Currently a single-select `<Select>`. Change to chip-style toggles (similar to core values selector in DeepDiveStep) so users can select "Men", "Women", "Non-binary", "Everyone". Since `target_gender` is a string field in the DB, store multi-values joined: `"Men, Women"`. Update `intakeSchemas.ts` to not require a single value.

**4d. Age Preference slider — add note**

In `BasicsStep.tsx` line 288, add below the `<Label>`:
```tsx
<p className="text-xs text-white/40">We'll try to match within this range</p>
```

**4e. Location edit button**

In `BasicsStep.tsx` around line 316-340 (the location section), add an "Edit location" button that, when clicked, shows an editable `<Input>` for the location string. This lets users override their auto-detected city.

**4f. Social verification tooltip**

In `BasicsStep.tsx`, find the "Social Verification (Private)" section header and add a `<Tooltip>` explaining these are only visible to the matchmaker.

---

### Part 5 — Step 2 (Life & Family) Improvements

**5a. "Prefer not to say" options**

In `FamilyStep.tsx`, the `been_married` and `has_children` radio groups currently only have Yes/No. Add a third option:
```tsx
<div className="flex items-center space-x-3 bg-white/5 ...">
  <RadioGroupItem value="prefer_not" id="married-prefer-not" />
  <Label ...>Prefer not to say</Label>
</div>
```
Since these are `boolean` fields in the form, change them to `string` (`"yes" | "no" | "prefer_not"`) in the local display but keep the DB mapping: `been_married: value === "yes"`.

**5b. Conditional "When do you want children?"**

The marriage_timeline question already has `{isSeekingSerious && ...}` wrapping. The "wants children" timeline (when they want them) should be hidden when `formData.wants_children === 'no'`. This is already partially handled by the adaptive options — but ensure no follow-up question about timing appears if they select "No".

**5c. Fix dropdown defaults**

In `FamilyStep.tsx`:
- `family_relationship` Select: Remove any pre-selected value — the `<SelectValue placeholder="Select your relationship" />` is already there and `formData.family_relationship` starts as `''`, so no value is pre-selected. The issue reported may be from an old form. Confirm placeholder shows correctly.
- `family_involvement_expectation` Select: Same — already uses `placeholder="Select your expectation"`.

**5d. New question: "Open to dating someone with children?"**

Add after the children section:
```tsx
<div className="space-y-3">
  <Label>Are you open to dating someone who already has children?</Label>
  <Select value={formData.open_to_partner_children} onValueChange={...}>
    <SelectItem value="yes">Yes, absolutely</SelectItem>
    <SelectItem value="depends">Depends on the situation</SelectItem>
    <SelectItem value="no">Prefer not</SelectItem>
  </Select>
</div>
```
This field needs to be added to `intakeSchemas.ts` as optional and to `initialFormData` in `useIntakeForm.ts`.

---

### Part 6 — Step 3 (Lifestyle/Habits) Improvements

**6a. Replace drug use textarea with structured dropdown**

In `HabitsStep.tsx`, replace the `<Textarea>` for `drug_use` with a `<Select>`:
```tsx
<Select value={formData.drug_use} onValueChange={(v) => updateField("drug_use", v)}>
  <SelectItem value="never">Never</SelectItem>
  <SelectItem value="occasionally">Occasionally</SelectItem>
  <SelectItem value="regularly">Regularly</SelectItem>
  <SelectItem value="prefer_not">Prefer not to say</SelectItem>
</Select>
```

**6b. Add "Substance Use" section header**

Group smoking, drinking, and drug questions under a `<div>` with a `<Label className="text-[#D4AF37] text-xs uppercase tracking-widest">Substance Use</Label>` header and a light divider.

**6c. Diet preference explanation note**

Below the diet `<Select>` in `HabitsStep.tsx`, add:
```tsx
<p className="text-xs text-white/40">Helps us plan curated dinners and suggest compatible lifestyle matches.</p>
```

---

### Part 7 — Review Step (Step 8) Improvements

**7a. Full collapsible accordion by step**

Replace the current flat summary in `ReviewStep.tsx` with a full `<Accordion>` (using the existing Radix UI accordion component from `@/components/ui/accordion`). Each accordion item = one step:

- Step 1 — The Basics: photo, name, age, gender, location, bio, social links
- Step 2 — Life & Family: marriage, children, family
- Step 3 — Lifestyle: smoking, drinking, drugs, exercise, diet, screen time
- Step 4 — Daily Life: tuesday night test, financial philosophy, etc.
- Step 5 — Deep Dive: core values, love language, attachment style, etc.
- Step 6 — Dealbreakers: dealbreakers text, politics, religion, etc.
- Step 7 — Notifications: phone, notification preferences

Each accordion item header shows the step name + a "✓ Completed" or "⚠ Incomplete" badge.

**7b. Review timeline note**

Below the accordion, add:
```tsx
<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/70">
  <strong className="text-[#D4AF37]">What happens next?</strong> Your profile will be reviewed by our team within 24–48 hours after submission.
</div>
```

---

### Files Modified

| File | Changes |
|---|---|
| `src/pages/ConnectedCircleDirectoryPage.tsx` | Add TransitionLink import (build fix) |
| `src/pages/portal/PortalBusiness.tsx` | Add TransitionLink import (build fix) |
| `src/contexts/AuthContext.tsx` | Add `initializeAuth` with `getSession()` to fix blank page / infinite spinner (Bugs 1 & 2) |
| `src/pages/DatingIntakePage.tsx` | Add 8-second loading timeout with Try Again fallback (Bug 2) |
| `src/components/dating/intake/IntakeWizard.tsx` | Scroll-to-first-error after failed Next Step (Bug 3) |
| `src/components/dating/intake/useIntakeForm.ts` | Add `completedSteps` tracking; add `open_to_partner_children` to initialFormData (Bug 4 + Step 2) |
| `src/components/dating/intake/intakeSchemas.ts` | Add `open_to_partner_children` optional field; allow multi-value `target_gender` |
| `src/components/dating/intake/steps/BasicsStep.tsx` | "Gender Identity" label; bio char counter; multi-select gender preference chips; age range note; location edit button; social verification tooltip |
| `src/components/dating/intake/steps/FamilyStep.tsx` | "Prefer not to say" options; new open-to-partner-children question |
| `src/components/dating/intake/steps/HabitsStep.tsx` | Drug use textarea → Select dropdown; Substance Use group header; diet note |
| `src/components/dating/intake/steps/ReviewStep.tsx` | Full collapsible accordion summary; 24-48hr review note |
