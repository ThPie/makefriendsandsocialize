

# Fix Password Reset Blank Page - Redirect to Home First

## Problem Summary

The `/auth/reset-password` page shows a blank screen on the published host (`makefriendsandsocializecom.lovable.app`) even when accessed directly without any tokens. This suggests the page itself is failing to render—possibly due to a build or bundle issue specific to that route on the published site.

However, `/auth` works fine, which confirms that React, routing, and the Supabase client are functional.

## New Strategy (Based on Your Preference)

Since you want the reset link to land on the **home page first**, we'll change the flow to:

1. Password reset emails redirect to `/` (home page) with the recovery tokens in the hash
2. The app detects the `PASSWORD_RECOVERY` auth event at the root level
3. After the session is established, automatically navigate to `/auth/reset-password`
4. The reset page now has a valid session and can show the password form

This approach:
- Avoids the problematic deep link to `/auth/reset-password`
- Ensures the app is fully loaded before attempting recovery
- Uses the working home page as the entry point

---

## Implementation Plan

### File 1: `src/pages/ForgotPasswordPage.tsx`

**Change:** Update `getPasswordResetRedirectTo()` to redirect to the home page instead of `/auth/reset-password`.

```typescript
// Before
return `${getPublishedHost()}/auth/reset-password`;

// After  
return `${getPublishedHost()}/`;  // Land on home, let AuthContext handle recovery
```

---

### File 2: `src/contexts/AuthContext.tsx`

**Change:** Add detection for `PASSWORD_RECOVERY` event and expose a flag so components can react.

```typescript
// Add state
const [isRecoveryMode, setIsRecoveryMode] = useState(false);

// In onAuthStateChange callback
if (event === 'PASSWORD_RECOVERY') {
  setIsRecoveryMode(true);
}

// Expose in context
return (
  <AuthContext.Provider value={{ ..., isRecoveryMode }}>
```

---

### File 3: `src/App.tsx`

**Change:** Add a wrapper component that:
1. Listens for `isRecoveryMode` from `AuthContext`
2. Automatically navigates to `/auth/reset-password` when recovery is detected
3. Uses `useNavigate` inside `BrowserRouter` to handle the redirect

```typescript
function RecoveryRedirectHandler() {
  const { isRecoveryMode } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isRecoveryMode) {
      navigate('/auth/reset-password');
    }
  }, [isRecoveryMode, navigate]);
  
  return null;
}

// Add <RecoveryRedirectHandler /> inside BrowserRouter
```

---

### File 4: `src/pages/ResetPasswordPage.tsx`

**Change:** Simplify the session detection logic since the user will now arrive with an already-established session (from the recovery flow that happened on the home page).

The page can now:
1. Check if there's an existing session immediately
2. If yes, show the password form
3. If no, show the "invalid link" error

This removes the race condition complexity because the home page already processed the tokens.

---

## How It Works (Flow Diagram)

```text
User clicks reset link in email
        ↓
Link opens: https://makefriendsandsocializecom.lovable.app/#access_token=...&type=recovery
        ↓
Home page loads (this works!)
        ↓
Supabase processes hash tokens → fires PASSWORD_RECOVERY event
        ↓
AuthContext detects event → sets isRecoveryMode = true
        ↓
RecoveryRedirectHandler navigates to /auth/reset-password
        ↓
ResetPasswordPage loads with valid session → shows password form
        ↓
User enters new password → success!
```

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Entry point | Broken `/auth/reset-password` | Working `/` home page |
| Token processing | On reset page (race condition) | On home page (stable) |
| Session state | Uncertain timing | Already established |
| User experience | Blank page | Smooth redirect |

---

## Files to Modify

1. `src/pages/ForgotPasswordPage.tsx` - Change redirect URL to `/`
2. `src/contexts/AuthContext.tsx` - Add `isRecoveryMode` state and detection
3. `src/App.tsx` - Add `RecoveryRedirectHandler` component
4. `src/pages/ResetPasswordPage.tsx` - Simplify session detection logic

---

## Verification Steps

After implementation:
1. Request a **new** password reset email from the published site
2. Click the link in the email
3. You should land on the home page briefly, then be redirected to the reset form
4. Enter your new password and confirm it works

