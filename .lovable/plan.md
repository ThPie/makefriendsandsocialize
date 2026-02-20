
## Dating Intake Submit: Success State + AI Dating Coach Email

### The Problem

When the user clicks "Submit Application" on Step 8, the `submit()` function in `useIntakeForm.ts` does insert the profile to the DB correctly — but then it immediately calls `navigate('/portal')`, whisking the user away before they see any confirmation. There is no success screen, no celebratory moment, and no email is sent at submission time.

The existing `send-dating-notification` edge function only handles *post-vetting* events (vetted, new_match, meeting_scheduled, etc.) via the `notification_queue` table. There is **no "application received" confirmation email** sent at submit time.

### What We're Building

1. **Success Screen in `IntakeWizard`** — After submit, instead of immediately navigating away, show a beautiful full-page success state with:
   - Animated heart/checkmark
   - "Application Received" heading
   - "Be patient" message + 24–48h review timeline
   - AI-generated personalized motivational message (from the dating coach)
   - A link to a dating-related resource/blog article

2. **New edge function: `send-dating-application-email`** — A dedicated function that:
   - Accepts `{ userId, displayName, userEmail }` 
   - Calls the Lovable AI Gateway to generate a personalized dating coach message (2–3 sentences) tailored to the user's name
   - Sends a beautifully styled HTML email via Resend with: confirmation + AI coaching message + blog/resource link

3. **Wire up the email call in `useIntakeForm.ts`** — After the DB insert succeeds, fire-and-forget the new edge function (like how `preprocess-dating-profile` is already called), and set a local state `isSubmitted = true` instead of navigating away.

4. **Replace `navigate('/portal')` with `setIsSubmitted(true)`** — The wizard shows the success view instead of redirecting.

---

### Architecture

```text
User clicks "Submit Application"
        ↓
submit() in useIntakeForm.ts
        ↓
INSERT into dating_profiles ✅ (already works)
        ↓
[fire-and-forget] supabase.functions.invoke('preprocess-dating-profile') ← already exists
[fire-and-forget] supabase.functions.invoke('send-dating-application-email') ← NEW
        ↓
setIsSubmitted(true)  ← instead of navigate('/portal')
        ↓
IntakeWizard renders <SuccessView /> component
```

```text
send-dating-application-email edge function:
        ↓
Fetch user email from auth.admin.getUserById(userId)
        ↓
Call Lovable AI Gateway (google/gemini-3-flash-preview)
  → Prompt: "You are a warm dating coach. Write 2-3 sentences of 
     personalized encouragement for {name} who just submitted their 
     intentional connections application. Be warm, specific, hopeful."
        ↓
Send via Resend from dating@makefriendsandsocialize.com
  → Branded dark-green/gold email template
  → AI coaching message embedded
  → "While you wait, read this:" → link to article on intentional dating
        ↓
Return { success: true }
```

---

### Files to Create

#### `supabase/functions/send-dating-application-email/index.ts` (NEW)

Purpose: Send a confirmation + AI dating coach email immediately after application submission.

Key logic:
```typescript
// 1. Get user email from Supabase Auth (service role)
const { data: userData } = await supabase.auth.admin.getUserById(userId);
const userEmail = userData.user.email;

// 2. Generate AI coaching message
const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: "You are a warm, thoughtful dating coach..." },
      { role: "user", content: `Write 2-3 sentences of personalized encouragement for ${displayName}...` }
    ]
  })
});
const coachingMessage = aiResult.choices[0].message.content;

// 3. Send email via Resend
await resend.emails.send({
  from: "Intentional Connections <dating@makefriendsandsocialize.com>",
  to: [userEmail],
  subject: "Your Application is In — What Happens Next 💫",
  html: getApplicationReceivedEmailHtml(displayName, coachingMessage)
});
```

