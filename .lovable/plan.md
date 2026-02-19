
## Fix 6 Issues: Auth UX, Bio Validation, Onboarding Pre-fill, Age Input, Photo Validation & Submit Confirmation

### Overview
This plan addresses 6 distinct issues across the auth signup flow (`AuthPage.tsx`) and the portal onboarding (`PortalOnboarding.tsx` + its step components), plus 2 TypeScript build errors in admin pages.

---

### Issue 0 (Build Errors) — Fix `heading` → `title` in AdminApplications & AdminSecurityDashboard

**Root cause:** `EmptyState` in `src/components/ui/empty-state.tsx` uses the prop name `title` (line 6), but both admin pages are passing `heading` instead.

**Fix in `src/pages/admin/AdminApplications.tsx`** — lines 344-348, 360-364, 375-379: rename `heading=` → `title=`

**Fix in `src/pages/admin/AdminSecurityDashboard.tsx`** — line 269: rename `heading=` → `title=`

No component changes needed; only the call sites need updating.

---

### Issue 1 — "Lowercase" Error Shown on Submit, Not While Typing

**Location:** `src/pages/AuthPage.tsx` around line 822–826.

**Current behavior:** The `PasswordInput` component renders the requirements checklist live as the user types (the checklist with green/red checks). However, the error message from `validatePasswordField` only shows if `passwordTouched` is true, which only becomes true `onBlur`. The screenshot shows the error message _above_ the form in a red banner on submit.

**What the user wants:** The checklist items (which are already in `PasswordInput` with `showStrengthIndicator={mode === 'signup'}`) should show immediately when they start typing — **not** waiting for blur. The requirements checklist already renders while typing because `value.length > 0` triggers it in `PasswordInput`. The issue is specifically the red banner error message: it fires on submit only.

**Fix:** In `handlePasswordChange`, remove the `passwordTouched` guard so `validatePasswordField` is always called on each keystroke during signup:

```typescript
// Current (only validates if touched):
if (passwordTouched && mode === 'signup') {
  validatePasswordField(value);
}

// Fixed (always validate while typing in signup):
if (mode === 'signup') {
  validatePasswordField(value);
}
```

This makes the inline `error` prop on `PasswordInput` show the specific failing requirement as soon as the user types. The checklist already shows; this just also populates the error text immediately.

---

### Issue 2 — Bio Character Count Color (Red < 50, Green ≥ 50)

**Location:** `src/components/portal/onboarding/ProfessionalStep.tsx` line 125.

**Current:** Character count is always `text-muted-foreground/60` (dim gray).

**Fix:** Apply conditional color class based on bio length:

```tsx
// Current:
<p className="text-muted-foreground/60 text-xs mt-1">{bio.length}/50 characters minimum</p>

// Fixed:
<p className={`text-xs mt-1 transition-colors ${bio.length >= 50 ? 'text-green-400' : 'text-red-400'}`}>
  {bio.length}/50 characters minimum
</p>
```

Also make the Textarea border itself reflect the state in real-time (not just on bioError):

```tsx
className={`... ${bio.length > 0 && bio.length < 50 ? 'border-red-500/50' : bio.length >= 50 ? 'border-green-500/50' : 'border-border'}`}
```

---

### Issue 3 — Pre-fill Name from Signup on Onboarding Step 1

**Location:** `src/pages/portal/PortalOnboarding.tsx` line 80-108 (the profile pre-fill `useEffect`).

**Context:** When a user signs up in `AuthPage.tsx` at step 1, they enter `firstName` and `lastName`. These get saved to the profile via `handleFinalSubmit` (line 551-564) only at the _end_ of the multi-step signup. However, there is a faster path: at `handleStep1Submit` (line 426+), for the new direct-to-onboarding flow, the user's name is collected on the signup form.

**Root cause:** The `signUp(email, password)` call in `handleStep1Submit` creates the auth user and the trigger creates a `profiles` row — but `first_name`/`last_name` are not written to `profiles` at this point. The profile pre-fill in `PortalOnboarding` reads from `profile.first_name` / `profile.last_name` but these are empty because the name was never saved during the initial step.

**Fix — two-part:**

1. In `AuthPage.tsx` `handleStep1Submit`, after successful `signUp`, immediately update the profile with the first/last name:

