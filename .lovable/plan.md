
# Fix Password Reset "Blank Page" Issue

## Problem Identified

The password reset page is experiencing a **race condition** that causes users to see a blank page or an incorrect error state after clicking their reset link.

### Root Cause Analysis

When a user clicks the password reset link from their email:

1. The page loads and immediately runs `checkExistingSession()` with a 500ms delay
2. Simultaneously, Supabase processes the tokens from the URL hash and fires auth events
3. **The bug**: The `checkExistingSession` function captures `hasValidSession` in a closure at the time the `useEffect` runs (when it's `false`), so even if `onAuthStateChange` sets it to `true`, the check on line 64 still sees `false`
4. This causes the error message to be set prematurely, resulting in the "Link Expired" state being shown incorrectly

### What the User Experienced

```text
User clicks reset link
        ↓
Page shows "Verifying reset link..."
        ↓
Supabase fires PASSWORD_RECOVERY event (sets hasValidSession = true)
        ↓
checkExistingSession runs (but still sees hasValidSession = false from closure)
        ↓
Sets errorMessage = "Invalid or expired reset link"
        ↓
Page shows error state OR briefly shows form then goes blank
```

---

## Solution

Fix the race condition by using a `ref` to track state that needs to be read inside the async callback, and improve the timing logic.

### Technical Changes

**File: `src/pages/ResetPasswordPage.tsx`**

1. **Add a `useRef` to track session validity** - Refs persist across renders and don't have closure issues:
   ```typescript
   const hasValidSessionRef = useRef(false);
   ```

2. **Update the auth listener** to set both state and ref:
   ```typescript
   if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
     hasValidSessionRef.current = true;
     setHasValidSession(true);
     setIsLoading(false);
   }
   ```

3. **Fix the `checkExistingSession` function** to check the ref instead of the stale closure variable:
   ```typescript
   const checkExistingSession = async () => {
     // Give more time for Supabase to process tokens
     await new Promise(resolve => setTimeout(resolve, 1000));
     
     // Check the ref, not the state variable
     if (hasValidSessionRef.current) {
       return; // Already handled by auth listener
     }
     
     const { data: { session } } = await supabase.auth.getSession();
     
     if (session) {
       hasValidSessionRef.current = true;
       setHasValidSession(true);
     } else {
       setErrorMessage('Invalid or expired reset link. Please request a new one.');
     }
     setIsLoading(false);
   };
   ```

4. **Increase the timeout** from 500ms to 1000ms to give Supabase more time to process the URL hash tokens

5. **Add an early return** in `checkExistingSession` if the auth listener already handled the session

---

## Summary of Changes

| What | Why |
|------|-----|
| Add `useRef` for session tracking | Avoids stale closure issue in async callbacks |
| Check ref instead of state in async function | Ensures we see the latest value |
| Increase timeout to 1000ms | Gives Supabase more time to process tokens |
| Add early return check | Prevents overwriting valid session with error |

This fix ensures the password reset flow works reliably, allowing users to set their new password after clicking the email link.