The HTML email template (`getApplicationReceivedEmailHtml`) will use:
- **Header**: Dark forest green (`#0a2118`) with gold accent, heart icon, "Application Received"
- **Greeting**: "Dear {displayName}, congratulations on taking this step."  
- **Timeline box**: Dark green card → "Our team reviews within 24–48 hours"
- **AI Coach Message**: Cream/warm background box, italic quote style, labeled "A note from your dating coach"
- **Resource Link**: Gold CTA button → links to a thoughtful external article (e.g. `https://www.gottman.com/blog/intentional-dating/`) with label "Read: The Art of Intentional Dating"
- **Footer**: "With warmth, The Intentional Connections Team"

---

### Files to Modify

#### `src/components/dating/intake/useIntakeForm.ts`

Two changes in the `submit()` function (lines 472–599):

1. **Add `isSubmitted` state** at the top of the hook alongside `isSubmitting`:
   ```typescript
   const [isSubmitted, setIsSubmitted] = useState(false);
   ```

2. **Replace `navigate('/portal')` with `setIsSubmitted(true)`** and add the email edge function call fire-and-forget:
   ```typescript
   // After successful insert:
   setIsSubmitted(true); // ← instead of navigate('/portal')
   
   // Fire-and-forget the confirmation email
   supabase.functions.invoke('send-dating-application-email', {
     body: { userId: user.id, displayName: formData.display_name }
   }).catch(err => console.error('Confirmation email error:', err));
   ```

3. **Expose `isSubmitted`** in the return object.

#### `src/components/dating/intake/IntakeWizard.tsx`

Add a success screen that renders when `form.isSubmitted === true`:

```tsx
if (form.isSubmitted) {
  return <SuccessView displayName={form.formData.display_name} />;
}
```

The `SuccessView` is an inline component (or a new file) that shows:
- Animated large heart icon (pulse animation using Tailwind `animate-pulse` or framer-motion)
- `"Application Received 🌿"` heading in gold
- Paragraph: "Thank you, {name}. Your profile is now under review by our matchmaking team."
- Timeline info box: "What happens next? Our team reviews your application within 24–48 hours. We'll verify your social profiles and reach out if you're a great fit."
- "Check your email — we've sent you a personalized message from your dating coach."
- A warm gold CTA button: "Return to Portal" → `navigate('/portal')`
- A secondary text link: "Read: The Art of Intentional Dating" → external link

---

### Success Screen Design

The success view matches the existing dark aesthetic (`bg-[#0a0f0b]`):

```
┌──────────────────────────────────────┐
│                                      │
│         ♥  (large, gold, pulsing)    │
│                                      │
│    Application Received              │
│    (gold, font-display, h2)          │
│                                      │
│  "Thank you, {name}. Your profile    │
│  is now in the hands of our          │
│  matchmaking team."                  │
│                                      │
│  ┌─────────────────────────────┐     │
│  │ ⏱ What Happens Next?        │     │
│  │ • Review: 24–48 hours       │     │
│  │ • Social verification       │     │
│  │ • Brief consultation call   │     │
│  └─────────────────────────────┘     │
│                                      │
│  📧 Check your inbox — your dating   │
│  coach has sent you a message.       │
│                                      │
│  [  Return to Portal  ]  (gold btn)  │
│                                      │
│  Read: The Art of Intentional Dating │
│  (small text link, muted gold)       │
│                                      │
└──────────────────────────────────────┘
```

---

### Config Change

Add to `supabase/config.toml`:
```toml
[functions.send-dating-application-email]
verify_jwt = true
```

---

### Summary of All Changes

| File | Type | Change |
|---|---|---|
| `supabase/functions/send-dating-application-email/index.ts` | NEW | Edge function: AI coach message + Resend confirmation email |
| `supabase/config.toml` | MODIFY | Register new edge function with `verify_jwt = true` |
| `src/components/dating/intake/useIntakeForm.ts` | MODIFY | Add `isSubmitted` state; replace `navigate` with `setIsSubmitted(true)`; fire email edge function |
| `src/components/dating/intake/IntakeWizard.tsx` | MODIFY | Render `<SuccessView>` when `isSubmitted`; add success state UI |

### No database schema changes required.