```typescript
// After signUp succeeds and before navigate('/portal/onboarding'):
const { data: { session } } = await supabase.auth.getSession();
if (session?.user && firstName && lastName) {
  await supabase.from('profiles').update({
    first_name: firstName,
    last_name: lastName,
  }).eq('id', session.user.id);
}
```

2. The `PortalOnboarding.tsx` already reads `profile.first_name` and `profile.last_name` in its pre-fill `useEffect` at line 82-83, so once the profile has these values, they will populate automatically. No changes needed there.

---

### Issue 4 — Age Input Instead of Date of Birth

**Location:** `src/components/portal/onboarding/InterestsStep.tsx` (lines 46-56) and `src/pages/portal/PortalOnboarding.tsx`.

**Context:** The DB column is `date_of_birth` (date type). We want to show an age number input to the user but still validate they are 21+, without collecting an exact birth date.

**Approach:** Replace the `date` input with a simple number input asking "How old are you?" Store it by computing an approximate date of birth (Jan 1 of the birth year = `currentYear - age`). This keeps DB compatibility while avoiding the perception of collecting a precise birthday.

**Changes to `InterestsStep.tsx`:**
- Replace `dateOfBirth`/`setDateOfBirth` props with `age`/`setAge` (number | string)
- Change the date input to:
```tsx
<Label>How old are you? (21+ required)</Label>
<Input
  type="number"
  min="21"
  max="100"
  placeholder="e.g. 28"
  value={age}
  onChange={(e) => setAge(e.target.value)}
/>
{age && Number(age) < 21 && (
  <p className="text-destructive text-xs mt-1">You must be 21 or older to join</p>
)}
```

**Changes to `PortalOnboarding.tsx`:**
- Replace `dateOfBirth` / `setDateOfBirth` state with `age` / `setAge`
- In `validateStep` case 4: check `Number(age) < 21` instead of calling `calculateAge()`
- In `saveProgress` and `handleComplete`: compute `date_of_birth: age ? `${new Date().getFullYear() - Number(age)}-01-01` : null`
- Remove `calculateAge` helper function
- Pre-fill: derive `age` from `profile.date_of_birth` on load using `calculateAge`

**Interface update for `InterestsStep`:** Change prop types from `dateOfBirth: string` / `setDateOfBirth` to `age: string` / `setAge`.

---

### Issue 5 — Require Real Person Photos (Reject AI/Non-Human Images)

**Location:** `src/pages/portal/PortalOnboarding.tsx` — `handlePhotoSelect` and `handleCropComplete`.

**Approach:** After the user selects a photo but _before_ uploading to storage, call the Lovable AI (`google/gemini-2.5-flash`) to analyze the image and determine if it contains a real human face. If the image appears AI-generated or doesn't show a real person, reject it with a clear error message.

**How it works:**
1. In `handlePhotoSelect`, after creating the blob URL, convert the file to base64
2. Call the AI gateway with a prompt: `"Does this image show a real photograph of a real human person? Answer only: REAL_PERSON or NOT_REAL_PERSON. Reject if: AI generated, cartoon, avatar, animal, object, or no face visible."`
3. If response is `NOT_REAL_PERSON`, show an error toast and stop the flow
4. If `REAL_PERSON`, proceed to the image cropper as before

**New state:** `[isValidatingPhoto, setIsValidatingPhoto] = useState(false)`

**Error messages to show:**
- AI-generated/not a real person: `"Please upload a real photo of yourself. AI-generated images, avatars, and non-human photos are not accepted."`

**Note:** The photo will be used for identity verification (OSINT) purposes — this is already by design in the app. No changes needed to communicate this; the existing upload note can be updated to mention it is for member identity verification.

**Update upload note text** in `BasicInfoStep.tsx` line 116:
```
"Upload a real photo of yourself for identity verification. AI-generated images will be rejected."
```

**Implementation in `PortalOnboarding.tsx`:**
```typescript
const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  // ... existing size check ...
  
  setIsValidatingPhoto(true);
  
  // Convert to base64 for AI check
  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64 = event.target?.result as string;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Does this image show a real photograph of a real human person? Answer ONLY with: REAL_PERSON or NOT_REAL_PERSON. Say NOT_REAL_PERSON if the image is AI-generated, a cartoon, an avatar, an animal, an object, or has no visible human face.' },
              { type: 'image_url', image_url: { url: base64 } }
            ]
          }],
        }),
      });
      
      const aiData = await response.json();
      const answer = aiData?.choices?.[0]?.message?.content?.trim();
      
      if (answer !== 'REAL_PERSON') {
        toast.error('Please upload a real photo of yourself. AI-generated images, avatars, and non-human photos are not accepted.');
        setIsValidatingPhoto(false);
        return;
      }
      
      // Proceed with cropper
      const imageUrl = URL.createObjectURL(file);
      setCropperImage(imageUrl);
      setPendingFile(file);
    } catch (err) {
      // If AI check fails, allow upload (fail open for UX)
      console.error('Photo validation failed:', err);
      const imageUrl = URL.createObjectURL(file);
      setCropperImage(imageUrl);
      setPendingFile(file);
    } finally {
      setIsValidatingPhoto(false);
    }
  };
  reader.readAsDataURL(file);
};
```

**`BasicInfoStep.tsx`:** Add `isValidatingPhoto` prop and show a spinner/message while the check runs.

---

### Issue 6 — Submit Button: Success Message + Confirmation Email

There are **two** submission flows to fix:

**Flow A: `AuthPage.tsx` `handleFinalSubmit` (the 3-step signup in `AuthPage`)**

Currently: After success, it navigates to `/portal/onboarding` silently.

**Fix:**
- After the profile update and waitlist insert succeed, call `supabase.functions.invoke('send-profile-notification', { body: { user_id: session.user.id, notification_type: 'account_created' } })`
- Show `setFormSuccess('🎉 Account created! Welcome to MakeFriends & Socialize. Check your email for a confirmation.')` before navigating
- Add a new notification type `"account_created"` to the `send-profile-notification` edge function with a branded welcome email

**Flow B: `PortalOnboarding.tsx` `handleComplete` (the full 5-step portal onboarding)**

Currently: After success, `toast.success('Profile completed! Your application is being reviewed.')` and navigates to `/auth/waiting`.

**Fix:**
- After the profile and application insert succeed, call `send-profile-notification` with `notification_type: 'profile_complete'` (this type already exists and sends the "Congratulations! Your Profile is Complete" email)
- Add an inline success state: show a brief "✅ Application submitted! Check your email for confirmation." message (using `setFormSuccess` or a local `submitted` state) visible for 1-2 seconds before navigating

**Edge Function Update — `send-profile-notification`:**
Add a new `"account_created"` notification type:
```typescript
} else if (notification_type === "account_created") {
  subject = "Welcome to Make Friends and Socialize! 🎉";
  htmlContent = `...branded welcome email with name pre-filled...`;
}
```

---

### Files Modified

| File | Change |
|---|---|
| `src/pages/admin/AdminApplications.tsx` | Fix `heading` → `title` (build error, 3 locations) |
| `src/pages/admin/AdminSecurityDashboard.tsx` | Fix `heading` → `title` (build error, 1 location) |
| `src/pages/AuthPage.tsx` | Issue 1: validate password on keystroke; Issue 3: save name after signUp; Issue 6: send account_created email + show success message |
| `src/components/portal/onboarding/ProfessionalStep.tsx` | Issue 2: bio char count color red/green |
| `src/components/portal/onboarding/InterestsStep.tsx` | Issue 4: replace date-of-birth with age number input |
| `src/components/portal/onboarding/BasicInfoStep.tsx` | Issue 5: add `isValidatingPhoto` prop, update helper text |
| `src/pages/portal/PortalOnboarding.tsx` | Issue 4: age state; Issue 5: AI photo validation logic; Issue 6: call send-profile-notification on complete |
| `supabase/functions/send-profile-notification/index.ts` | Issue 6: add `account_created` email type |

### Technical Notes
- The AI photo validation uses the Lovable AI gateway (no extra API key needed) with `google/gemini-2.5-flash` multimodal vision. It fails open — if the AI gateway is unavailable, the photo upload proceeds normally so users aren't blocked.
- The age-to-date conversion stores `YYYY-01-01` in the `date_of_birth` column, keeping DB schema unchanged. No migration needed.
- Password real-time validation: removing the `passwordTouched` guard means the checklist in `PasswordInput` and the `error` text will both show immediately while typing — matching how real-world apps like Google and Apple handle password fields.
